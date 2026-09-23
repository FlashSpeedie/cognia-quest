import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { getUserStats } from "@/server/services/stats";
import { levelProgress } from "@/lib/levels";
import { BADGES } from "@/content/badges";
import { GlassCard, SectionHeading, Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProfileEditor } from "@/components/app/ProfileEditor";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const stats = await getUserStats(db, user.id);
  const badgeStates = await db.table("badge_states").find({ userId: user.id });
  const unlocked = badgeStates.filter((b) => b.unlockedAt);
  const level = levelProgress(user.xpTotal);

  return (
    <div>
      <SectionHeading kicker="Identity" title="Profile" />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <GlassCard glow className="p-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pulse-500/25 to-volt-500/25 text-5xl" aria-hidden="true">
            {user.avatarId}
          </div>
          <h2 className="mt-4 font-display text-2xl font-black text-ink">{user.displayName}</h2>
          <Chip tone="volt" className="mt-2">
            Level {level.current.level} · {level.current.title}
          </Chip>
          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-void-700 pt-5 text-center">
            {[
              ["XP", user.xpTotal.toLocaleString()],
              ["Badges", String(unlocked.length)],
              ["Missions", `${stats.missionsCompleted}/10`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{k}</dt>
                <dd className="mt-1 font-display text-xl font-bold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          {user.isDemo && (
            <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-2 text-xs text-amber-600 dark:text-amber-300">
              Demo account - progress resets when the demo database is reseeded.
            </p>
          )}
        </GlassCard>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-ink">Edit identity</h3>
          <p className="mt-1 text-sm text-ink-dim">
            Pick a display name and avatar. No real names required - nicknames are privacy-smart.
          </p>
          <ProfileEditor initialName={user.displayName} initialAvatar={user.avatarId} />
          <h3 className="mt-8 font-display text-lg font-bold text-ink">Badge shelf</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {unlocked.length === 0 && <p className="text-sm text-ink-faint">No badges yet - they&apos;re waiting in the Academy and the Lab.</p>}
            {unlocked.map((s) => {
              const def = BADGES.find((b) => b.id === s.badgeId);
              if (!def) return null;
              return (
                <span key={s.id} title={def.description} className="rounded-full border border-volt-400/30 bg-volt-400/10 px-3 py-1 text-xs font-semibold text-volt-700 dark:text-volt-300">
                  {def.icon} {def.title}
                </span>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
