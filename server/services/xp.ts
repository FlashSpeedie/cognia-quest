import type { Db } from "@/server/db/db";
import { newId, todayKey } from "@/server/db/db";
import { levelFor, levelProgress } from "@/lib/levels";
import type { XPSourceType, User } from "@/lib/types";
import { xpAmountFor } from "./rules";

export interface AwardResult {
  awarded: number;
  total: number;
  duplicate: boolean;
  capped: boolean;
  leveledUp: { from: string; to: string; level: number } | null;
}

/**
 * Award XP (spec §8/§84). Server-authoritative:
 * - amount comes from server rules, never from the client;
 * - non-repeatable sources can only pay once (dedupe on user+source);
 * - repeatable sources decay and are daily-capped;
 * - xp_events row + cached user total written in one tx.
 */
export async function awardXP(
  db: Db,
  user: User,
  source: { sourceType: XPSourceType; sourceId: string; baseOverride?: number; note?: string },
): Promise<AwardResult> {
  return db.tx(async () => {
    const users = db.table("users");
    const xp = db.table("xp_events");
    const day = todayKey();

    const prior = await xp.find({ userId: user.id, sourceType: source.sourceType, sourceId: source.sourceId });
    let amount = 0;
    let duplicate = false;
    let capped = false;

    if (source.sourceType === "mission" || source.sourceType === "lesson" || source.sourceType === "ethics" ||
        source.sourceType === "privacy" || source.sourceType === "detective" || source.sourceType === "final") {
      // one-time sources
      if (prior.length > 0) duplicate = true;
      else amount = xpAmountFor(source.sourceType, 1, source.baseOverride);
    } else {
      // repeatables: count today's claims for this source
      const today = prior.filter((e) => e.day === day);
      const attemptIndex = today.length + 1;
      amount = xpAmountFor(source.sourceType, attemptIndex, source.baseOverride);
      // lifetime repeats beyond dailyCap*3 earn nothing at all
      if (prior.length >= 3 * 5) {
        amount = 0;
        capped = true;
      }
      if (amount === 0 && !capped) capped = true;
    }

    let leveledUp: AwardResult["leveledUp"] = null;
    let total = user.xpTotal;

    if (amount > 0) {
      const beforeLevel = levelFor(user.xpTotal);
      total = user.xpTotal + amount;
      const afterLevel = levelFor(total);
      await xp.insert({
        id: newId(),
        userId: user.id,
        amount,
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        day,
        note: source.note,
        createdAt: new Date().toISOString(),
      });
      await users.update(user.id, { xpTotal: total, title: afterLevel.title });
      if (afterLevel.level > beforeLevel.level) {
        leveledUp = { from: beforeLevel.title, to: afterLevel.title, level: afterLevel.level };
      }
      user.xpTotal = total;
      user.title = afterLevel.title;
    }

    return { awarded: amount, total, duplicate, capped, leveledUp };
  });
}

export function xpSummary(events: { amount: number; day: string }[]) {
  const total = events.reduce((s, e) => s + e.amount, 0);
  const perDay = new Map<string, number>();
  for (const e of events) perDay.set(e.day, (perDay.get(e.day) ?? 0) + e.amount);
  return { total, perDay: [...perDay.entries()].sort() };
}

export { levelProgress };
