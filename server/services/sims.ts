import type { Db } from "@/server/db/db";
import { newId } from "@/server/db/db";
import type { User } from "@/lib/types";
import { trainModel, type TrainConfig, type TrainResult } from "./ml";
import { awardXP, type AwardResult } from "./xp";
import { touchStreak } from "./streaks";
import { checkBadges } from "./badges";
import { recordMissionEvent, type MissionEvent } from "./missions";
import { logActivity } from "./activity";

/** Record a simulation run, reward, and emit mission events (spec §13/§32). */
export async function recordSimRun(
  db: Db,
  user: User,
  simId: string,
  config: Record<string, unknown>,
  result: Record<string, unknown>,
): Promise<{ ok: boolean; xp?: AwardResult; badges?: string[]; events: string[] }> {
  await db.table("sim_runs").insert({
    id: newId(),
    userId: user.id,
    simId,
    config,
    result,
    createdAt: new Date().toISOString(),
  });

  const events: MissionEvent[] = [];
  if (simId === "train-machine") {
    events.push({ type: "sim", id: "train-machine:trained" }, { type: "sim", id: "train-machine:open" });
    const acc = Number(result.testAccuracy ?? 0);
    if (result.ok && acc >= 0.8) events.push({ type: "sim", id: "train-machine:accuracy-80" });
    if (result.problem === "imbalanced") events.push({ type: "sim", id: "train-machine:imbalanced" });
    if (result.ok && acc < 0.6) events.push({ type: "sim", id: "train-machine:broken" });
    if (result.problem === "one-class") events.push({ type: "sim", id: "train-machine:imbalanced" }, { type: "sim", id: "train-machine:broken" });
  }
  if (simId === "bias") {
    events.push({ type: "sim", id: "bias:ran" });
    if (result.identifiedFeature) events.push({ type: "sim", id: "bias:identified" });
    if (result.rechecked) events.push({ type: "sim", id: "bias:fixed" });
  }

  const xp = await awardXP(db, user, { sourceType: "simulation", sourceId: simId, note: `Lab run: ${simId}` });
  await logActivity(db, user.id, "sim_run", `Ran experiment: ${simId}`);
  await touchStreak(db, user.id);
  for (const e of events) await recordMissionEvent(db, user, e);
  const badges = await checkBadges(db, user.id);
  return { ok: true, xp, badges: badges.newlyUnlocked.map((b) => b.title), events: events.map((e) => e.id) };
}

export { trainModel };
export type { TrainConfig, TrainResult };

/** Validate train config from the client. Rows are data, not outcomes. */
export function sanitizeTrainConfig(input: unknown): TrainConfig | { error: string } {
  if (typeof input !== "object" || input === null) return { error: "Invalid config" };
  const c = input as Record<string, unknown>;
  const rowsRaw = Array.isArray(c.rows) ? c.rows : [];
  if (rowsRaw.length > 200) return { error: "Too many rows (max 200)" };
  const rows = [];
  for (const r of rowsRaw) {
    if (typeof r !== "object" || r === null) return { error: "Invalid row" };
    const rr = r as Record<string, unknown>;
    const study = Number(rr.study);
    const sleep = Number(rr.sleep);
    if (!Number.isFinite(study) || !Number.isFinite(sleep)) return { error: "Rows need numeric study/sleep" };
    if (study < 0 || study > 24 || sleep < 0 || sleep > 24) return { error: "Values must be 0–24" };
    rows.push({ study, sleep, passed: rr.passed === true });
  }
  const testSplit = Number(c.testSplit ?? 0.25);
  const noise = Number(c.noise ?? 0);
  const extraSamples = Number(c.extraSamples ?? 0);
  return {
    rows,
    testSplit: Math.min(0.5, Math.max(0.1, Number.isFinite(testSplit) ? testSplit : 0.25)),
    noise: Math.min(1, Math.max(0, Number.isFinite(noise) ? noise : 0)),
    extraSamples: Math.min(60, Math.max(0, Math.round(Number.isFinite(extraSamples) ? extraSamples : 0))),
  };
}
