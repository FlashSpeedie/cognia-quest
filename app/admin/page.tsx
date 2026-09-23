import type { Metadata } from "next";
import { getDb } from "@/server/db/db";
import { getAdminOverview } from "@/server/services/admin";
import { SectionHeading, Card, GlassCard } from "@/components/ui/Card";
import { BarRow } from "@/components/charts/Charts";
import { MODULES } from "@/content/modules";
import { MISSIONS } from "@/content/missions";
import { BADGES } from "@/content/badges";
import { QUIZZES } from "@/content/quizzes";
import { DETECTIVE_CASES } from "@/content/detective";
import { ETHICS_CASES } from "@/content/ethics";
import { PRIVACY_SCENARIOS } from "@/content/privacy";
import { PROMPT_TASKS } from "@/content/prompts";
import { GLOSSARY } from "@/content/glossary";

export const metadata: Metadata = { title: "Admin - Overview" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const db = await getDb();
  const o = await getAdminOverview(db);

  const cards = [
    { label: "Students", value: o.totals.students, sub: `${o.totals.realStudents} real + demo` },
    { label: "Active today", value: o.totals.activeToday, sub: `${o.totals.activeWeek} this week` },
    { label: "Lessons completed", value: o.totals.lessonsCompleted, sub: "across all students" },
    { label: "Missions completed", value: o.totals.missionsCompleted, sub: "across all students" },
    { label: "Badges earned", value: o.totals.badgesEarned, sub: `${o.badgeDistribution[0]?.title ?? "-"} most common` },
    { label: "XP awarded", value: o.totals.totalXPAwarded.toLocaleString(), sub: "server-validated only" },
  ];

  return (
    <div>
      <SectionHeading kicker="Console" title="Admin Overview" description="Aggregate metrics only - no drill-down into private content, per the platform's privacy posture." />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-black text-ink">{c.value}</p>
            <p className="mt-1 text-xs text-ink-dim">{c.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Module completion</h2>
          <div className="mt-4 space-y-3">
            {o.moduleCompletion.map((m) => (
              <BarRow key={m.id} label={m.title} value={m.pct} right={`${m.done}/${m.possible}`} />
            ))}
          </div>
        </Card>
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Badge distribution</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {o.badgeDistribution.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-lg border border-void-700/60 px-3 py-2 text-sm">
                <span className="text-ink-dim"><span aria-hidden className="mr-1.5">{b.icon}</span>{b.title}</span>
                <span className="font-mono text-ink">{b.count}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-ink">Content inventory</h2>
        <p className="mt-1 text-xs text-ink-dim">
          Content is data-driven (the <code className="font-mono text-pulse-700 dark:text-pulse-300">content/</code> directory) - adding modules, lessons, or cases requires no UI changes.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Modules", MODULES.length],
            ["Lessons", MODULES.flatMap((m) => m.lessons).length],
            ["Quiz questions", QUIZZES.flatMap((q) => q.questions).length],
            ["Missions", MISSIONS.length],
            ["Badges", BADGES.length],
            ["Detective cases", DETECTIVE_CASES.length],
            ["Ethics cases", ETHICS_CASES.length],
            ["Privacy + Prompts", PRIVACY_SCENARIOS.length + PROMPT_TASKS.length],
            ["Glossary terms", GLOSSARY.length],
          ].map(([label, n]) => (
            <div key={label as string} className="rounded-xl border border-void-700/60 p-3 text-center">
              <p className="font-display text-xl font-black text-ink">{n}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-ink-faint">{label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
