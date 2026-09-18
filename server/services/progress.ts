import type { Db } from "@/server/db/db";
import { lessonById, moduleBySlug, MODULES } from "@/content/modules";
import { quizById } from "@/content/quizzes";
import type { User, QuizAttempt } from "@/lib/types";
import { newId } from "@/server/db/db";
import { awardXP, type AwardResult } from "./xp";
import { touchStreak } from "./streaks";
import { checkBadges, type BadgeCheckResult } from "./badges";
import { logActivity, notify } from "./activity";
import { PERFECT_QUIZ_BONUS } from "./rules";
import { recordMissionEvent } from "./missions";

export interface ActionResult {
  ok: boolean;
  error?: string;
  xp?: AwardResult;
  badges?: BadgeCheckResult["newlyUnlocked"];
}

/** Record that a section of a lesson was finished (concept read / interactive done). */
export async function recordSection(db: Db, user: User, lessonId: string, sectionId: string): Promise<ActionResult> {
  const lesson = lessonById(lessonId);
  if (!lesson) return { ok: false, error: "Unknown lesson" };
  const table = db.table("lesson_progress");
  const id = `${user.id}:${lessonId}`;
  const existing = await table.get(id);
  const done = new Set(existing?.sectionsDone ?? []);
  done.add(sectionId);
  const allSections = lesson.sections.map((s) => s.id);
  const isComplete = allSections.every((s) => done.has(s));
  await db.tx(async () => {
    if (existing) {
      await table.update(id, {
        sectionsDone: [...done],
        status: isComplete ? "completed" : "in_progress",
        updatedAt: new Date().toISOString(),
      });
    } else {
      await table.insert({
        id,
        userId: user.id,
        lessonId,
        moduleId: lesson.moduleId,
        status: isComplete ? "completed" : "in_progress",
        sectionsDone: [...done],
        quizBest: null,
        attempts: 0,
        completedAt: null,
        updatedAt: new Date().toISOString(),
      });
    }
  });
  // Interactive widgets count as mission events (e.g. ai-or-not sorting)
  const section = lesson.sections.find((s) => s.id === sectionId);
  if (section?.kind === "interactive") {
    await recordMissionEvent(db, user, { type: "interactive", id: section.widget });
  }
  return { ok: true };
}

/**
 * Grade a quiz attempt server-side (answers validated against content —
 * the client can never claim a score), update lesson progress, award XP
 * with perfect bonus, touch streak, record mission events, check badges.
 */
export async function submitQuiz(
  db: Db,
  user: User,
  quizId: string,
  answers: number[][],
  lessonId?: string,
): Promise<ActionResult & { score?: number; total?: number; explanations?: { qId: string; correct: number[]; explanation: string; right: boolean }[] }> {
  const quiz = quizById(quizId);
  if (!quiz) return { ok: false, error: "Unknown quiz" };
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    return { ok: false, error: "Answer count mismatch" };
  }

  let score = 0;
  const explanations = quiz.questions.map((q, i) => {
    const given = new Set((answers[i] ?? []).filter((n) => Number.isInteger(n) && n >= 0 && n < q.choices.length));
    const right = q.correct.length === given.size && q.correct.every((c) => given.has(c));
    if (right) score++;
    return { qId: q.id, correct: q.correct, explanation: q.explanation, right };
  });
  const total = quiz.questions.length;
  const perfect = score === total;

  const attempt: QuizAttempt = {
    id: newId(),
    userId: user.id,
    quizId,
    lessonId: lessonId ?? null,
    score,
    total,
    answers,
    createdAt: new Date().toISOString(),
  };

  const result = await db.tx(async () => {
    await db.table("quiz_attempts").insert(attempt);

    if (lessonId) {
      const table = db.table("lesson_progress");
      const lesson = lessonById(lessonId);
      const id = `${user.id}:${lessonId}`;
      const existing = await table.get(id);
      const pct = Math.round((score / total) * 100);
      const quizSectionId = lesson?.sections.find((s) => s.kind === "quiz")?.id;
      const doneSections = new Set(existing?.sectionsDone ?? []);
      if (quizSectionId && score / total >= 0.5) doneSections.add(quizSectionId);
      const allSections = lesson?.sections.map((s) => s.id) ?? [];
      const isComplete = allSections.length > 0 && allSections.every((s) => doneSections.has(s));
      const wasCompletedBefore = existing?.status === "completed";
      if (existing) {
        await table.update(id, {
          quizBest: Math.max(existing.quizBest ?? 0, pct),
          attempts: existing.attempts + 1,
          sectionsDone: [...doneSections],
          status: isComplete ? "completed" : existing.status,
          completedAt: isComplete ? existing.completedAt ?? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await table.insert({
          id,
          userId: user.id,
          lessonId,
          moduleId: lesson?.moduleId ?? "unknown",
          status: isComplete ? "completed" : "in_progress",
          sectionsDone: [...doneSections],
          quizBest: pct,
          attempts: 1,
          completedAt: isComplete ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        });
      }
      if (isComplete && !wasCompletedBefore && lesson) {
        await logActivity(db, user.id, "lesson_completed", `Completed lesson: ${lesson.title}`);
      }
    }
    return true;
  });

  void result;
  const xp = await awardXP(db, user, {
    sourceType: "quiz",
    sourceId: quizId,
    baseOverride: 25 + Math.round((score / total) * 50) + (perfect ? PERFECT_QUIZ_BONUS : 0),
    note: `${quiz.title}: ${score}/${total}${perfect ? " (perfect)" : ""}`,
  });

  // Lesson completion XP (once) when the whole lesson is now complete
  if (lessonId) {
    const lp = await db.table("lesson_progress").get(`${user.id}:${lessonId}`);
    if (lp?.status === "completed") {
      await awardXP(db, user, { sourceType: "lesson", sourceId: lessonId, note: "Lesson complete" });
      await recordMissionEvent(db, user, { type: "lesson", id: lessonId });
    }
  }

  await touchStreak(db, user.id);
  await recordMissionEvent(db, user, { type: "quiz", id: quizId });
  const badges = await checkBadges(db, user.id);
  return { ok: true, score, total, explanations, xp, badges: badges.newlyUnlocked };
}

/** Generic learning events power mission objective tracking (spec §25). */
export { recordMissionEvent };

/** Recompute simple module card info for UI. */
export function moduleCardInfo(completedIds: Set<string>) {
  return MODULES.map((m) => {
    const total = m.lessons.length;
    const done = m.lessons.filter((l) => completedIds.has(l.id)).length;
    return { module: m, done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  });
}

export function findModuleByLessonSlug(moduleSlug: string) {
  return moduleBySlug(moduleSlug);
}
