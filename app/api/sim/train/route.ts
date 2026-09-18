import { getDb } from "@/server/db/db";
import { sanitizeTrainConfig, trainModel, recordSimRun } from "@/server/services/sims";
import { json, requireUser, throttle } from "@/server/http";

export async function POST(req: Request) {
  const limited = throttle(req, "sim-train", 30);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const cfg = sanitizeTrainConfig(body);
  if ("error" in cfg) return json({ error: cfg.error }, 422);

  const result = trainModel(cfg);
  const db = await getDb();
  const saved = await recordSimRun(db, auth.user, "train-machine", cfg as unknown as Record<string, unknown>, result as unknown as Record<string, unknown>);
  return json({
    result,
    xp: saved.xp ? { awarded: saved.xp.awarded, total: saved.xp.total, leveledUp: saved.xp.leveledUp } : undefined,
    badges: saved.badges,
    events: saved.events,
  });
}
