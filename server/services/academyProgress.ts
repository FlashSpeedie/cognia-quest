import type { Db } from "@/server/db/db";
import type { AcademyQuiz, AcademyQuestion } from "@/content/academy/types";
import { LESSONS, LESSON_QUIZZES, MODULE_TEST, lessonById } from "@/content/academy";
import { MODULE_TEST_PASS_THRESHOLD } from "@/content/academy/module-1/module";
import type { User, LessonProgress, AcademyModuleResult, QuizAttempt } from "@/lib/types";
import { newId } from "@/server/db/db";
import { awardXP, type AwardResult } from "./xp";
import { touchStreak } from "./streaks";
import { checkBadges, type BadgeCheckResult } from "./badges";
import { logActivity } from "./activity";
import { LESSON_XP, MODULE_TEST_XP, lessonMasteryPct, moduleMasteryPct } from "@/lib/academy";

/**
 * Progress + grading service for the Academy (Module 1).
 *
 * Everything here is server-authoritative:
 *  - quiz answers are graded against repo content, never trusted from the client;
 *  - lesson completion is derived from the lesson's required step ids;
 *  - XP amounts are computed here and awarded through the existing idempotent
 *    awardXP pipeline (deterministic event ids + atomic totals), so refreshes
 *    and retries can never double-award.
 */

export const MODULE_1_ID = "module-1";

// ── Grading (pure - exported for tests) ──────────────────────────────────

export interface GradedQuestion {
  qId: string;
  correct: number[];
  explanation: string;
  right: boolean;
}

export interface AcademyGradeResult {
  score: number;
  total: number;
  pct: number;
  perfect: boolean;
  explanations: GradedQuestion[];
}

/** Answer row shape arriving from the client: one number[] per question. */
export function gradeAcademyQuiz(quiz: AcademyQuiz, answers: number[][]): AcademyGradeResult | null {
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) return null;

  let score = 0;
  const explanations = quiz.questions.map((q, i) => {
    const given = answers[i] ?? [];
    const right = isAnswerCorrect(q, given);
    if (right) score++;
    return { qId: q.id, correct: questionCorrect(q), explanation: q.explanation, right };
  });

  const total = quiz.questions.length;
  return {
    score,
    total,
    pct: Math.round((score / total) * 100),
    perfect: score === total,
    explanations,
  };
}

function isAnswerCorrect(q: AcademyQuestion, given: number[]): boolean {
  switch (q.kind) {
    case "mcq": {
      const valid = given.filter((n) => Number.isInteger(n) && n >= 0 && n < q.options.length);
      return valid.length === 1 && valid[0] === q.correct;
    }
    case "multi": {
      const valid = new Set(given.filter((n) => Number.isInteger(n) && n >= 0 && n < q.options.length));
      return valid.size === q.correct.length && q.correct.every((c) => valid.has(c));
    }
    case "order": {
      const n = q.correct.length;
      if (given.length !== n) return false;
      return given.every((v, idx) => Number.isInteger(v) && v >= 0 && v < n && v === q.correct[idx]);
    }
    case "match": {
      const n = q.correct.length;
      if (given.length !== n) return false;
      return given.every((v, idx) => Number.isInteger(v) && v >= 0 && v < q.right.length && v === q.correct[idx]);
    }
  }
}

function questionCorrect(q: AcademyQuestion): number[] {
  switch (q.kind) {
    case "mcq":
      return [q.correct];
    case "multi":
      return [...q.correct].sort((a, b) => a - b);
    case "order":
      return [...q.correct];
    case "match":
      return [...q.correct];
  }
}

// ── Shared helpers ───────────────────────────────────────────────────────

function isLessonComplete(lesson: (typeof LESSONS)[number], doneSections: Set<string>): boolean {
  return lesson.requiredSectionIds.every((s) => doneSections.has(s));
}

/**
 * Shared completion edge: when a lesson first flips to completed, award the
 * one-time lesson XP, log it, and touch the streak. awardXP dedupes by
 * deterministic event id, so calling this repeatedly stays safe.
 */
async function onLessonCompletionEdge(
  db: Db,
  user: User,
  lesson: (typeof LESSONS)[number],
  wasCompleted: boolean,
  isComplete: boolean,
): Promise<AwardResult | null> {
  if (!isComplete || wasCompleted) return null;
  const xp = await awardXP(db, user, {
    sourceType: "lesson",
    sourceId: lesson.meta.id,
    baseOverride: LESSON_XP,
    note: `Academy: ${lesson.meta.title}`,
  });
  await logActivity(db, user.id, "lesson_completed", `Completed Academy lesson: ${lesson.meta.title}`);
  await touchStreak(db, user.id);
  return xp;
}

// ── Section tracking ─────────────────────────────────────────────────────

export interface AcademyActionResult {
  ok: boolean;
  error?: string;
  completed?: boolean;
  xp?: AwardResult | null;
  lessonXp?: AwardResult | null;
  badges?: BadgeCheckResult["newlyUnlocked"];
}

/**
 * Mark one of a lesson's required steps done (checkpoint answered, activity
 * completed, free response submitted). Section ids are validated against the
 * lesson's own required list, so the client can't store arbitrary markers.
 */
export async function recordAcademySection(
  db: Db,
  user: User,
  lessonId: string,
  sectionId: string,
): Promise<AcademyActionResult> {
  const lesson = lessonById(lessonId);
  if (!lesson || !lesson.requiredSectionIds.includes(sectionId)) {
    return { ok: false, error: "Unknown lesson step" };
  }

  const table = db.table("lesson_progress");
  const id = `${user.id}:${lessonId}`;
  const existing = await table.get(id);
  const done = new Set(existing?.sectionsDone ?? []);
  done.add(sectionId);
  const isComplete = isLessonComplete(lesson, done);
  const wasCompleted = existing?.status === "completed";
  const now = new Date().toISOString();

  const patch: Partial<LessonProgress> = {
    sectionsDone: [...done],
    status: isComplete ? "completed" : "in_progress",
    completedAt: isComplete ? existing?.completedAt ?? now : existing?.completedAt ?? null,
    updatedAt: now,
  };
  if (existing) {
    await table.update(id, patch);
  } else {
    await table.insert({
      id,
      userId: user.id,
      lessonId,
      moduleId: MODULE_1_ID,
      status: patch.status ?? "in_progress",
      sectionsDone: patch.sectionsDone ?? [],
      quizBest: null,
      attempts: 0,
      completedAt: patch.completedAt ?? null,
      updatedAt: now,
    });
  }

  const lessonXp = await onLessonCompletionEdge(db, user, lesson, wasCompleted, isComplete);
  return { ok: true, completed: isComplete, lessonXp };
}

// ── Lesson quiz submission ─────────────────────────────────────────────

export interface AcademyQuizResult extends AcademyActionResult {
  score?: number;
  total?: number;
  pct?: number;
  explanations?: GradedQuestion[];
  quizBest?: number | null;
  attempts?: number;
}

export async function submitAcademyQuiz(
  db: Db,
  user: User,
  quizId: string,
  answers: number[][],
): Promise<AcademyQuizResult> {
  const quiz = LESSON_QUIZZES.find((q) => q.id === quizId) ?? null;
  if (!quiz || !quiz.lessonId) return { ok: false, error: "Unknown quiz" };
  const lesson = lessonById(quiz.lessonId);
  if (!lesson) return { ok: false, error: "Unknown quiz" };

  const grade = gradeAcademyQuiz(quiz, answers);
  if (!grade) return { ok: false, error: "Answer count mismatch" };

  const attempt: QuizAttempt = {
    id: newId(),
    userId: user.id,
    quizId,
    lessonId: quiz.lessonId,
    score: grade.score,
    total: grade.total,
    answers,
    createdAt: new Date().toISOString(),
  };
  await db.table("quiz_attempts").insert(attempt);

  const table = db.table("lesson_progress");
  const id = `${user.id}:${quiz.lessonId}`;
  const existing = await table.get(id);
  const done = new Set(existing?.sectionsDone ?? []);
  if (grade.pct >= 50) done.add(`${quiz.lessonId}-quiz`);
  const isComplete = isLessonComplete(lesson, done);
  const wasCompleted = existing?.status === "completed";
  const now = new Date().toISOString();

  const patch: Partial<LessonProgress> = {
    sectionsDone: [...done],
    quizBest: Math.max(existing?.quizBest ?? 0, grade.pct),
    attempts: (existing?.attempts ?? 0) + 1,
    status: isComplete ? "completed" : "in_progress",
    completedAt: isComplete ? existing?.completedAt ?? now : existing?.completedAt ?? null,
    updatedAt: now,
  };
  if (existing) {
    await table.update(id, patch);
  } else {
    await table.insert({
      id,
      userId: user.id,
      lessonId: quiz.lessonId,
      moduleId: MODULE_1_ID,
      status: patch.status ?? "in_progress",
      sectionsDone: patch.sectionsDone ?? [],
      quizBest: patch.quizBest ?? null,
      attempts: patch.attempts ?? 1,
      completedAt: patch.completedAt ?? null,
      updatedAt: now,
    });
  }

  const lessonXp = await onLessonCompletionEdge(db, user, lesson, wasCompleted, isComplete);

  const xp = await awardXP(db, user, {
    sourceType: "quiz",
    sourceId: quizId,
    baseOverride: 25 + Math.round((grade.score / grade.total) * 50) + (grade.perfect ? 10 : 0),
    note: `${quiz.title}: ${grade.score}/${grade.total}${grade.perfect ? " (perfect)" : ""}`,
  });

  await touchStreak(db, user.id);
  const badges = await checkBadges(db, user.id);

  return {
    ok: true,
    score: grade.score,
    total: grade.total,
    pct: grade.pct,
    explanations: grade.explanations,
    quizBest: patch.quizBest ?? null,
    attempts: patch.attempts ?? 1,
    xp,
    lessonXp,
    badges: badges.newlyUnlocked,
  };
}

// ── Module test ─────────────────────────────────────────────────────────

export interface ModuleTestResult extends AcademyActionResult {
  score?: number;
  total?: number;
  pct?: number;
  explanations?: GradedQuestion[];
  passed?: boolean;
  bestScore?: number;
  attempts?: number;
  firstPass?: boolean;
  masteryPct?: number;
}

export async function submitAcademyModuleTest(
  db: Db,
  user: User,
  answers: number[][],
): Promise<ModuleTestResult> {
  const grade = gradeAcademyQuiz(MODULE_TEST, answers);
  if (!grade) return { ok: false, error: "Answer count mismatch" };

  const attempt: QuizAttempt = {
    id: newId(),
    userId: user.id,
    quizId: MODULE_TEST.id,
    lessonId: null,
    score: grade.score,
    total: grade.total,
    answers,
    createdAt: new Date().toISOString(),
  };
  await db.table("quiz_attempts").insert(attempt);

  const table = db.table("academy_module_results");
  const id = `${user.id}:${MODULE_1_ID}`;
  const existing = await table.get(id);
  const bestScore = Math.max(existing?.bestScore ?? 0, grade.pct);
  const passed = bestScore >= MODULE_TEST_PASS_THRESHOLD;
  const firstPass = passed && !(existing?.passed ?? false);

  const row: AcademyModuleResult = {
    id,
    userId: user.id,
    moduleId: MODULE_1_ID,
    bestScore,
    passed,
    attempts: (existing?.attempts ?? 0) + 1,
    passedAt: existing?.passedAt ?? (firstPass ? new Date().toISOString() : null),
    updatedAt: new Date().toISOString(),
  };
  if (existing) await table.update(id, row);
  else await table.insert(row);

  let xp: AwardResult | null = null;
  if (grade.pct >= MODULE_TEST_PASS_THRESHOLD) {
    xp = await awardXP(db, user, {
      sourceType: "challenge",
      sourceId: MODULE_TEST.id,
      baseOverride: MODULE_TEST_XP,
      note: `Module 1 test: ${grade.pct}%`,
    });
  }

  if (firstPass) {
    await logActivity(db, user.id, "module_completed", "Completed Academy Module 1: AI & Machine Learning Foundations");
  }
  await touchStreak(db, user.id);
  const badges = await checkBadges(db, user.id);

  const masteryPct = await moduleMasteryFor(db, user.id, bestScore);
  return {
    ok: true,
    score: grade.score,
    total: grade.total,
    pct: grade.pct,
    explanations: grade.explanations,
    passed: grade.pct >= MODULE_TEST_PASS_THRESHOLD,
    bestScore,
    attempts: row.attempts,
    firstPass,
    masteryPct,
    xp,
    badges: badges.newlyUnlocked,
  };
}

// ── Reads ────────────────────────────────────────────────────────────────

export interface AcademyModuleState {
  lessonProgress: LessonProgress[];
  moduleResult: AcademyModuleResult | null;
}

export async function getAcademyModuleState(db: Db, userId: string): Promise<AcademyModuleState> {
  const [rows, result] = await Promise.all([
    db.table("lesson_progress").find({ userId, moduleId: MODULE_1_ID }),
    db.table("academy_module_results").get(`${userId}:${MODULE_1_ID}`),
  ]);
  return { lessonProgress: rows, moduleResult: result };
}

/** The lesson a returning student should resume (most recent in-progress). */
export function resumeLessonId(state: AcademyModuleState): string | null {
  return (
    state.lessonProgress
      .filter((r) => r.status === "in_progress")
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0]?.lessonId ?? null
  );
}

/** Lesson mastery percentages for every Module 1 lesson, in teaching order. */
export async function lessonMasteryPcts(db: Db, userId: string): Promise<number[]> {
  const rows = await db.table("lesson_progress").find({ userId, moduleId: MODULE_1_ID });
  const byLesson = new Map(rows.map((r) => [r.lessonId, r]));
  return LESSONS.map((lesson) => {
    const row = byLesson.get(lesson.meta.id);
    return lessonMasteryPct({
      sectionsDone: row?.sectionsDone.length ?? 0,
      requiredSections: lesson.requiredSectionIds.length,
      completed: row?.status === "completed",
      quizBest: row?.quizBest ?? null,
      attempts: row?.attempts ?? 0,
    });
  });
}

/** Module mastery % using the deterministic formula in lib/academy. */
export async function moduleMasteryFor(
  db: Db,
  userId: string,
  testBestOverride?: number,
): Promise<number> {
  const pcts = await lessonMasteryPcts(db, userId);
  const testBest =
    testBestOverride ??
    (await db.table("academy_module_results").get(`${userId}:${MODULE_1_ID}`))?.bestScore ??
    null;
  return moduleMasteryPct(pcts, testBest);
}
