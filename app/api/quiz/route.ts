import { z } from "zod";
import { getDb } from "@/server/db/db";
import { submitQuiz } from "@/server/services/progress";
import { json, parseBody, requireUser, throttle } from "@/server/http";

const schema = z.object({
  quizId: z.string().max(80),
  lessonId: z.string().max(80).optional(),
  answers: z.array(z.array(z.number().int().min(0).max(20)).max(8)).max(30),
});

export async function POST(req: Request) {
  const limited = throttle(req, "quiz", 30);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const r = await submitQuiz(db, auth.user, parsed.data.quizId, parsed.data.answers, parsed.data.lessonId);
  if (!r.ok) return json({ error: r.error }, 422);
  return json({
    ok: true,
    score: r.score,
    total: r.total,
    explanations: r.explanations,
    xp: r.xp ? { awarded: r.xp.awarded, total: r.xp.total, leveledUp: r.xp.leveledUp } : undefined,
    badges: r.badges,
  });
}
