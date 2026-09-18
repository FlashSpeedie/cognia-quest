import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { MODULES } from "@/content/modules";
import { missionStates } from "@/server/services/missions";
import { SectionHeading } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Quest Map" };
export const dynamic = "force-dynamic";

export default async function QuestMapPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const progress = await db.table("lesson_progress").find({ userId: user.id });
  const doneIds = new Set(progress.filter((p) => p.status === "completed").map((p) => p.lessonId));
  const startedIds = new Set(progress.filter((p) => p.status === "in_progress").map((p) => p.lessonId));
  const missions = missionStates(await db.table("mission_progress").find({ userId: user.id }));
  const finalDone = !!(await db.table("final_results").get(user.id));

  // Node states: complete (all lessons) / in-progress (any) / available (prev complete) / locked
  let prevComplete = true;
  const nodes = MODULES.map((m) => {
    const complete = m.lessons.every((l) => doneIds.has(l.id));
    const inProgress = m.lessons.some((l) => doneIds.has(l.id) || startedIds.has(l.id));
    const state = complete ? "complete" : inProgress ? "in_progress" : prevComplete ? "available" : "locked";
    prevComplete = complete;
    return { m, state };
  });

  const missionsDone = missions.filter((m) => m.status === "completed").length;

  return (
    <div>
      <SectionHeading
        kicker="Campaign map"
        title="AI Quest Map"
        description="Your route through the curriculum. Nodes unlock as modules complete. The summit is the Final AI Challenge."
      />

      <div className="mx-auto mt-10 max-w-md">
        {/* summit */}
        <Link href="/final-challenge" className="focus-ring block rounded-3xl">
          <div className={`rounded-3xl border p-6 text-center transition-transform hover:-translate-y-1 ${
            finalDone ? "border-amber-400/50 bg-amber-400/10 shadow-[0_0_40px_rgba(251,191,36,0.15)]" : "border-volt-400/40 bg-volt-400/10"
          }`}>
            <span className="text-4xl" aria-hidden="true">🏆</span>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">Final Mission</p>
            <p className="font-display text-xl font-black text-ink">{finalDone ? "CONQUERED" : "FINAL AI MISSION"}</p>
            <p className="mt-1 text-xs text-ink-faint">{missionsDone}/10 missions · {finalDone ? "certificate unlocked" : "requires missions 1–9"}</p>
          </div>
        </Link>

        {/* path (rendered top→down, reversed for summit-first) */}
        {[...nodes].reverse().map(({ m, state }) => {
          const firstLesson = m.lessons[0];
          return (
            <div key={m.id}>
              <Connector active={state !== "locked"} />
              <Link
                href={state === "locked" ? "#" : `/academy/${m.slug}/${firstLesson!.slug}`}
                aria-disabled={state === "locked"}
                className={`focus-ring block rounded-2xl ${state === "locked" ? "pointer-events-none" : ""}`}
              >
                <div
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                    state === "complete"
                      ? "border-mint-400/40 bg-mint-400/8"
                      : state === "in_progress"
                        ? "border-pulse-400/50 bg-pulse-400/10 shadow-glow"
                        : state === "available"
                          ? "border-void-700 bg-void-800/80 hover:border-pulse-400/40"
                          : "border-void-700/50 bg-void-900/40 opacity-60"
                  }`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    state === "complete" ? "bg-mint-400/15 text-mint-300" : state === "in_progress" ? "bg-pulse-400/20 text-pulse-300" : "bg-void-700 text-ink-faint"
                  }`}>
                    <Icon name={(state === "complete" ? "check" : state === "locked" ? "lock" : m.icon) as IconName} size={22} />
                  </span>
                  <div className="flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Level {m.order} · Module</p>
                    <p className={`font-display font-bold ${state === "locked" ? "text-ink-faint" : "text-ink"}`}>{m.title}</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{state.replace("_", " ")}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div aria-hidden="true" className="mx-auto h-8 w-px">
      <div className={`h-full w-full ${active ? "bg-gradient-to-b from-pulse-400 to-volt-400" : "bg-void-700"}`} />
    </div>
  );
}
