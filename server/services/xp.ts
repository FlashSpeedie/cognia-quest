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
 * Award XP (spec §8/§84). Server-authoritative and concurrency-safe:
 * - amount comes from server rules, never from the client;
 * - one-time sources use a deterministic event id (`user:source:sourceId`),
 *   so the store's unique index physically rejects a racing duplicate;
 * - the cached total moves via an atomic increment (RPC on Supabase,
 *   serialized queue locally), never a read-modify-write;
 * - repeatable sources decay and are daily-capped.
 */
export async function awardXP(
  db: Db,
  user: User,
  source: { sourceType: XPSourceType; sourceId: string; baseOverride?: number; note?: string },
): Promise<AwardResult> {
  const ONE_TIME: readonly XPSourceType[] = ["mission", "lesson", "ethics", "privacy", "detective", "final"];
  const isOneTime = ONE_TIME.includes(source.sourceType);
  // Deterministic id turns the xp_events unique index into our mutex.
  const eventId = isOneTime ? `xp:${user.id}:${source.sourceType}:${source.sourceId}` : newId();

  return db.tx(async () => {
    const xp = db.table("xp_events");
    const day = todayKey();

    const prior = await xp.find({ userId: user.id, sourceType: source.sourceType, sourceId: source.sourceId });
    let amount = 0;
    let duplicate = false;
    let capped = false;

    if (isOneTime) {
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
      try {
        await xp.insert({
          id: eventId,
          userId: user.id,
          amount,
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          day,
          note: source.note,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        // Racing double-claim on a one-time source: the unique index won.
        if (isOneTime) return { awarded: 0, total: user.xpTotal, duplicate: true, capped: false, leveledUp: null };
        throw e;
      }
      total = await db.incrementUserXp(user.id, amount);
      const afterLevel = levelFor(total);
      await db.table("users").update(user.id, { title: afterLevel.title });
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
