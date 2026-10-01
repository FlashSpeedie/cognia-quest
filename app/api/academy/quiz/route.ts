import { z } from "zod";
import { json, parseBody, throttle } from "@/server/http";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { gradeAcademyQuiz, submitAcademyQuiz, submitAcademyModuleTest } from "@/server/services/academyProgress";
import { LESSON_QUIZZES, MODULE_TEST } from "@/content/academy";

/**
 * Academy quiz + module test submission.
 *
 * POST /api/academy/quiz  { quizId, answers }
 * - Grading is always server-side against repo-versioned content.
 * - Anonymous visitors receive feedback-only grading (guest mode): no
 *   persistence, no XP - progress requires an account.
 * - Signed-in students get attempts persisted, best scores tracked and XP
 *   awarded through the existing idempotent pipeline.
 */
const schema = z.object({
  quizId: z.string().min(1).max(80),
  answers: z
    .array(z.array(z.number().int().min(0).max(40)).max(12))
    .max(32),
});

export async function POST(req: Request) {
  const limited = throttle(req, "academy-quiz", 30, 60_000);
  if (limited) return limited;

  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;
  const { quizId, answers } = parsed.data;

  const isModuleTest = quizId === MODULE_TEST.id;
  const lessonQuiz = LESSON_QUIZZES.find((q) => q.id === quizId) ?? null;
  if (!isModuleTest && !lessonQuiz) return json({ error: "Unknown quiz" }, 404);

  const user = await getSessionUser();
  if (!user) {
    // Guest mode: honest feedback, nothing written.
    const quiz = isModuleTest ? MODULE_TEST : lessonQuiz!;
    const grade = gradeAcademyQuiz(quiz, answers);
    if (!grade) return json({ error: "Answer count mismatch" }, 422);
    return json({
      ok: true,
      guest: true,
      score: grade.score,
      total: grade.total,
      pct: grade.pct,
      explanations: grade.explanations,
    });
  }

  const db = await getDb();
  if (isModuleTest) {
    const result = await submitAcademyModuleTest(db, user, answers);
    if (!result.ok) return json({ error: result.error ?? "Submission failed" }, 422);
    return json(result);
  }
  const result = await submitAcademyQuiz(db, user, quizId, answers);
  if (!result.ok) return json({ error: result.error ?? "Submission failed" }, 422);
  return json(result);
}
