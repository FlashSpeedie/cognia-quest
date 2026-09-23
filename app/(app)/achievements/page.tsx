import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { checkBadges } from "@/server/services/badges";
import { BADGES } from "@/content/badges";
import { GlassCard, SectionHeading } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const metadata: Metadata = { title: "Achievements" };
export const dynamic = "force-dynamic";

const RARITY_TONE = {
  common: "pulse",
  rare: "volt",
  epic: "amber",
  legendary: "mint",
} as const;

export default async function AchievementsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const { states } = await checkBadges(db, user.id);
  const byId = new Map(states.map((s) => [s.badgeId, s]));
  const earned = states.filter((s) => s.unlockedAt).length;

  return (
    <div>
      <SectionHeading
        kicker="Trophy room"
        title="Achievements"
        description={`${earned} of ${BADGES.length} unlocked. Every badge here was earned by doing, never by asking.`}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((def) => {
          const s = byId.get(def.id);
          const unlocked = !!s?.unlockedAt;
          const progress = s?.progress ?? 0;
          return (
            <GlassCard
              key={def.id}
              glow={unlocked}
              className={`relative overflow-hidden p-5 transition-transform hover:-translate-y-0.5 ${!unlocked && "opacity-80"}`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
                    unlocked ? "bg-gradient-to-br from-volt-500/30 to-pulse-500/30" : "bg-void-700/60 grayscale"
                  }`}
                  aria-hidden="true"
                >
                  {def.icon}
                </span>
                <Chip tone={RARITY_TONE[def.rarity]}>{def.rarity}</Chip>
              </div>
              <h3 className={`mt-4 font-display text-lg font-bold ${unlocked ? "text-ink" : "text-ink-dim"}`}>{def.title}</h3>
              <p className="mt-1 min-h-[2.5rem] text-sm text-ink-dim">{def.description}</p>
              {unlocked ? (
                <p className="mt-3 font-mono text-[11px] text-mint-700 dark:text-mint-300">
                  UNLOCKED {new Date(s.unlockedAt!).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                </p>
              ) : (
                <div className="mt-3">
                  <ProgressBar value={Math.round(progress * 100)} max={100} label={def.hint} showValue tone="volt" />
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
