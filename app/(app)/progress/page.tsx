import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { getUserStats, skillsProfile } from "@/server/services/stats";
import { levelProgress } from "@/lib/levels";
import { MODULES } from "@/content/modules";
import { GlassCard, SectionHeading, Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { XPSpark, SkillsRadar } from "@/components/charts/Charts";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Progress" };
export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const [stats, streak, xpEvents, missionProgress] = await Promise.all([
    getUserStats(db, user.id),
    db.table("streaks").get(user.id),
    db.table("xp_events").find({ userId: user.id }),
    db.table("mission_progress").find({ userId: user.id }),
  ]);

  const level = levelProgress(user.xpTotal);
  const perDay = new Map<string, number>();
  for (const e of xpEvents) perDay.set(e.day, (perDay.get(e.day) ?? 0) + e.amount);
  const xpSeries = [...perDay.entries()].sort().slice(-21).map(([day, xp]) => ({ day, xp }));
  const skills = skillsProfile(stats);
  const totalLessons = MODULES.flatMap((m) => m.lessons).length;

  return (
    <div>
      <SectionHeading
        kicker="Analytics"
        title="Your progress"
        description="Everything below is a learning indicator for reflection - not a grade, and not a judgment."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total XP", value: user.xpTotal.toLocaleString(), sub: `Level ${level.current.level}` },
          { label: "Lessons", value: `${stats.lessonsCompleted}/${totalLessons}`, sub: "completed" },
          { label: "Missions", value: `${stats.missionsCompleted}/10`, sub: "completed" },
          { label: "Quiz accuracy", value: stats.quizzesTaken ? `${stats.quizAccuracy}%` : "-", sub: `${stats.quizzesTaken} attempts` },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-black text-ink">{s.value}</p>
            <p className="mt-1 text-xs text-ink-dim">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h2 className="font-display text-lg font-bold text-ink">XP history</h2>
          <p className="mt-1 text-xs text-ink-faint">
            Streak: {streak?.current ?? 0} days (best {streak?.longest ?? 0}) - one meaningful activity per day keeps it alive. No endless-guilt mechanics.
          </p>
          <div className="mt-4">
            <XPSpark points={xpSeries} />
          </div>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-ink">Skills radar</h2>
          <SkillsRadar skills={skills.map((s) => ({ label: s.label, value: s.value }))} />
          <ul className="mt-3 space-y-1.5">
            {skills.map((s) => (
              <li key={s.label} className="flex justify-between text-xs">
                <span className="text-ink-dim">{s.label}</span>
                <span className="font-mono text-ink">{s.value}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Modules</h2>
          <div className="mt-4 space-y-4">
            {MODULES.map((m) => {
              const pct = stats.modulePct[m.id] ?? 0;
              return (
                <Link key={m.id} href={`/academy/${m.slug}`} className="block focus-ring rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Icon name={m.icon as never} size={16} className="text-pulse-700 dark:text-pulse-300" />
                      {m.title}
                    </span>
                    {pct === 100 && <Chip tone="mint">complete</Chip>}
                  </div>
                  <ProgressBar className="mt-2" value={pct} label={`${pct}%`} tone={pct === 100 ? "mint" : "pulse"} />
                </Link>
              );
            })}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Activity log</h2>
          <MiniActivity userId={user.id} />
        </Card>
      </div>
    </div>
  );
}

async function MiniActivity({ userId }: { userId: string }) {
  const db = await getDb();
  const items = (await db.table("activity").find({ userId }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);
  if (items.length === 0) return <p className="mt-4 text-sm text-ink-faint">Nothing yet - complete a lesson to start the log.</p>;
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((a) => (
        <li key={a.id} className="flex items-baseline justify-between gap-3 border-b border-void-700/40 pb-2 text-sm last:border-0">
          <span className="text-ink-dim">{a.label}</span>
          <time className="shrink-0 font-mono text-[10px] text-ink-faint" dateTime={a.createdAt}>
            {new Date(a.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </time>
        </li>
      ))}
    </ul>
  );
}
