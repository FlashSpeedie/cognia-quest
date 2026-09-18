import { z } from "zod";
import { getDb } from "@/server/db/db";
import { submitToolChoice } from "@/server/services/activities";
import { json, parseBody, requireUser, throttle } from "@/server/http";

const schema = z.object({
  scenarioId: z.string().max(40),
  choice: z.number().int().min(0).max(10),
});

export async function POST(req: Request) {
  const limited = throttle(req, "tool", 30);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const r = await submitToolChoice(db, auth.user, parsed.data.scenarioId, parsed.data.choice);
  if (!r.ok) return json({ error: r.error }, 422);
  return json({
    ok: true,
    correct: r.correct,
    why: r.why,
    risks: r.risks,
    verify: r.verify,
    xp: r.xp ? { awarded: r.xp.awarded } : undefined,
    badges: r.badges,
  });
}
