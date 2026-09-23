import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { getDashboard } from "@/server/services/dashboard";
import { MODULES } from "@/content/modules";
import { GlassCard, Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { XPSpark, SkillsRadar, BarRow } from "@/components/charts/Charts";
import { ActivityCalendar } from "@/components/app/ActivityCalendar";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const d = await getDashboard(db, user);

  const firstName = d.user.displayName.split(" ")[0];
  const gainNote = d.level.next
    ? `${d.level.needed.toLocaleString()} XP to ${d.level.next.title}`
    : "Max level reached";

  return (
    <div className="space-y-6">
      {/* ── Command header ── */}
      <GlassCard glow className="relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-pulse-400">
              Welcome back, {firstName}
            </p>
            <h1 className="mt-2 font-display text-3xl font-black text-ink sm:text-4xl">
              Level {d.level.current.level} - {d.level.current.title}
            </h1>
            <div className="mt-4 max-w-md">
              <ProgressBar
                label={`${d.user.xpTotal.toLocaleString()} XP${d.level.next ? ` / ${d.level.next.minXP.toLocaleString()}` : ""}`}
                value={d.level.current ? d.user.xpTotal - d.level.current.minXP : 0}
                max={d.level.next ? d.level.next.minXP - d.level.current.minXP : 1}
                showValue
                tone="amber"
              />
              <p className="mt-1.5 text-xs text-ink-faint">{gainNote}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <ProgressRing value={d.stats.lessonsCompleted} max={MODULES.flatMap((m) => m.lessons).length} label="Lessons" centerLabel={`${d.stats.lessonsCompleted}`} size={84} />
              <p className="mt-1 text-[11px] text-ink-faint">lessons done</p>
            </div>
            <div className="text-center">
              <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full border-2 border-amber-400/40 bg-amber-400/10">
                <Icon name="flame" size={22} className="text-amber-400" />
                <span className="font-display text-lg font-black text-ink">{d.streak.current}</span>
              </div>
              <p className="mt-1 text-[11px] text-ink-faint">day streak · best {d.streak.longest}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left column: continue + missions ── */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {d.continueTarget ? (
            <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-mint-700 dark:text-mint-300">Continue learning</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">
                  {d.continueTarget.detail}: {d.continueTarget.label}
                </p>
              </div>
              <LinkButton href={d.continueTarget.href}>
                Continue <Icon name="arrow-right" size={16} />
              </LinkButton>
            </Card>
          ) : (
            <Card className="p-5">
              <p className="font-display text-lg font-bold text-ink">Path complete - incredible.</p>
              <p className="text-sm text-ink-dim">Every lesson finished. The Final Challenge awaits if you haven&apos;t claimed it.</p>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-ink">Recommended for you</h2>
            <ul className="mt-3 space-y-3">
              {d.recommendations.map((r) => (
                <li key={r.id}>
                  <Link href={r.href} className="flex items-center justify-between gap-3 rounded-xl border border-void-700/70 p-3.5 transition hover:border-pulse-400/40 hover:bg-void-800/50 focus-ring">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{r.title}</p>
                      <p className="text-xs text-ink-dim">{r.reason}</p>
                    </div>
                    <Icon name="arrow-right" size={16} className="shrink-0 text-ink-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Missions */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-ink">Active missions</h2>
              <Link href="/missions" className="text-xs font-semibold text-pulse-700 dark:text-pulse-300 hover:underline focus-ring rounded">View all</Link>
            </div>
            <ul className="mt-3 space-y-2.5">
              {d.missions.map((m) => (
                <li key={m.mission.id}>
                  <Link href={`/missions/${m.mission.id}`} className="flex items-center gap-3 rounded-xl border border-void-700/70 p-3 transition hover:border-pulse-400/40 focus-ring">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-[11px] font-bold ${
                      m.status === "completed" ? "bg-mint-400/15 text-mint-700 dark:text-mint-300" : m.status === "locked" ? "bg-void-700 text-ink-faint" : "bg-pulse-400/15 text-pulse-700 dark:text-pulse-300"
                    }`}>
                      {m.status === "completed" ? <Icon name="check" size={15} /> : m.status === "locked" ? <Icon name="lock" size={14} /> : String(m.mission.order).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${m.status === "locked" ? "text-ink-faint" : "text-ink"}`}>{m.mission.title}</p>
                      <p className="text-[11px] text-ink-faint">{m.mission.xp} XP · {m.mission.objectives.filter(o => m.objectivesDone.includes(o.id)).length}/{m.mission.objectives.length} objectives</p>
                    </div>
                    <Chip tone={m.status === "completed" ? "mint" : m.status === "locked" ? "neutral" : "pulse"}>
                      {m.status}
                    </Chip>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Module mastery */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-ink">Module mastery</h2>
            <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {MODULES.filter((m) => m.id !== "final").map((m) => (
                <BarRow key={m.id} label={m.title} value={d.stats.modulePct[m.id] ?? 0} tone={m.color === "rose" ? "amber" : m.color === "amber" ? "amber" : m.color} />
              ))}
            </div>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="min-w-0 space-y-6">
          <ActivityCalendar activityByDay={d.activityByDay} />

          <Card className="p-5">
            <h2 className="font-display font-bold text-ink">XP this fortnight</h2>
            <div className="mt-3">
              <XPSpark points={d.xpSeries} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-bold text-ink">Skills profile</h2>
            <p className="mt-1 text-[11px] text-ink-faint">Learning indicators - not formal assessments</p>
            <div className="mt-3">
              <SkillsRadar skills={d.skills.map((s) => ({ label: s.label, value: s.value }))} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-ink">Recent badges</h2>
              <Link href="/achievements" className="text-xs font-semibold text-pulse-600 hover:underline focus-ring rounded dark:text-pulse-700 dark:text-pulse-300">All</Link>
            </div>
            {d.recentBadges.length === 0 ? (
              <p className="mt-3 text-sm text-ink-faint">None yet - your first badge is one lesson away.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {d.recentBadges.map(({ state, def }) => (
                  <li key={state.id} className="flex items-center gap-3 rounded-xl border border-volt-400/20 bg-volt-400/5 p-3">
                    <span className="text-2xl" aria-hidden="true">{def.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{def.title}</p>
                      <p className="text-[11px] text-ink-faint">
                        {state.unlockedAt ? new Date(state.unlockedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-bold text-ink">Recent activity</h2>
            {d.recentActivity.length === 0 ? (
              <p className="mt-3 text-sm text-ink-faint">Your journey starts with one lesson.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {d.recentActivity.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2 text-ink-dim">
                    <span className="truncate">{a.label}</span>
                    <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
