import { describe, it, expect } from "vitest";
import { freshDb } from "./setup";
import { registerUser } from "@/server/services/authService";
import { awardXP } from "@/server/services/xp";
import { touchStreak } from "@/server/services/streaks";
import { submitQuiz, recordSection } from "@/server/services/progress";
import { checkBadges } from "@/server/services/badges";
import { QUIZZES } from "@/content/quizzes";
import { MODULES } from "@/content/modules";

async function makeUser(db: Awaited<ReturnType<typeof freshDb>>, email = "a@test.dev") {
  const r = await registerUser(db, { email, displayName: "Testy", password: "password123" });
  if (!r.ok) throw new Error(r.error);
  return r.user;
}

describe("XP system", () => {
  it("awards once per one-time source (anti-farming)", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const a = await awardXP(db, user, { sourceType: "lesson", sourceId: "l1", baseOverride: 50 });
    const b = await awardXP(db, user, { sourceType: "lesson", sourceId: "l1", baseOverride: 50 });
    expect(a.awarded).toBe(50);
    expect(b.awarded).toBe(0);
    expect(b.duplicate).toBe(true);
    const u = await db.table("users").get(user.id);
    expect(u!.xpTotal).toBe(50);
  });

  it("decays repeatable sources and caps daily", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const amounts: number[] = [];
    for (let i = 0; i < 7; i++) {
      const r = await awardXP(db, user, { sourceType: "simulation", sourceId: "sim-x", baseOverride: 30 });
      amounts.push(r.awarded);
    }
    expect(amounts[0]).toBe(30);
    expect(amounts[1]).toBe(15);
    expect(amounts[2]).toBe(8); // 30*0.25 rounded
    expect(amounts[6]).toBe(0); // past dailyCap(6) → nothing
  });

  it("one-time sources ignore repeats even with large overrides (server-controlled amounts)", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const r1 = await awardXP(db, user, { sourceType: "mission", sourceId: "mx", baseOverride: 100 });
    const r2 = await awardXP(db, user, { sourceType: "mission", sourceId: "mx", baseOverride: 999999 });
    expect(r1.awarded).toBe(100); // amount comes from the mission definition
    expect(r2.awarded).toBe(0); // replay attempt blocked
    expect(r2.duplicate).toBe(true);
    const events = await db.table("xp_events").find({ userId: user.id });
    expect(events).toHaveLength(1);
    expect(events[0]!.amount).toBe(100);
  });

  it("levels up at thresholds", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const r = await awardXP(db, user, { sourceType: "final", sourceId: "x", baseOverride: 250 });
    expect(r.leveledUp).not.toBeNull();
    expect(r.leveledUp!.to).toBe("Data Explorer");
  });
});

describe("streaks", () => {
  it("counts one day even with many touches", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await touchStreak(db, user.id, "2026-09-18");
    const s = await touchStreak(db, user.id, "2026-09-18");
    expect(s.current).toBe(1);
    expect(s.longest).toBe(1);
  });

  it("increments on consecutive days, resets after gaps", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    await touchStreak(db, user.id, "2026-09-15");
    await touchStreak(db, user.id, "2026-09-16");
    let s = await touchStreak(db, user.id, "2026-09-17");
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
    s = await touchStreak(db, user.id, "2026-09-20");
    expect(s.current).toBe(1);
    expect(s.longest).toBe(3);
  });
});

describe("quiz + lesson completion flow", () => {
  it("grades server-side and completes lesson only when all sections done", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const lesson = MODULES.find((m) => m.id === "fundamentals")!.lessons[0]!;
    const quizSection = lesson.sections.find((s) => s.kind === "quiz")!;
    const quiz = QUIZZES.find((q) => q.id === quizSection.quizId)!;

    // quiz without sections → not completed
    await submitQuiz(db, user, quiz.id, quiz.questions.map((q) => [...q.correct]), lesson.id);
    let lp = await db.table("lesson_progress").get(`${user.id}:${lesson.id}`);
    expect(lp!.status).toBe("in_progress");

    // complete all non-quiz sections
    for (const s of lesson.sections) {
      await recordSection(db, user, lesson.id, s.id);
    }
    lp = await db.table("lesson_progress").get(`${user.id}:${lesson.id}`);
    expect(lp!.status).toBe("completed");
  });

  it("rejects answer arrays of the wrong length", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const quiz = QUIZZES[0]!;
    const r = await submitQuiz(db, user, quiz.id, [[0]]);
    expect(r.ok).toBe(false);
  });

  it("awards AI Rookie after finishing AI Fundamentals", async () => {
    const db = await freshDb();
    const user = await makeUser(db);
    const mod = MODULES.find((m) => m.id === "fundamentals")!;
    for (const lesson of mod.lessons) {
      for (const s of lesson.sections) await recordSection(db, user, lesson.id, s.id);
      const quizSection = lesson.sections.find((s) => s.kind === "quiz");
      if (quizSection) {
        const quiz = QUIZZES.find((q) => q.id === quizSection.quizId)!;
        await submitQuiz(db, user, quiz.id, quiz.questions.map((q) => [...q.correct]), lesson.id);
      }
    }
    const res = await checkBadges(db, user.id);
    const state = res.states.find((b) => b.badgeId === "ai-rookie");
    expect(state?.unlockedAt).toBeTruthy();
  });
});
