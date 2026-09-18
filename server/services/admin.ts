import type { Db } from "@/server/db/db";
import { BADGES } from "@/content/badges";
import { MISSIONS } from "@/content/missions";
import { MODULES } from "@/content/modules";
import { QUIZZES } from "@/content/quizzes";
import { DETECTIVE_CASES } from "@/content/detective";
import { levelFor } from "@/lib/levels";
import { todayKey } from "@/server/db/db";

/** Admin analytics — aggregate, privacy-lean (spec §49). */
export async function getAdminOverview(db: Db) {
  const [users, xpEvents, lessons, missions, badges, quizzes, challenges, sims, activity] = await Promise.all([
    db.table("users").all(),
    db.table("xp_events").all(),
    db.table("lesson_progress").all(),
    db.table("mission_progress").all(),
    db.table("badge_states").all(),
    db.table("quiz_attempts").all(),
    db.table("challenge_attempts").all(),
    db.table("sim_runs").all(),
    db.table("activity").all(),
  ]);

  const students = users.filter((u) => u.role === "student");
  const realStudents = students.filter((u) => !u.isDemo);
  const today = todayKey();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const completedLessons = lessons.filter((l) => l.status === "completed");

  // module completion funnel
  const moduleCompletion = MODULES.map((m) => {
    const done = completedLessons.filter((l) => l.moduleId === m.id).length;
    const possible = Math.max(1, students.length * m.lessons.length);
    return { id: m.id, title: m.title, pct: Math.round((done / possible) * 100), done, possible };
  });

  // mission funnel
  const missionCompletion = MISSIONS.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
    completed: missions.filter((p) => p.missionId === m.id && p.status === "completed").length,
    started: missions.filter((p) => p.missionId === m.id && p.status !== "locked").length,
  }));

  // badge distribution
  const badgeDistribution = BADGES.map((b) => ({
    id: b.id,
    title: b.title,
    icon: b.icon,
    count: badges.filter((s) => s.badgeId === b.id && s.unlockedAt).length,
  })).sort((a, b) => b.count - a.count);

  // quiz difficulty: avg accuracy per quiz
  const quizStats = QUIZZES.map((q) => {
    const attempts = quizzes.filter((a) => a.quizId === q.id);
    const acc = attempts.length
      ? Math.round((attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length) * 100)
      : null;
    return { id: q.id, title: q.title, attempts: attempts.length, accuracy: acc };
  });

  // hardest detective cases (lowest solve rate among attempted)
  const detectiveStats = DETECTIVE_CASES.map((c) => {
    const at = challenges.filter((a) => a.kind === "detective" && a.challengeId === c.id);
    const correct = at.filter((a) => a.correct).length;
    return {
      id: c.id,
      title: c.title,
      attempts: at.length,
      solveRate: at.length ? Math.round((correct / at.length) * 100) : null,
    };
  }).sort((a, b) => (a.solveRate ?? 101) - (b.solveRate ?? 101));

  // daily activity for the past 14 days
  const dayCounts = new Map<string, number>();
  for (const a of activity) {
    const d = a.createdAt.slice(0, 10);
    dayCounts.set(d, (dayCounts.get(d) ?? 0) + 1);
  }
  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    days.push({ day: d, count: dayCounts.get(d) ?? 0 });
  }

  const activeToday = new Set(
    activity.filter((a) => a.createdAt.slice(0, 10) === today).map((a) => a.userId),
  ).size;
  const activeWeek = new Set(
    activity.filter((a) => a.createdAt >= weekAgo).map((a) => a.userId),
  ).size;

  const totalXP = students.reduce((s, u) => s + u.xpTotal, 0);

  return {
    totals: {
      students: students.length,
      realStudents: realStudents.length,
      activeToday,
      activeWeek,
      totalXPAwarded: totalXP,
      lessonsCompleted: completedLessons.length,
      missionsCompleted: missions.filter((m) => m.status === "completed").length,
      badgesEarned: badges.filter((b) => b.unlockedAt).length,
      simRuns: sims.length,
      quizAttempts: quizzes.length,
    },
    moduleCompletion,
    missionCompletion,
    badgeDistribution,
    quizStats,
    detectiveStats,
    activitySeries: days,
    levelDistribution: (() => {
      const m = new Map<string, number>();
      for (const u of students) {
        const t = levelFor(u.xpTotal).title;
        m.set(t, (m.get(t) ?? 0) + 1);
      }
      return [...m.entries()];
    })(),
  };
}

export async function getUsers(db: Db) {
  const users = await db.table("users").all();
  const finalResults = await db.table("final_results").all();
  const finalByUser = new Map(finalResults.map((f) => [f.userId, f.totalScore]));
  return users
    .sort((a, b) => b.xpTotal - a.xpTotal)
    .map((u) => ({
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      isDemo: u.isDemo,
      xp: u.xpTotal,
      level: levelFor(u.xpTotal),
      createdAt: u.createdAt,
      finalScore: finalByUser.get(u.id) ?? null,
    }));
}
