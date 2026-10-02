import { describe, it, expect } from "vitest";
import { freshDb } from "./setup";
import { registerUser } from "@/server/services/authService";
import {
  recordAcademySection,
  submitAcademyQuiz,
  submitAcademyModuleTest,
  gradeAcademyQuiz,
  getAcademyModuleState,
  resumeLessonId,
  lessonMasteryPcts,
  MODULE_1_ID,
} from "@/server/services/academyProgress";
import { LESSON_QUIZZES } from "@/content/academy/module-1/questions";
import { MODULE_TEST, MODULE_TEST as TEST } from "@/content/academy/module-1/module-test";
import { LESSONS } from "@/content/academy/module-1/lessons";
import { MODULE_TEST_PASS_THRESHOLD } from "@/content/academy/module-1/module";
import type { AcademyQuestion } from "@/content/academy/types";

async function makeUser(db: Awaited<ReturnType<typeof freshDb>>, email = "academy@test.dev") {
  const r = await registerUser(db, { email, displayName: "Academy Tester", password: "password123" });
  if (!r.ok) throw new Error(r.error);
  return r.user;
}

/** Build a perfect answer set for a quiz (server content is the source of truth). */
function perfectAnswers(questions: AcademyQuestion[]): number[][] {
  return questions.map((q) => (q.kind === "mcq" ? [q.correct] : [...q.correct]));
}

function wrongAnswers(questions: AcademyQuestion[]): number[][] {
  return questions.map((q, i) => {
    if (i === 0) return [0]; // deliberately may be wrong
    const correct = q.kind === "mcq" ? q.correct : q.correct[0]!;
    return [correct];
  });
}

const L1 = LESSONS[0]!; // m1-l1

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

    // Everything except the quiz: checkpoints + all four FRQs.
    for (const cp of L1.checkpoints) {
      await recordAcademySection(db, user, L1.meta.id, cp.id);
    }
    for (const frq of L1.freeResponses) {
      await recordAcademySection(db, user, L1.meta.id, frq.id);
    }
    let row = await db.table("lesson_progress").get(`${user.id}:${L1.meta.id}`);
    expect(row?.status).toBe("in_progress");
    expect(row?.sectionsDone).toHaveLength(L1.checkpoints.length + L1.freeResponses.length);

    // Passing quiz (>= 50%) completes the lesson and banks 50 XP once.
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l1")!;
    const pass = await submitAcademyQuiz(db, user, quiz.id, perfectAnswers(quiz.questions));
    expect(pass.ok).toBe(true);
    expect(pass.lessonXp?.awarded).toBe(50);

    row = await db.table("lesson_progress").get(`${user.id}:${L1.meta.id}`);
    expect(row?.status).toBe("completed");
    expect(row?.quizBest).toBe(100);

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

  it("a below-50% quiz does NOT complete the lesson", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l1")!;
    const allWrong = quiz.questions.map(() => [999]); // every answer invalid -> wrong
    const res = await submitAcademyQuiz(db, user, quiz.id, allWrong);
    expect(res.ok).toBe(true);
    expect(res.pct).toBe(0);
    const row = await db.table("lesson_progress").get(`${user.id}:m1-l1`);
    expect(row?.status).toBe("in_progress");
    expect(row?.sectionsDone).not.toContain("m1-l1-quiz");
    expect(res.lessonXp ?? null).toBeNull();
  });

  it("tracks the best quiz score across retries without re-awarding lesson XP", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const lesson2 = LESSONS.find((l) => l.meta.id === "m1-l2")!;
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l2")!;
    for (const cp of lesson2.checkpoints) {
      await recordAcademySection(db, user, lesson2.meta.id, cp.id);
    }
    for (const frq of lesson2.freeResponses) {
      await recordAcademySection(db, user, lesson2.meta.id, frq.id);
    }
    // First attempt passes (5/6) - completing the lesson banks the 50 XP here.
    const bad = await submitAcademyQuiz(db, user, quiz.id, wrongAnswers(quiz.questions));
    expect(bad.pct!).toBeLessThan(100);
    expect(bad.pct!).toBeGreaterThanOrEqual(50);
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
    const res = await submitAcademyModuleTest(db, user, [[0]]);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Answer count mismatch");
  });

  it("module mastery rises with lessons + test score", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    // Complete lesson 1 fully (checkpoints + FRQs + perfect quiz).
    for (const cp of L1.checkpoints) {
      await recordAcademySection(db, user, L1.meta.id, cp.id);
    }
    for (const frq of L1.freeResponses) {
      await recordAcademySection(db, user, L1.meta.id, frq.id);
    }
    const quiz = LESSON_QUIZZES.find((q) => q.id === "quiz-m1-l1")!;
    await submitAcademyQuiz(db, user, quiz.id, perfectAnswers(quiz.questions));

    const pcts = await lessonMasteryPcts(db, user.id);
    expect(pcts[0]).toBe(100);
    expect(pcts.slice(1).every((p) => p === 0)).toBe(true);

    const withTest = await submitAcademyModuleTest(db, user, perfectAnswers(MODULE_TEST.questions));
    expect(withTest.masteryPct!).toBe(Math.round(0.7 * (100 / 8) + 0.3 * 100));
  });
});

describe("progress isolation + reads", () => {
  it("users only ever see and mutate their own rows", async () => {
    const db = await freshDb();
    const a = await makeUser(db, "a@test.dev");
    const b = await makeUser(db, "b@test.dev");

    await recordAcademySection(db, a, "m1-l1", "m1-l1-cp1");
    await submitAcademyModuleTest(db, a, perfectAnswers(TEST.questions));

    const stateA = await getAcademyModuleState(db, a.id);
    const stateB = await getAcademyModuleState(db, b.id);
    expect(stateA.lessonProgress).toHaveLength(1);
    expect(stateB.lessonProgress).toHaveLength(0);
    expect(stateA.moduleResult?.passed).toBe(true);
    expect(stateB.moduleResult).toBeNull();

    // B completing the same lesson must not touch A's rows.
    await recordAcademySection(db, b, "m1-l1", "m1-l1-cp1");
    const rows = await db.table("lesson_progress").find({ moduleId: MODULE_1_ID });
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((r) => r.userId)).size).toBe(2);
  });

  it("resume points at the most recently active in-progress lesson", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await recordAcademySection(db, user, "m1-l1", "m1-l1-cp1");
    await recordAcademySection(db, user, "m1-l3", "m1-l3-cp1");
    const state = await getAcademyModuleState(db, user.id);
    expect(resumeLessonId(state)).toBe("m1-l3");
  });

  it("pass threshold is 80 and module test id is stable", async () => {
    expect(MODULE_TEST_PASS_THRESHOLD).toBe(80);
    expect(MODULE_TEST.id).toBe("m1-module-test");
    expect(MODULE_TEST.questions.length).toBe(20);
  });
});
