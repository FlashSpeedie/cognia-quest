import { z } from "zod";
import { getDb } from "@/server/db/db";
import { submitEthics } from "@/server/services/activities";
import { json, parseBody, requireUser, throttle } from "@/server/http";

const schema = z.object({
  caseId: z.string().regex(/^ethics-[a-z-]+$/),
  factors: z.array(z.string().max(20)).max(30),
});

export async function POST(req: Request) {
  const limited = throttle(req, "ethics", 30);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const r = await submitEthics(db, auth.user, parsed.data.caseId, parsed.data.factors);
  if (!r.ok) return json({ error: r.error }, 422);
  return json({
    ok: true,
    coverage: r.coverage,
    breakdown: r.breakdown,
    xp: r.xp ? { awarded: r.xp.awarded } : undefined,
    badges: r.badges,
  });
}
