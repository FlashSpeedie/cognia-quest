import { describe, it, expect } from "vitest";
import { freshDb } from "./setup";
import { registerUser } from "@/server/services/authService";
import { submitDetective, submitEthics, submitPrivacy, submitPrompt } from "@/server/services/activities";
import { submitFinal } from "@/server/services/final";
import { checkBadges } from "@/server/services/badges";
import { missionStates } from "@/server/services/missions";

async function makeUser(db: Awaited<ReturnType<typeof freshDb>>) {
  const r = await registerUser(db, { email: "b@test.dev", displayName: "Casey", password: "password123" });
  if (!r.ok) throw new Error(r.error);
  return r.user;
}

describe("AI Detective", () => {
  it("validates verdicts server-side and pays once", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const wrong = await submitDetective(db, user, "case-001", "none");
    expect(wrong.correct).toBe(false);
    const right = await submitDetective(db, user, "case-001", "hallucination");
    expect(right.correct).toBe(true);
    expect(right.xp?.awarded).toBe(75);
    // repeat correct answer on same case pays nothing
    const again = await submitDetective(db, user, "case-001", "hallucination");
    expect(again.xp?.awarded).toBe(0);
    expect(again.xp?.duplicate).toBe(true);
  });

  it("unknown case ids are rejected", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const r = await submitDetective(db, user, "case-999", "bias");
    expect(r.ok).toBe(false);
  });

  it("AI Detective badge unlocks at 5 correct", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await submitDetective(db, user, "case-001", "hallucination");
    await submitDetective(db, user, "case-003", "hallucination");
    await submitDetective(db, user, "case-005", "bias");
    await submitDetective(db, user, "case-006", "privacy");
    await submitDetective(db, user, "case-010", "none");
    const res = await checkBadges(db, user.id);
    expect(res.states.find((b) => b.badgeId === "ai-detective")?.unlockedAt).toBeTruthy();
  });
});

describe("Ethics Court", () => {
  it("scores coverage and rejects junk", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const r = await submitEthics(db, user, "ethics-support", ["f1", "f2", "f3", "f4", "f5", "f6", "f8", "f9"]);
    expect(r.coverage).toBeGreaterThanOrEqual(75);
    const weak = await submitEthics(db, user, "ethics-grading", ["f7"]);
    expect(weak.coverage).toBeLessThan(25);
  });
});

describe("Privacy challenge", () => {
  it("detects perfect minimal selection", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const r = await submitPrivacy(db, user, "priv-tutor", ["d1", "d2"]);
    expect(r.correct).toBe(true);
    expect(r.perfect).toBe(true);
    const over = await submitPrivacy(db, user, "priv-study", ["d1", "d2", "d4"]);
    expect(over.perfect).toBe(false);
  });
});

describe("Prompt scoring (mission events)", () => {
  it("an 80+ prompt completes a prompt objective", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await submitPrompt(db, user, "pb-bio-study", "study cells pls");
    let mp = await db.table("mission_progress").get(`${user.id}:mission-04`);
    expect(mp!.objectivesDone).toContain("o1");
    await submitPrompt(
      db, user, "pb-bio-study",
      "I'm a 9th grade student. Create a cell-structure study guide: table of organelles with functions, then 5 flashcards, under 250 words, no jargon, with one analogy, and cite the textbook chapter if you reference one.",
    );
    mp = await db.table("mission_progress").get(`${user.id}:mission-04`);
    expect(mp!.status).toBe("completed");
  });
});

describe("Final challenge", () => {
  const good = {
    "choose-data": ["grades", "assignments", "attendance", "advisor"],
    "spot-problem": 1,
    "read-results": 1,
    "prompt-write":
      "You are writing short flag explanations for busy teachers. For each flagged student, summarize the 2-3 contributing signals in plain language (bullets, max 60 words), avoid labels or blame, suggest one concrete next step, and end with an uncertainty note: this is a prediction to review, not a verdict.",
    "detect-issue": 2,
    checklist: ["c1", "c2", "c3", "c4", "c5", "c8"],
    verdict: 1,
  };

  it("completes and unlocks AI Architect badge", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const r = await submitFinal(db, user, good);
    expect(r.ok).toBe(true);
    expect(r.result!.totalScore).toBeGreaterThanOrEqual(70);
    const badges = await checkBadges(db, user.id);
    expect(badges.states.find((b) => b.badgeId === "ai-architect")?.unlockedAt).toBeTruthy();
    // mission 10 completes
    const mp = await db.table("mission_progress").get(`${user.id}:mission-10`);
    expect(mp!.status).toBe("completed");
    // double submission blocked
    const again = await submitFinal(db, user, good);
    expect(again.ok).toBe(false);
    expect(again.alreadyDone).toBe(true);
  });

  it("rejects incomplete submissions", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const r = await submitFinal(db, user, { verdict: 1 });
    expect(r.ok).toBe(false);
  });
});

describe("Mission gating", () => {
  it("mission 2 is locked until mission 1 completes", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const states = missionStates(await db.table("mission_progress").find({ userId: user.id }));
    expect(states[0]!.status).toBe("available");
    expect(states[1]!.status).toBe("locked");
  });
});
