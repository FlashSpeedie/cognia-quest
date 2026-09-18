import { z } from "zod";
import { getDb } from "@/server/db/db";
import { recordSimRun } from "@/server/services/sims";
import { json, parseBody, requireUser, throttle } from "@/server/http";

const schema = z.object({
  simId: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  result: z.record(z.unknown()).default({}),
});

/** Record any lab/sim run (bias sim posts flagged results here). */
export async function POST(req: Request) {
  const limited = throttle(req, "sim-record", 40);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const saved = await recordSimRun(db, auth.user, parsed.data.simId, {}, parsed.data.result ?? {});
  return json({
    ok: true,
    xp: saved.xp ? { awarded: saved.xp.awarded, total: saved.xp.total, leveledUp: saved.xp.leveledUp } : undefined,
    badges: saved.badges,
    events: saved.events,
  });
}
