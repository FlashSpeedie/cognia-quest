import type { Db } from "@/server/db/db";
import { todayKey } from "@/server/db/db";
import type { Streak } from "@/lib/types";

function yesterdayKey(day: string): string {
  const d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Record meaningful activity for the streak (spec §38).
 * Multiple activities in one day count once.
 */
export async function touchStreak(db: Db, userId: string, day = todayKey()): Promise<Streak> {
  const table = db.table("streaks");
  const existing = await table.get(userId);
  if (!existing) {
    const s: Streak = { id: userId, userId, current: 1, longest: 1, lastActiveDay: day };
    await table.insert(s);
    return s;
  }
  if (existing.lastActiveDay === day) return existing; // already counted today
  const consecutive = existing.lastActiveDay === yesterdayKey(day);
  const current = consecutive ? existing.current + 1 : 1;
  const updated: Streak = {
    ...existing,
    current,
    longest: Math.max(existing.longest, current),
    lastActiveDay: day,
  };
  await table.update(userId, updated as Partial<Streak>);
  return updated;
}
