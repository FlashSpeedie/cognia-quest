import type { Db } from "@/server/db/db";
import type { User } from "@/lib/types";
import { levelProgress } from "@/lib/levels";
import { MODULES } from "@/content/modules";
import { BADGES } from "@/content/badges";
import { getUserStats, skillsProfile } from "./stats";
import { missionStates } from "./missions";
import { recommendations } from "./recommendations";

export async function getDashboard(db: Db, user: User) {
  const [stats, streak, badges, missions, activity, xpEvents, notifications] = await Promise.all([
    getUserStats(db, user.id),
    db.table("streaks").get(user.id),
    db.table("badge_states").find({ userId: user.id }),
    db.table("mission_progress").find({ userId: user.id }),
    db.table("activity").find({ userId: user.id }),
    db.table("xp_events").find({ userId: user.id }),
    db.table("notifications").find({ userId: user.id }),
  ]);

  const lessons = MODULES.flatMap((m) => m.lessons);
  const completedLessonIds = stats.lessonIdsCompleted;

  // XP per day for the chart
  const perDay = new Map<string, number>();
  for (const e of xpEvents) perDay.set(e.day, (perDay.get(e.day) ?? 0) + e.amount);
  const xpSeries = [...perDay.entries()].sort().slice(-14).map(([day, xp]) => ({ day, xp }));

  // "Continue": first in-progress lesson, else first incomplete lesson, else first available mission
  let continueTarget: { href: string; label: string; detail: string } | null = null;
  const lp = await db.table("lesson_progress").find({ userId: user.id });
  const inProgress = lp.find((l) => l.status === "in_progress");
  if (inProgress) {
    const lesson = lessons.find((l) => l.id === inProgress.lessonId);
    const mod = MODULES.find((m) => m.id === inProgress.moduleId);
    if (lesson && mod) {
      continueTarget = { href: `/academy/${mod.slug}/${lesson.slug}`, label: lesson.title, detail: mod.title };
    }
  }
  if (!continueTarget) {
    const mStates = missionStates(missions);
    const nextMission = mStates.find((s) => s.status === "available");
    if (nextMission) {
      continueTarget = { href: `/missions/${nextMission.mission.id}`, label: nextMission.mission.title, detail: `Mission ${String(nextMission.mission.order).padStart(2, "0")}` };
    } else {
      const nextLesson = lessons.find((l) => !completedLessonIds.has(l.id));
      const mod = nextLesson && MODULES.find((m) => m.lessons.some((l) => l.id === nextLesson.id));
      if (nextLesson && mod) continueTarget = { href: `/academy/${mod.slug}/${nextLesson.slug}`, label: nextLesson.title, detail: mod.title };
    }
  }

  const recentBadges = badges
    .filter((b) => b.unlockedAt)
    .sort((a, b) => (b.unlockedAt ?? "").localeCompare(a.unlockedAt ?? ""))
    .slice(0, 4)
    .map((b) => ({ state: b, def: BADGES.find((d) => d.id === b.badgeId)! }))
    .filter((b) => b.def);

  const recentActivity = [...activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  // Real persisted activity, grouped per calendar day for the heat grid.
  const activityByDay = new Map<string, number>();
  for (const a of activity) {
    const day = a.createdAt.slice(0, 10);
    activityByDay.set(day, (activityByDay.get(day) ?? 0) + 1);
  }

  return {
    user: {
      displayName: user.displayName,
      title: user.title,
      avatarId: user.avatarId,
      xpTotal: user.xpTotal,
    },
    level: levelProgress(user.xpTotal),
    streak: streak ?? { current: 0, longest: 0, lastActiveDay: null },
    stats,
    skills: skillsProfile(stats),
    xpSeries,
    continueTarget,
    missions: missionStates(missions).slice(0, 5),
    recentBadges,
    recentActivity,
    unreadNotifications: notifications.filter((n) => !n.read).length,
    recommendations: recommendations(stats),
    activityByDay: [...activityByDay.entries()],
  };
}
