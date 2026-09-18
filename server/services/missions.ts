import type { Db } from "@/server/db/db";
import { MISSIONS, missionById } from "@/content/missions";
import type { MissionProgress, User } from "@/lib/types";
import { awardXP } from "./xp";
import { logActivity, notify } from "./activity";
import { checkBadges } from "./badges";

export interface MissionEvent {
  type: string; // lesson | quiz | sim | prompt | detective | ethics | privacy | final
  id: string;
}

/**
 * Record a mission-relevant event.
 * Marks matching objectives done; when all objectives of the mission are
 * satisfied, completes the mission server-side and awards its XP once.
 */
export async function recordMissionEvent(
  db: Db,
  user: User,
  event: MissionEvent,
): Promise<{ completedMissions: string[] }> {
  const completedMissions: string[] = [];
  const table = db.table("mission_progress");

  for (const mission of MISSIONS) {
    const matching = mission.objectives.filter((o) => o.event && o.event.type === event.type && matchesEvent(o.event.id, event.id));
    if (matching.length === 0) continue;

    const id = `${user.id}:${mission.id}`;
    const existing = await table.get(id);
    const done = new Set(existing?.objectivesDone ?? []);
    for (const o of matching) done.add(o.id);

    const allDone = mission.objectives.every((o) => done.has(o.id));
    const wasCompleted = existing?.status === "completed";

    await db.tx(async () => {
      const patch: Partial<MissionProgress> = {
        objectivesDone: [...done],
        status: allDone ? "completed" : "in_progress",
        updatedAt: new Date().toISOString(),
      };
      if (allDone && !wasCompleted) patch.completedAt = new Date().toISOString();

      if (existing) {
        if (wasCompleted && allDone) return; // nothing new
        await table.update(id, patch);
      } else {
        await table.insert({
          id,
          userId: user.id,
          missionId: mission.id,
          status: allDone ? "completed" : "in_progress",
          objectivesDone: [...done],
          attempts: 1,
          completedAt: allDone ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    if (allDone && !wasCompleted) {
      completedMissions.push(mission.id);
      const xp = await awardXP(db, user, {
        sourceType: "mission",
        sourceId: mission.id,
        baseOverride: mission.xp,
        note: `Mission complete: ${mission.title}`,
      });
      await logActivity(db, user.id, "mission_completed", `Mission complete: ${mission.title}`);
      await notify(db, user.id, "mission", `Mission complete: ${mission.title}`, `+${xp.awarded} XP`);
      // A mission completion may itself unlock badges
      await checkBadges(db, user.id);
      if (xp.leveledUp) {
        await notify(db, user.id, "level", `Level up! You're now ${xp.leveledUp.to}`, `Level ${xp.leveledUp.level}`);
        await logActivity(db, user.id, "level_up", `Reached ${xp.leveledUp.to}`);
      }
    }
  }
  return { completedMissions };
}

function matchesEvent(pattern: string, id: string): boolean {
  if (pattern === id) return true;
  // pattern may be a prefix-class like "detective:opened"
  return pattern.startsWith(id + ":") || pattern === id;
}

/** Compute each mission's availability: mission N unlocks when N-1 complete. */
export function missionStates(progress: MissionProgress[]) {
  const byId = new Map(progress.map((p) => [p.missionId, p]));
  return MISSIONS.map((m, i) => {
    const prev = i === 0 ? null : MISSIONS[i - 1]!;
    const prevDone = prev ? byId.get(prev.id)?.status === "completed" : true;
    const state = byId.get(m.id);
    const status = state?.status ?? (prevDone ? "available" : "locked");
    const finalStatus = prevDone && status === "locked" ? "available" : status;
    return {
      mission: m,
      status: finalStatus as MissionProgress["status"],
      objectivesDone: state?.objectivesDone ?? [],
      completedAt: state?.completedAt ?? null,
      attempts: state?.attempts ?? 0,
    };
  });
}

export { missionById };
