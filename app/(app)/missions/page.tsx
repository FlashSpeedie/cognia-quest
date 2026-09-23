import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { missionStates } from "@/server/services/missions";
import { SectionHeading } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Missions" };
export const dynamic = "force-dynamic";

export default async function MissionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const progress = await db.table("mission_progress").find({ userId: user.id });
  const states = missionStates(progress);
  const completed = states.filter((s) => s.status === "completed").length;

  return (
    <div>
      <SectionHeading
        kicker="Campaign"
        title="Missions"
        description="Ten operations that string the whole curriculum into a campaign. Each unlocks the next. Rewards are verified server-side."
      />
      <div className="mt-6 max-w-sm">
        <ProgressBar value={completed} max={10} label={`Campaign progress - ${completed}/10`} showValue tone="volt" />
      </div>
      <ol className="mt-8 space-y-3">
        {states.map(({ mission, status, objectivesDone }) => {
          const doneObjectives = mission.objectives.filter((o) => objectivesDone.includes(o.id)).length;
          return (
            <li key={mission.id}>
              <Link
                href={status === "locked" ? "#" : `/missions/${mission.id}`}
                aria-disabled={status === "locked"}
                className={`block focus-ring rounded-2xl ${status === "locked" ? "pointer-events-none opacity-60" : ""}`}
              >
                <div className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition-all sm:p-5 ${
                  status === "completed" ? "border-mint-400/30 bg-mint-400/5" : status === "locked" ? "border-void-700/50 bg-void-900/40" : "border-void-700 bg-void-800/80 hover:border-pulse-400/40 hover:shadow-glow"
                }`}>
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black ${
                    status === "completed" ? "bg-mint-400/15 text-mint-700 dark:text-mint-300" : status === "locked" ? "bg-void-700 text-ink-faint" : "bg-gradient-to-br from-pulse-500 to-volt-500 text-white"
                  }`}>
                    {status === "locked" ? <Icon name="lock" size={18} /> : status === "completed" ? <Icon name="check" size={20} /> : String(mission.order).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-display font-bold ${status === "locked" ? "text-ink-faint" : "text-ink"}`}>
                        {mission.order === 10 && <span className="mr-1 text-amber-400">★</span>}
                        {mission.title}
                      </h3>
                      <Chip tone={mission.difficulty === "Easy" ? "mint" : mission.difficulty === "Medium" ? "amber" : "rose"}>{mission.difficulty}</Chip>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-ink-dim">{mission.description}</p>
                  </div>
                  <div className="text-right font-mono text-xs text-ink-faint">
                    <p>{mission.xp} XP · ~{mission.minutes} min</p>
                    <p className="mt-1">{doneObjectives}/{mission.objectives.length} objectives</p>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
