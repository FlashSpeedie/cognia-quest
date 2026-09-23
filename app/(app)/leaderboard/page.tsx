import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { levelFor } from "@/lib/levels";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

export const metadata: Metadata = { title: "Leaderboard" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const users = await db.table("users").all();
  const entries = users
    .filter((u) => u.preferences.leaderboardOptIn && u.role === "student")
    .map((u) => ({ name: u.displayName, xp: u.xpTotal, title: levelFor(u.xpTotal).title, me: u.id === user.id }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 50);

  return (
    <div className="max-w-xl">
      <SectionHeading
        kicker="Opt-in only"
        title="Leaderboard"
        description="Friendly, voluntary, minimal: display names and XP only. No ranks are worth your wellbeing - learning is, and stays, personal."
      />
      {entries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="⚡"
            title="The board is quiet"
            description="Nobody has opted in yet. Flip the leaderboard switch in Settings if you'd like to appear - it's entirely optional."
            action={<LinkButton href="/settings" variant="secondary">Open settings</LinkButton>}
          />
        </div>
      ) : (
        <GlassCard className="mt-8 overflow-hidden p-0">
          <ol className="divide-y divide-void-700/40">
            {entries.map((e, i) => (
              <li key={i} className={`flex items-center gap-3 px-5 py-3.5 ${e.me ? "bg-pulse-400/10" : ""}`}>
                <span className="w-8 font-mono text-sm text-ink-faint">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span className="flex-1 font-semibold text-ink">{e.name} {e.me && <Chip tone="pulse">you</Chip>}</span>
                <span className="font-mono text-xs text-ink-faint">{e.title}</span>
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-300">{e.xp.toLocaleString()} XP</span>
              </li>
            ))}
          </ol>
        </GlassCard>
      )}
    </div>
  );
}
