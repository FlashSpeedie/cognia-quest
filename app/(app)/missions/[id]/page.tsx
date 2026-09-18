import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { missionById, missionStates } from "@/server/services/missions";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const m = missionById((await params).id);
  return { title: m ? `Mission ${String(m.order).padStart(2, "0")}: ${m.title}` : "Mission" };
}

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const mission = missionById(id);
  if (!mission) notFound();

  const db = await getDb();
  const all = await db.table("mission_progress").find({ userId: user.id });
  const states = missionStates(all);
  const state = states.find((s) => s.mission.id === id)!;

  return (
    <div className="max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/missions" className="hover:text-ink focus-ring rounded">Missions</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-300">MISSION {String(mission.order).padStart(2, "0")}</span>
      </nav>

      <GlassCard glow className="p-7">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pulse-400">MISSION {String(mission.order).padStart(2, "0")}</p>
        <h1 className="mt-2 font-display text-3xl font-black text-ink">{mission.title}</h1>
        <p className="mt-3 text-ink-dim">{mission.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip tone={mission.difficulty === "Easy" ? "mint" : mission.difficulty === "Medium" ? "amber" : "rose"}>{mission.difficulty}</Chip>
          <Chip tone="neutral">~{mission.minutes} min</Chip>
          <Chip tone="amber">+{mission.xp} XP</Chip>
          {mission.order === 10 && <Chip tone="volt">capstone</Chip>}
        </div>
      </GlassCard>

      <GlassCard className="mt-5 p-6">
        <h2 className="font-display text-lg font-bold text-ink">Objectives</h2>
        <ul className="mt-3 space-y-2.5">
          {mission.objectives.map((o) => {
            const done = state.objectivesDone.includes(o.id);
            return (
              <li key={o.id} className={`flex items-center gap-3 rounded-xl border p-3.5 text-sm ${done ? "border-mint-400/40 bg-mint-400/5" : "border-void-700"}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? "bg-mint-400/20 text-mint-300" : "bg-void-700 text-ink-faint"}`} aria-hidden="true">
                  {done ? <Icon name="check" size={13} /> : "○"}
                </span>
                <span className={done ? "text-mint-200" : "text-ink"}>{o.label}</span>
              </li>
            );
          })}
        </ul>

        {state.status === "locked" ? (
          <p className="mt-5 rounded-xl border border-void-700 bg-void-900/60 p-4 text-sm text-ink-faint">
            Finish the previous mission to unlock this one. The campaign is sequential — foundations first.
          </p>
        ) : state.status === "completed" ? (
          <div className="mt-5 rounded-xl border border-mint-400/30 bg-mint-400/10 p-4">
            <p className="font-semibold text-mint-300">Mission complete. Reward banked: +{mission.xp} XP.</p>
            <LinkButton variant="ghost" size="sm" href="/missions" className="mt-2">Back to campaigns</LinkButton>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-3">
            <LinkButton href={mission.href} size="lg">
              {state.status === "in_progress" ? "CONTINUE MISSION" : "START MISSION"}
            </LinkButton>
            <p className="text-xs text-ink-faint">Objectives complete automatically as you play.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
