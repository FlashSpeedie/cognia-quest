import { describe, it, expect } from "vitest";
import { freshDb } from "./setup";
import { registerUser } from "@/server/services/authService";
import { awardXP } from "@/server/services/xp";

const P = "password123";

async function makeUser(email: string) {
  const db = await freshDb();
  const r = await registerUser(db, { email, displayName: "Concurrency", password: P });
  if (!r.ok) throw new Error(r.error);
  return { db, user: r.user };
}

describe("XP atomicity", () => {
  it("one-time rewards use a deterministic id and survive racing claims", async () => {
    const { db, user } = await makeUser("race@test.dev");
    // Fire two identical one-time awards concurrently.
    const [r1, r2] = await Promise.all([
      awardXP(db, user, { sourceType: "lesson", sourceId: "lesson-x" }),
      awardXP(db, user, { sourceType: "lesson", sourceId: "lesson-x" }),
    ]);
    const awarded = [r1.awarded, r2.awarded].sort();
    // Exactly one claim paid; the other is a duplicate.
    expect(awarded).toEqual([0, 50]);
    const events = await db.table("xp_events").find({ userId: user.id });
    expect(events).toHaveLength(1);
    expect(events[0]!.id).toBe(`xp:${user.id}:lesson:lesson-x`);
    const fresh = await db.table("users").get(user.id);
    expect(fresh!.xpTotal).toBe(50);
  });

  it("repeatable sources still decay, day by day", async () => {
    const { db, user } = await makeUser("repeat@test.dev");
    const amounts: number[] = [];
    for (let i = 0; i < 3; i++) {
      const r = await awardXP(db, user, { sourceType: "simulation", sourceId: "sim-a" });
      amounts.push(r.awarded);
    }
    expect(amounts).toEqual([30, 15, 8]); // 30, 30*.5, 30*.25 (rounded)
    const fresh = await db.table("users").get(user.id);
    expect(fresh!.xpTotal).toBe(53);
  });

  it("concurrent different-source awards never lose increments", async () => {
    const { db, user } = await makeUser("multi@test.dev");
    await Promise.all([
      awardXP(db, user, { sourceType: "lesson", sourceId: "l1" }),
      awardXP(db, user, { sourceType: "lesson", sourceId: "l2" }),
      awardXP(db, user, { sourceType: "lesson", sourceId: "l3" }),
      awardXP(db, user, { sourceType: "ethics", sourceId: "ethics-x" }),
    ]);
    const fresh = await db.table("users").get(user.id);
    expect(fresh!.xpTotal).toBe(50 * 3 + 150);
  });

  it("cached users.xpTotal always equals the sum of xp_events", async () => {
    const { db, user } = await makeUser("sum@test.dev");
    // Interleave one-time and repeatable awards, with a deliberate
    // duplicate one-time claim in the middle.
    await awardXP(db, user, { sourceType: "lesson", sourceId: "a" });
    await awardXP(db, user, { sourceType: "detective", sourceId: "case-x" });
    await Promise.all([
      awardXP(db, user, { sourceType: "lesson", sourceId: "a" }), // duplicate
      awardXP(db, user, { sourceType: "simulation", sourceId: "s" }),
      awardXP(db, user, { sourceType: "prompt", sourceId: "p" }),
    ]);
    const events = await db.table("xp_events").find({ userId: user.id });
    const sum = events.reduce((n, e) => n + e.amount, 0);
    const fresh = await db.table("users").get(user.id);
    expect(fresh!.xpTotal).toBe(sum);
  });
});
