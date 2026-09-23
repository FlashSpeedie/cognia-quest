import type { Db } from "@/server/db/db";
import { MODULES, allLessons } from "@/content/modules";
import type { ChipTone } from "@/components/ui/Chip";

export interface UserStats {
  xp: number;
  lessonsCompleted: number;
  lessonIdsCompleted: Set<string>;
  modulesCompleted: number;
  modulePct: Record<string, number>; // moduleId -> 0-100
  missionsCompleted: number;
  quizzesTaken: number;
  quizAccuracy: number; // 0-100
  simRuns: number;
  simIds: Set<string>;
  detectiveCorrect: number;
  detectiveTotal: number;
  ethicsDone: number;
  ethicsBestCoverage: number;
  privacyDone: number;
  promptBest: number;
  challengeCorrect: number; // detective+privacy+tool correct verdicts
  finalDone: boolean;
}

/** Aggregate everything badge checks & analytics might need, once. */
export async function getUserStats(db: Db, userId: string): Promise<UserStats> {
  const [user, lessons, missions, quizzes, sims, challenges, prompts, final] = await Promise.all([
    db.table("users").get(userId),
    db.table("lesson_progress").find({ userId }),
    db.table("mission_progress").find({ userId }),
    db.table("quiz_attempts").find({ userId }),
    db.table("sim_runs").find({ userId }),
    db.table("challenge_attempts").find({ userId }),
    db.table("prompt_attempts").find({ userId }),
    db.table("final_results").get(userId),
  ]);

  const done = lessons.filter((l) => l.status === "completed");
  const lessonIds = new Set(done.map((l) => l.lessonId));
  const totalLessons = allLessons().length;

  const modulePct: Record<string, number> = {};
  let modulesCompleted = 0;
  for (const m of MODULES) {
    const mDone = m.lessons.filter((l) => lessonIds.has(l.id)).length;
    const pct = m.lessons.length ? Math.round((mDone / m.lessons.length) * 100) : 0;
    modulePct[m.id] = pct;
    if (pct === 100) modulesCompleted++;
  }

  const det = challenges.filter((c) => c.kind === "detective");
  const detCorrect = det.filter((c) => c.correct).length;

  const ethics = challenges.filter((c) => c.kind === "ethics");
  const coverageBest = ethics.reduce((m, c) => {
    const match = /coverage=(\d+)/.exec(c.detail);
    return Math.max(m, match ? parseInt(match[1]!, 10) : 0);
  }, 0);

  const totalQ = quizzes.reduce((s, q) => s + q.total, 0);
  const totalCorrect = quizzes.reduce((s, q) => s + q.score, 0);

  return {
    xp: user?.xpTotal ?? 0,
    lessonsCompleted: done.length,
    lessonIdsCompleted: lessonIds,
    modulesCompleted,
    modulePct,
    missionsCompleted: missions.filter((m) => m.status === "completed").length,
    quizzesTaken: quizzes.length,
    quizAccuracy: totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0,
    simRuns: sims.length,
    simIds: new Set(sims.map((s) => s.simId)),
    detectiveCorrect: detCorrect,
    detectiveTotal: det.length,
    ethicsDone: ethics.length,
    ethicsBestCoverage: coverageBest,
    privacyDone: new Set(challenges.filter((c) => c.kind === "privacy").map((c) => c.challengeId)).size,
    promptBest: prompts.reduce((m, p) => Math.max(m, p.score), 0),
    challengeCorrect:
      detCorrect +
      challenges.filter((c) => (c.kind === "privacy" || c.kind === "tool") && c.correct).length,
    finalDone: !!final,
  };
}

/** Skills radar (spec §103) - educational indicators, not assessments. */
export interface SkillsProfile {
  label: string;
  value: number; // 0-100
  tone: ChipTone;
}

export function skillsProfile(s: UserStats): SkillsProfile[] {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const fundamentals = s.modulePct["fundamentals"] ?? 0;
  const ml = s.modulePct["ml"] ?? 0;
  const gen = s.modulePct["genai"] ?? 0;
  const prompting = Math.max((s.modulePct["prompting"] ?? 0), s.promptBest);
  const ethicsBase = Math.max(s.modulePct["ethics"] ?? 0, s.ethicsBestCoverage);
  const critical = clamp(
    (s.detectiveTotal ? (s.detectiveCorrect / s.detectiveTotal) * 100 : 0) * 0.8 +
      Math.min(s.quizAccuracy, 100) * 0.2,
  );
  return [
    { label: "AI Foundations", value: clamp(fundamentals * 0.7 + gen * 0.3), tone: "pulse" },
    { label: "Machine Learning", value: clamp(ml), tone: "volt" },
    { label: "Prompting", value: clamp(prompting), tone: "amber" },
    { label: "Critical Thinking", value: clamp(critical), tone: "rose" },
    { label: "Ethics", value: clamp(ethicsBase), tone: "mint" },
    { label: "Data Literacy", value: clamp((ml * 0.5) + Math.min(s.simRuns * 8, 50)), tone: "pulse" },
  ];
}
