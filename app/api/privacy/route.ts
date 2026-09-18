import { z } from "zod";
import { getDb } from "@/server/db/db";
import { submitPrivacy } from "@/server/services/activities";
import { json, parseBody, requireUser, throttle } from "@/server/http";

const schema = z.object({
  scenarioId: z.string().regex(/^priv-[a-z]+$/),
  dataIds: z.array(z.string().max(10)).max(20),
});

export async function POST(req: Request) {
  const limited = throttle(req, "privacy", 30);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const r = await submitPrivacy(db, auth.user, parsed.data.scenarioId, parsed.data.dataIds);
  if (!r.ok) return json({ error: r.error }, 422);
  return json({
    ok: true,
    correct: r.correct,
    perfect: r.perfect,
    reasons: r.reasons,
    xp: r.xp ? { awarded: r.xp.awarded } : undefined,
    badges: r.badges,
  });
}
