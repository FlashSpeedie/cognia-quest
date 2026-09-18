import type { Db } from "@/server/db/db";
import { newId } from "@/server/db/db";
import { BADGES, badgeById } from "@/content/badges";
import { MODULES } from "@/content/modules";
import type { BadgeState } from "@/lib/types";
import { getUserStats, type UserStats } from "./stats";
import { logActivity, notify } from "./activity";

/** Conditions per badge (spec §10/§85). Server-validated only. */
function condition(badgeId: string, s: UserStats): { met: boolean; progress: number } {
  switch (badgeId) {
    case "ai-rookie": {
      const m = MODULES.find((m) => m.id === "fundamentals")!;
      const done = m.lessons.filter((l) => s.lessonIdsCompleted.has(l.id)).length;
      const progress = done / m.lessons.length;
      return { met: progress >= 1, progress };
    }
    case "machine-learner": {
      const ok = s.simIds.has("train-machine");
      return { met: ok, progress: ok ? 1 : 0 };
    }
    case "prompt-crafter":
      return { met: s.promptBest >= 80, progress: Math.min(1, s.promptBest / 80) };
    case "ai-detective":
      return { met: s.detectiveCorrect >= 5, progress: Math.min(1, s.detectiveCorrect / 5) };
    case "bias-buster":
      return { met: s.simIds.has("bias-fixed"), progress: s.simIds.has("bias-fixed") ? 1 : s.simIds.has("bias") ? 0.5 : 0 };
    case "ethical-guardian":
      return { met: s.ethicsDone >= 1 && s.ethicsBestCoverage >= 75, progress: Math.min(1, s.ethicsBestCoverage / 75) };
    case "data-explorer":
      return { met: s.simIds.size >= 3, progress: Math.min(1, s.simIds.size / 3) };
    case "critical-thinker":
      return { met: s.challengeCorrect >= 8, progress: Math.min(1, s.challengeCorrect / 8) };
    case "lab-rat":
      return { met: s.simRuns >= 10, progress: Math.min(1, s.simRuns / 10) };
    case "mission-specialist":
      return { met: s.missionsCompleted >= 6, progress: Math.min(1, s.missionsCompleted / 6) };
    case "ai-architect":
      return { met: s.finalDone, progress: s.finalDone ? 1 : 0 };
    case "ai-master": {
      const allModules = s.modulesCompleted >= MODULES.length;
      const weight = (s.modulesCompleted + (s.finalDone ? 1 : 0)) / (MODULES.length + 1);
      return { met: allModules && s.finalDone, progress: weight };
    }
    default:
      return { met: false, progress: 0 };
  }
}

export interface BadgeCheckResult {
  newlyUnlocked: { id: string; title: string; icon: string }[];
  states: BadgeState[];
}

/**
 * Recompute badge progress & unlock any newly-earned badges.
 * Emits notifications + activity for each new unlock.
 */
export async function checkBadges(db: Db, userId: string): Promise<BadgeCheckResult> {
  const stats = await getUserStats(db, userId);
  const table = db.table("badge_states");
  const existing = await table.find({ userId });
  const byId = new Map(existing.map((b) => [b.badgeId, b]));
  const newlyUnlocked: BadgeCheckResult["newlyUnlocked"] = [];

  await db.tx(async () => {
    for (const def of BADGES) {
      const { met, progress } = condition(def.id, stats);
      const cur = byId.get(def.id);
      if (cur?.unlockedAt) continue; // already earned
      if (met) {
        const unlockedAt = new Date().toISOString();
        if (cur) await table.update(cur.id, { progress: 1, unlockedAt });
        else
          await table.insert({
            id: `${userId}:${def.id}`,
            userId,
            badgeId: def.id,
            progress: 1,
            unlockedAt,
          });
        newlyUnlocked.push({ id: def.id, title: def.title, icon: def.icon });
        await logActivity(db, userId, "badge_unlocked", `Unlocked badge: ${def.title}`);
        await notify(db, userId, "achievement", `Badge unlocked: ${def.title}`, def.description);
      } else {
        // track progress (never decrease)
        if (cur) {
          if (progress > cur.progress) await table.update(cur.id, { progress });
        } else if (progress > 0) {
          await table.insert({
            id: `${userId}:${def.id}`,
            userId,
            badgeId: def.id,
            progress,
            unlockedAt: null,
          });
        }
      }
    }
  });

  return { newlyUnlocked, states: await table.find({ userId }) };
}
