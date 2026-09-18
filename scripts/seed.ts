/**
 * Seed script — creates demo + admin + sample accounts and drives the demo
 * student through realistic activity USING the real services, so the state
 * is always consistent with business logic (spec §87/§119).
 *
 *   npm run seed
 */
import { promises as fs } from "fs";
import path from "path";
import { createLocalDb } from "../server/db/local";
import { registerUser } from "../server/services/authService";
import { recordSection, submitQuiz } from "../server/services/progress";
import { submitDetective, submitEthics, submitPrivacy, submitPrompt } from "../server/services/activities";
import { recordSimRun } from "../server/services/sims";
import { trainModel } from "../server/services/ml";
import { QUIZZES } from "../content/quizzes";
import { MODULES } from "../content/modules";
import type { User } from "../lib/types";

const dbPath = process.env.LOCAL_DB_PATH ?? "data/dev-db.json";

async function main() {
  // Fresh start
  await fs.rm(path.resolve(dbPath), { force: true });
  const db = await createLocalDb(dbPath);

  console.log("Seeding AI Quest →", dbPath);

  // ── Admin (documented fake dev credentials) ──────────────────────────
  const adminReg = await registerUser(db, {
    email: "admin@aiquest.dev",
    displayName: "Quest Admin",
    password: "admin1234",
  });
  if (!adminReg.ok) throw new Error(adminReg.error);
  await db.table("users").update(adminReg.user.id, { role: "admin", onboarding: { completed: true } });

  // ── Demo student shown on the landing "Try demo" flow ────────────────
  const demoReg = await registerUser(db, {
    email: "demo@aiquest.dev",
    displayName: "Alex",
    password: "demo1234",
  });
  if (!demoReg.ok) throw new Error(demoReg.error);
  const demo: User = demoReg.user;
  await db.table("users").update(demo.id, { isDemo: true, onboarding: { completed: true, learnerType: "explorer", goal: "understand" } });
  Object.assign(demo, { onboarding: { completed: true, learnerType: "explorer", goal: "understand" } });

  // ── Lessons: complete a realistic set via sections + real quizzes ─────
  const lessonsToComplete = [
    "fund-what-is-ai", "fund-ml-vs-rules", "fund-types", "fund-wrong",
    "ml-data", "ml-pipeline", "ml-overfitting",
    "gen-what", "gen-tokens",
    "prompt-anatomy",
  ];
  for (const lessonId of lessonsToComplete) {
    const lesson = MODULES.flatMap((m) => m.lessons).find((l) => l.id === lessonId)!;
    for (const section of lesson.sections) {
      await recordSection(db, demo, lessonId, section.id);
    }
    const quizSection = lesson.sections.find((s) => s.kind === "quiz");
    if (quizSection) {
      const quiz = QUIZZES.find((q) => q.id === quizSection.quizId)!;
      // answer ~85% correctly: all right except last question of some quizzes
      const answers = quiz.questions.map((q, i) =>
        i === quiz.questions.length - 1 && quiz.id !== "quiz-fund-1"
          ? q.choices.map((_, ci) => ci).filter((ci) => !q.correct.includes(ci)).slice(0, 1)
          : [...q.correct],
      );
      await submitQuiz(db, demo, quiz.id, answers, lessonId);
    }
  }

  // ── Simulations ───────────────────────────────────────────────────────
  const goodRun = trainModel({
    rows: [
      { study: 2, sleep: 5, passed: false },
      { study: 3, sleep: 6, passed: false },
      { study: 5, sleep: 7, passed: true },
      { study: 6, sleep: 8, passed: true },
      { study: 8, sleep: 8, passed: true },
      { study: 9, sleep: 7, passed: true },
    ],
    testSplit: 0.25, noise: 0, extraSamples: 20,
  });
  await recordSimRun(db, demo, "train-machine", {}, goodRun as unknown as Record<string, unknown>);

  const imbalanced = trainModel(
    { rows: [
      { study: 6, sleep: 8, passed: true }, { study: 7, sleep: 7, passed: true },
      { study: 8, sleep: 8, passed: true }, { study: 9, sleep: 9, passed: true },
      { study: 5, sleep: 7, passed: true },
    ], testSplit: 0.3, noise: 0, extraSamples: 0 },
  );
  await recordSimRun(db, demo, "train-machine", {}, imbalanced as unknown as Record<string, unknown>);

  // extra lab activity for Lab Rat progress
  for (const simId of ["overfitting-lab", "confidence-lab", "data-explorer", "confusion-matrix"]) {
    await recordSimRun(db, demo, simId, {}, { ok: true });
  }

  // ── Detective: 4 correct solves incl. a hallucination ─────────────────
  await submitDetective(db, demo, "case-001", "hallucination");
  await submitDetective(db, demo, "case-003", "hallucination");
  await submitDetective(db, demo, "case-005", "bias");
  await submitDetective(db, demo, "case-006", "privacy");

  // ── Ethics Court: strong review ───────────────────────────────────────
  await submitEthics(db, demo, "ethics-support", ["f1", "f2", "f3", "f4", "f5", "f6", "f8", "f9"]);

  // ── Privacy: two perfect scenarios ────────────────────────────────────
  await submitPrivacy(db, demo, "priv-tutor", ["d1", "d2"]);
  await submitPrivacy(db, demo, "priv-study", ["d1", "d2"]);

  // ── Prompt Lab ────────────────────────────────────────────────────────
  await submitPrompt(db, demo, "pb-bio-study", "explain cells");
  await submitPrompt(
    db, demo, "pb-bio-study",
    "Create a study guide on cell structure for a 9th-grade biology class. I'm studying for my exam Friday. Use a table of organelles with two columns (name, function), then 5 flashcard-style questions. No more than 300 words, no jargon, and flag anything you're unsure about.",
  );

  // ── Summary ───────────────────────────────────────────────────────────
  const finalDemo = await db.table("users").get(demo.id);
  const counts = {
    users: (await db.table("users").all()).length,
    xp_events: (await db.table("xp_events").all()).length,
    lessons: (await db.table("lesson_progress").all()).length,
    missions: (await db.table("mission_progress").all()).length,
    badges: (await db.table("badge_states").all()).length,
    sims: (await db.table("sim_runs").all()).length,
    challenges: (await db.table("challenge_attempts").all()).length,
    prompts: (await db.table("prompt_attempts").all()).length,
    notifications: (await db.table("notifications").all()).length,
  };
  console.log("Demo student:", { xp: finalDemo?.xpTotal, title: finalDemo?.title });
  console.log("Row counts:", counts);
  console.log("Seeded. Dev logins: demo@aiquest.dev/demo1234 · admin@aiquest.dev/admin1234");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
