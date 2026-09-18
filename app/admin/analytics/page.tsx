import type { Metadata } from "next";
import { getDb } from "@/server/db/db";
import { getAdminOverview } from "@/server/services/admin";
import { SectionHeading, Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export const metadata: Metadata = { title: "Admin — Analytics" };
export const dynamic = "force-dynamic";

export default async function AdminAnalytics() {
  const db = await getDb();
  const o = await getAdminOverview(db);
  const maxDay = Math.max(1, ...o.activitySeries.map((d) => d.count));

  return (
    <div>
      <SectionHeading kicker="Telemetry" title="Learning Analytics" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Activity — last 14 days</h2>
          <div className="mt-4 flex h-36 items-end gap-1.5" role="img" aria-label={`Daily activity chart, peak ${maxDay} actions`}>
            {o.activitySeries.map((d) => (
              <div key={d.day} className="group relative flex-1" title={`${d.day}: ${d.count} actions`}>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-pulse-500/60 to-volt-500/60 transition-all group-hover:from-pulse-400 group-hover:to-volt-400"
                  style={{ height: `${(d.count / maxDay) * 100 || 2}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[9px] text-ink-faint">
            <span>{o.activitySeries[0]?.day.slice(5)}</span>
            <span>{o.activitySeries.at(-1)?.day.slice(5)}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Mission funnel</h2>
          <ul className="mt-4 space-y-2">
            {o.missionCompletion.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-void-700/60 px-3 py-2 text-sm">
                <span className="min-w-0 truncate text-ink-dim">
                  <span className="mr-1.5 font-mono text-[10px] text-ink-faint">M{String(m.order).padStart(2, "0")}</span>
                  {m.title}
                </span>
                <Chip tone={m.completed > 0 ? "mint" : "neutral"}>{m.completed} done</Chip>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Quiz difficulty</h2>
          <ul className="mt-4 space-y-2">
            {o.quizStats.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink-dim">{q.title}</span>
                <span className="font-mono text-xs text-ink-faint">{q.attempts} tries</span>
                <span className={`font-mono text-xs font-bold ${q.accuracy == null ? "text-ink-faint" : q.accuracy >= 80 ? "text-mint-300" : q.accuracy >= 60 ? "text-amber-300" : "text-rose-400"}`}>
                  {q.accuracy == null ? "—" : `${q.accuracy}%`}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Detective case difficulty</h2>
          <ul className="mt-4 space-y-2">
            {o.detectiveStats.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink-dim">{c.title}</span>
                <span className="font-mono text-xs text-ink-faint">{c.attempts} tries</span>
                <span className={`font-mono text-xs font-bold ${c.solveRate == null ? "text-ink-faint" : c.solveRate >= 80 ? "text-mint-300" : c.solveRate >= 50 ? "text-amber-300" : "text-rose-400"}`}>
                  {c.solveRate == null ? "—" : `${c.solveRate}% solved`}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
