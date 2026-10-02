import { describe, it, expect } from "vitest";
import { freshDb } from "./setup";
import type { Db } from "@/server/db/db";
import { registerUser } from "@/server/services/authService";
import type { User } from "@/lib/types";
import {
  recordAcademySection,
  submitAcademyQuiz,
  submitAcademyModuleTest,
  gradeAcademyQuiz,
  getAcademyModuleState,
  resumeLessonId,
  lessonMasteryPcts,
  lessonNavItems,
  firstIncompleteLessonId,
  MODULE_1_ID,
} from "@/server/services/academyProgress";
import { LESSON_QUIZZES } from "@/content/academy/module-1/questions";
import { MODULE_TEST, MODULE_TEST as TEST } from "@/content/academy/module-1/module-test";
import { LESSONS } from "@/content/academy/module-1/lessons";
import { MODULE_TEST_PASS_THRESHOLD, LESSON_MASTERY_THRESHOLD } from "@/content/academy/module-1/module";
import type { AcademyQuestion, AcademyLesson } from "@/content/academy/types";

async function makeUser(db: Awaited<ReturnType<typeof freshDb>>, email = "academy@test.dev") {
  const r = await registerUser(db, { email, displayName: "Academy Tester", password: "password123" });
  if (!r.ok) throw new Error(r.error);
  return r.user;
}

/** Build a perfect answer set for a quiz (server content is the source of truth). */
function perfectAnswers(questions: AcademyQuestion[]): number[][] {
  return questions.map((q) => (q.kind === "mcq" ? [q.correct] : [...q.correct]));
}

const L1 = LESSONS[0]!; // m1-l1
const L2 = LESSONS[1]!; // m1-l2

/** Record every required non-quiz step of a lesson (checkpoints, sheet, refs, FRQs). */
async function recordReadSteps(db: Db, user: User, lesson: AcademyLesson) {
  for (const cp of lesson.checkpoints) {
    await recordAcademySection(db, user, lesson.meta.id, cp.id);
  }
  await recordAcademySection(db, user, lesson.meta.id, `${lesson.meta.id}-sheet`);
  await recordAcademySection(db, user, lesson.meta.id, `${lesson.meta.id}-refs`);
  for (const frq of lesson.freeResponses) {
    await recordAcademySection(db, user, lesson.meta.id, frq.id);
  }
}

/** Fully complete one lesson in order: read steps + a perfect quiz pass. */
async function completeLesson(db: Db, user: User, lesson: AcademyLesson) {
  await recordReadSteps(db, user, lesson);
  const quiz = LESSON_QUIZZES.find((q) => q.id === lesson.quizId)!;
  const res = await submitAcademyQuiz(db, user, quiz.id, perfectAnswers(quiz.questions));
  expect(res.ok).toBe(true);
  return res;
}

/** Complete all 8 lessons in teaching order (unlocks the module test). */
async function seedAllLessons(db: Db, user: User) {
  for (const lesson of LESSONS) await completeLesson(db, user, lesson);
}

describe("academy section tracking", () => {
  it("accepts valid steps and rejects unknown ones", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const ok = await recordAcademySection(db, user, "m1-l1", "m1-l1-cp1");
    expect(ok.ok).toBe(true);
    const bad = await recordAcademySection(db, user, "m1-l1", "not-a-real-step");
    expect(bad.ok).toBe(false);
    const badLesson = await recordAcademySection(db, user, "m1-l99", "m1-l1-cp1");
    expect(badLesson.ok).toBe(false);
  });

  it("completes the lesson only when every required step is done, and awards XP exactly once", async () => {
    const db = await freshDb();
    const user = await makeUser(db);

    // Checkpoints + FRQs only: not complete yet.
    for (const cp of L1.checkpoints) {
      await recordAcademySection(db, user, L1.meta.id, cp.id);
    }
    for (const frq of L1.freeResponses) {
      await recordAcademySection(db, user, L1.meta.id, frq.id);
    }
    let row = await db.table("lesson_progress").get(`${user.id}:${L1.meta.id}`);
    expect(row?.status).toBe("in_progress");
    expect(row?.sectionsDone).toHaveLength(L1.checkpoints.length + L1.freeResponses.length);

    // The two read-through sections are also required now.
    await recordAcademySection(db, user, L1.meta.id, "m1-l1-sheet");
    let mid = await recordAcademySection(db, user, L1.meta.id, "m1-l1-refs");
    expect(mid.completed).toBe(false);

    // A passing quiz (>= 80%) completes the lesson and banks 50 XP once.
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l1")!;
    const pass = await submitAcademyQuiz(db, user, quiz.id, perfectAnswers(quiz.questions));
    expect(pass.ok).toBe(true);
    expect(pass.lessonXp?.awarded).toBe(50);

    row = await db.table("lesson_progress").get(`${user.id}:${L1.meta.id}`);
    expect(row?.status).toBe("completed");
    expect(row?.quizBest).toBe(100);
    expect(row?.sectionsDone).toContain("m1-l1-sheet");
    expect(row?.sectionsDone).toContain("m1-l1-refs");

    // Re-recording sections after completion never re-awards XP.
    const again = await recordAcademySection(db, user, L1.meta.id, L1.checkpoints[0]!.id);
    expect(again.ok).toBe(true);
    expect(again.lessonXp ?? null).toBeNull();
    const u = await db.table("users").get(user.id);
    expect(u!.xpTotal).toBe(50 + (pass.xp?.awarded ?? 0));
  });

  it("optional enrichment steps never gate completion and reject unknown ids", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    // The activity is accepted (markable) but is NOT required for completion.
    const act = await recordAcademySection(db, user, L1.meta.id, `${L1.meta.id}-activity`);
    expect(act.ok).toBe(true);
    expect(act.completed).toBe(false);
    // Stale/unknown step ids are still rejected.
    const bad = await recordAcademySection(db, user, L1.meta.id, `${L1.meta.id}-freeresponse`);
    expect(bad.ok).toBe(false);
  });

  it("a quiz below the 80% mastery threshold does NOT complete the lesson", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await recordReadSteps(db, user, L1);
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l1")!;

    // Every answer invalid: 0%.
    const allWrong = await submitAcademyQuiz(db, user, quiz.id, quiz.questions.map(() => [999]));
    expect(allWrong.ok).toBe(true);
    expect(allWrong.pct).toBe(0);
    let row = await db.table("lesson_progress").get(`${user.id}:m1-l1`);
    expect(row?.status).toBe("in_progress");
    expect(row?.sectionsDone).not.toContain("m1-l1-quiz");
    expect(allWrong.lessonXp ?? null).toBeNull();

    // And a near-miss (4/6 = 67%): honest feedback, still locked.
    const answers = perfectAnswers(quiz.questions);
    answers[0] = [answers[0]![0] === 0 ? 1 : 0];
    answers[1] = [answers[1]![0] === 0 ? 1 : 0];
    const nearMiss = await submitAcademyQuiz(db, user, quiz.id, answers);
    expect(nearMiss.pct).toBeLessThan(LESSON_MASTERY_THRESHOLD);
    expect(nearMiss.pct).toBeGreaterThanOrEqual(50);
    row = await db.table("lesson_progress").get(`${user.id}:m1-l1`);
    expect(row?.status).toBe("in_progress");
    expect(row?.sectionsDone).not.toContain("m1-l1-quiz");
    expect(row?.quizBest).toBe(67);

    // But the same student can retry to 100% and then complete.
    const pass = await submitAcademyQuiz(db, user, quiz.id, perfectAnswers(quiz.questions));
    expect(pass.ok).toBe(true);
    row = await db.table("lesson_progress").get(`${user.id}:m1-l1`);
    expect(row?.status).toBe("completed");
    expect(row?.quizBest).toBe(100);
  });

  it("tracks the best quiz score across retries without re-awarding lesson XP", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await completeLesson(db, user, L1);

    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l2")!;
    await recordReadSteps(db, user, L2);
    // First attempt passes imperfectly (5/6 = 83% >= 80) - completing the
    // lesson banks the 50 XP here.
    const imperfect = perfectAnswers(quiz.questions);
    imperfect[0] = [imperfect[0]![0] === 0 ? 1 : 0];
    const bad = await submitAcademyQuiz(db, user, quiz.id, imperfect);
    expect(bad.pct!).toBeLessThan(100);
    expect(bad.pct!).toBeGreaterThanOrEqual(LESSON_MASTERY_THRESHOLD);
    expect(bad.lessonXp?.awarded).toBe(50);

    // Perfect retry: best score updates, but the lesson XP never re-awards.
    const good = await submitAcademyQuiz(db, user, quiz.id, perfectAnswers(quiz.questions));
    expect(good.quizBest).toBe(100);
    const row = await db.table("lesson_progress").get(`${user.id}:m1-l2`);
    expect(row?.quizBest).toBe(100);
    expect(row?.attempts).toBe(2);
    expect(good.lessonXp ?? null).toBeNull();
  });
});

describe("sequential locking (server-enforced)", () => {
  it("rejects progress, quizzes and the module test for locked lessons", async () => {
    const db = await freshDb();
    const user = await makeUser(db);

    // Lesson 2 is locked before Lesson 1 is completed.
    const cp = await recordAcademySection(db, user, "m1-l2", "m1-l2-cp1");
    expect(cp.ok).toBe(false);
    expect(cp.error).toBe("Lesson locked");
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l2")!;
    const q = await submitAcademyQuiz(db, user, quiz.id, perfectAnswers(quiz.questions));
    expect(q.ok).toBe(false);
    expect(q.error).toBe("Lesson locked");

    // The module test is locked until every lesson is completed.
    const test = await submitAcademyModuleTest(db, user, perfectAnswers(TEST.questions));
    expect(test.ok).toBe(false);
    expect(test.error).toBe("Module test locked");

    // Completing Lesson 1 unlocks Lesson 2's steps...
    await completeLesson(db, user, L1);
    const nowOk = await recordAcademySection(db, user, "m1-l2", "m1-l2-cp1");
    expect(nowOk.ok).toBe(true);
    // ...but Lesson 3 stays locked, and the test is still locked.
    const l3 = await recordAcademySection(db, user, "m1-l3", "m1-l3-cp1");
    expect(l3.ok).toBe(false);
    const still = await submitAcademyModuleTest(db, user, perfectAnswers(TEST.questions));
    expect(still.ok).toBe(false);
  });

  it("lessonNavItems + firstIncompleteLessonId describe the course state", async () => {
    const db = await freshDb();
    const user = await makeUser(db);

    let state = await getAcademyModuleState(db, user.id);
    let nav = lessonNavItems(state);
    expect(nav.filter((n) => n.unlocked).map((n) => n.lessonId)).toEqual(["m1-l1"]);
    expect(firstIncompleteLessonId(state)).toBe("m1-l1");

    await completeLesson(db, user, L1);
    state = await getAcademyModuleState(db, user.id);
    nav = lessonNavItems(state);
    expect(nav.find((n) => n.lessonId === "m1-l1")?.completed).toBe(true);
    expect(nav.find((n) => n.lessonId === "m1-l2")?.unlocked).toBe(true);
    expect(nav.find((n) => n.lessonId === "m1-l3")?.unlocked).toBe(false);
    expect(firstIncompleteLessonId(state)).toBe("m1-l2");
  });
});

describe("academy quiz grading (server-authoritative)", () => {
  it("grades every question type correctly and rejects count mismatches", async () => {
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l3")!;
    const perfect = gradeAcademyQuiz(quiz, perfectAnswers(quiz.questions));
    expect(perfect!.score).toBe(quiz.questions.length);
    expect(perfect!.perfect).toBe(true);

    expect(gradeAcademyQuiz(quiz, [[0]])).toBeNull(); // wrong count

    // order question: sequence equality required (quiz-m1-l6 has one)
    const orderQuiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l6")!;
    const orderQ = orderQuiz.questions.find((q) => q.kind === "order") as Extract<AcademyQuestion, { kind: "order" }>;
    const reversed = [...orderQ.correct].reverse();
    const answers = perfectAnswers(orderQuiz.questions);
    const orderIdx = orderQuiz.questions.indexOf(orderQ);
    answers[orderIdx] = reversed;
    const graded = gradeAcademyQuiz(orderQuiz, answers)!;
    expect(graded.explanations[orderIdx]!.right).toBe(false);
  });

  it("multi questions need exact set equality", async () => {
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l8")!;
    const multiQ = quiz.questions.find((q) => q.kind === "multi") as Extract<AcademyQuestion, { kind: "multi" }>;
    const answers = perfectAnswers(quiz.questions);
    const idx = quiz.questions.indexOf(multiQ);
    answers[idx] = [multiQ.correct[0]!]; // incomplete selection
    const graded = gradeAcademyQuiz(quiz, answers)!;
    expect(graded.explanations[idx]!.right).toBe(false);
  });
});

describe("module test", () => {
  it("fails below the pass threshold, records best score, awards no XP for failing", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await seedAllLessons(db, user);
    // Answer only the first 12 of 20 correctly => 60%.
    const answers = TEST.questions.map((q, i) => (i < 12 ? (q.kind === "mcq" ? [q.correct] : [...q.correct]) : [0]));
    const res = await submitAcademyModuleTest(db, user, answers);
    expect(res.ok).toBe(true);
    expect(res.pct).toBe(60);
    expect(res.passed).toBe(false);
    expect(res.xp?.awarded ?? 0).toBe(0);
    expect(res.bestScore).toBe(60);

    const row = await db.table("academy_module_results").get(`${user.id}:${MODULE_1_ID}`);
    expect(row?.passed).toBe(false);
    expect(row?.passedAt).toBeNull();
  });

  it("passes at the threshold, banks XP once, and keeps the best score across retakes", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await seedAllLessons(db, user);

    // First attempt: 60%.
    const partial = TEST.questions.map((q, i) => (i < 12 ? (q.kind === "mcq" ? [q.correct] : [...q.correct]) : [0]));
    await submitAcademyModuleTest(db, user, partial);

    // Second attempt: perfect => pass, first-pass XP.
    const perfect = await submitAcademyModuleTest(db, user, perfectAnswers(TEST.questions));
    expect(perfect.passed).toBe(true);
    expect(perfect.firstPass).toBe(true);
    expect(perfect.xp?.awarded).toBe(150);
    expect(perfect.bestScore).toBe(100);
    // Full graded feedback must be returned so the client can review answers.
    expect(perfect.explanations).toHaveLength(TEST.questions.length);
    expect(perfect.explanations!.every((e) => e.right)).toBe(true);

    const row = await db.table("academy_module_results").get(`${user.id}:${MODULE_1_ID}`);
    expect(row?.passed).toBe(true);
    expect(row?.attempts).toBe(2);
    expect(row?.passedAt).not.toBeNull();

    // Third attempt (already passed): still records best, but challenge XP decays.
    const third = await submitAcademyModuleTest(db, user, perfectAnswers(TEST.questions));
    expect(third.passed).toBe(true);
    expect(third.firstPass).toBe(false);
    expect(third.xp?.awarded).toBe(75); // repeatable challenge: 150 * 0.5 decay
  });

  it("rejects answer count mismatches", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await seedAllLessons(db, user);
    const res = await submitAcademyModuleTest(db, user, [[0]]);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Answer count mismatch");
  });

  it("module mastery rises with lessons + test score", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await seedAllLessons(db, user);

    const pcts = await lessonMasteryPcts(db, user.id);
    expect(pcts.every((p) => p === 100)).toBe(true);

    const withTest = await submitAcademyModuleTest(db, user, perfectAnswers(TEST.questions));
    expect(withTest.masteryPct).toBe(100);
  });
});

describe("progress isolation + reads", () => {
  it("users only ever see and mutate their own rows", async () => {
    const db = await freshDb();
    const a = await makeUser(db, "a@test.dev");
    const b = await makeUser(db, "b@test.dev");

    await seedAllLessons(db, a);
    await submitAcademyModuleTest(db, a, perfectAnswers(TEST.questions));
    await recordAcademySection(db, b, "m1-l1", "m1-l1-cp1");

    const stateA = await getAcademyModuleState(db, a.id);
    const stateB = await getAcademyModuleState(db, b.id);
    expect(stateA.lessonProgress).toHaveLength(LESSONS.length);
    expect(stateB.lessonProgress).toHaveLength(1);
    expect(stateA.moduleResult?.passed).toBe(true);
    expect(stateB.moduleResult).toBeNull();

    // B completing the same lesson must not touch A's rows.
    await recordAcademySection(db, b, "m1-l1", "m1-l1-cp2");
    const rows = await db.table("lesson_progress").find({ moduleId: MODULE_1_ID });
    expect(rows.filter((r) => r.lessonId === "m1-l1")).toHaveLength(2);
    expect(new Set(rows.map((r) => r.userId)).size).toBe(2);
  });

  it("resume points at the most recently active in-progress lesson", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await completeLesson(db, user, L1);
    await completeLesson(db, user, L2);
    await recordAcademySection(db, user, "m1-l3", "m1-l3-cp1");
    const state = await getAcademyModuleState(db, user.id);
    expect(resumeLessonId(state)).toBe("m1-l3");
  });

  it("pass threshold is 80 and module test id is stable", () => {
    expect(MODULE_TEST_PASS_THRESHOLD).toBe(80);
    expect(MODULE_TEST.id).toBe("m1-module-test");
    expect(MODULE_TEST.questions.length).toBe(20);
  });
});
