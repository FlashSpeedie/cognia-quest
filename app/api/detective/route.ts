import { z } from "zod";
import { getDb } from "@/server/db/db";
import { submitDetective } from "@/server/services/activities";
import { detection_issueTypes } from "@/lib/validators";
import { json, parseBody, requireUser, throttle } from "@/server/http";

const schema = z.object({
  caseId: z.string().regex(/^case-\d+$/),
  verdict: detection_issueTypes,
});

export async function POST(req: Request) {
  const limited = throttle(req, "detective", 40);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const r = await submitDetective(db, auth.user, parsed.data.caseId, parsed.data.verdict);
  if (!r.ok) return json({ error: r.error }, 422);
  return json({
    ok: true,
    correct: r.correct,
    explanation: r.explanation,
    teachingPoint: r.teachingPoint,
    actualIssue: r.actualIssue,
    xp: r.xp ? { awarded: r.xp.awarded } : undefined,
    badges: r.badges,
  });
}
