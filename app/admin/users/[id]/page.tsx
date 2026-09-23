import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/server/db/db";
import { getSessionUser } from "@/server/auth/session";
import { levelFor } from "@/lib/levels";
import { BADGES } from "@/content/badges";
import { MODULES } from "@/content/modules";
import { Card, GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UserAdminActions } from "@/components/admin/UserAdminActions";

export const metadata: Metadata = { title: "Admin - User detail" };
export const dynamic = "force-dynamic";

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await getSessionUser();
  if (!caller || caller.role !== "admin") notFound();

  const db = await getDb();
  const user = await db.table("users").get(id);
  if (!user) notFound();

  const [badges, lessons, missions, activity, streak] = await Promise.all([
    db.table("badge_states").find({ userId: id }),
    db.table("lesson_progress").find({ userId: id }),
    db.table("mission_progress").find({ userId: id }),
    db.table("activity").find({ userId: id }),
    db.table("streaks").get(id),
  ]);

  const level = levelFor(user.xpTotal);
  const earnedBadges = badges.filter((b) => b.unlockedAt);
  const completedLessons = lessons.filter((l) => l.status === "completed");
  const completedMissions = missions.filter((m) => m.status === "completed");
  const recentActivity = [...activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">Admin / Users / Detail</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">
            <span aria-hidden className="mr-2">{user.avatarId}</span>
            {user.displayName}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip tone={user.role === "admin" ? "amber" : user.isDemo ? "volt" : "pulse"}>
              {user.role === "admin" ? "admin" : user.isDemo ? "demo" : "student"}
            </Chip>
            <Chip tone={user.status === "suspended" ? "rose" : "mint"}>
              {user.status === "suspended" ? "suspended" : "active"}
            </Chip>
            <Chip tone="neutral">{level.title}</Chip>
            <Chip tone="neutral">{user.xpTotal.toLocaleString()} XP</Chip>
          </div>
        </div>
        <UserAdminActions
          userId={user.id}
          displayName={user.displayName}
          status={user.status ?? "active"}
          isAdmin={user.role === "admin"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Account</h2>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-ink-faint">Email</dt><dd className="text-ink">{user.email}</dd>
            <dt className="text-ink-faint">Joined</dt><dd className="text-ink">{new Date(user.createdAt).toLocaleDateString()}</dd>
            <dt className="text-ink-faint">Onboarding</dt><dd className="text-ink">{user.onboarding.completed ? "completed" : "pending"}</dd>
            <dt className="text-ink-faint">Streak</dt><dd className="text-ink">{streak ? `${streak.current} day (best ${streak.longest})` : "none"}</dd>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Learning progress</h2>
          <div className="mt-4 space-y-4">
            <ProgressBar
              label={`Lessons: ${completedLessons.length}/${MODULES.flatMap((m) => m.lessons).length}`}
              value={completedLessons.length}
              max={MODULES.flatMap((m) => m.lessons).length}
              tone="pulse"
            />
            <ProgressBar
              label={`Missions: ${completedMissions.length}/10`}
              value={completedMissions.length}
              max={10}
              tone="mint"
            />
            <ProgressBar
              label={`Badges: ${earnedBadges.length}/${BADGES.length}`}
              value={earnedBadges.length}
              max={BADGES.length}
              tone="amber"
            />
          </div>
          {earnedBadges.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {earnedBadges.map((b) => {
                const def = BADGES.find((d) => d.id === b.badgeId);
                return def ? (
                  <li key={b.badgeId} className="rounded-lg border border-void-700 px-2.5 py-1 text-xs text-ink-dim">
                    <span aria-hidden className="mr-1">{def.icon}</span>{def.title}
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-ink">Recent activity</h2>
        {recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">No recorded activity yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 border-b border-void-700/40 pb-2 text-sm last:border-0">
                <span className="text-ink-dim">{a.label}</span>
                <span className="shrink-0 font-mono text-xs text-ink-faint">
                  {new Date(a.createdAt).toLocaleDateString()} {new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
