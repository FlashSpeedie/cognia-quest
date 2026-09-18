import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { PROMPT_TASKS } from "@/content/prompts";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Prompt Battle — AI Lab" };
export const dynamic = "force-dynamic";

export default async function PromptBattlePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const attempts = await db.table("prompt_attempts").find({ userId: user.id });
  const bestByTask = new Map<string, number>();
  for (const a of attempts) {
    bestByTask.set(a.taskId, Math.max(bestByTask.get(a.taskId) ?? 0, a.score));
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/lab" className="hover:text-ink focus-ring rounded">AI Lab</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-300">Prompt Battle</span>
      </nav>
      <SectionHeading
        kicker="10 arenas"
        title="Prompt Battle"
        description="One task, one prompt each. Scores are from the rubric — beat 80 to clear a stage. Replays welcome; XP is earned once per tier per task."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PROMPT_TASKS.map((t) => {
          const best = bestByTask.get(t.id);
          const cleared = (best ?? 0) >= 80;
          return (
            <Link key={t.id} href={`/lab/prompt-battle/${t.id}`} className="focus-ring rounded-2xl">
              <GlassCard className="h-full p-5 transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="flex items-start justify-between">
                  <Chip tone={cleared ? "mint" : best != null ? "amber" : "neutral"}>
                    {cleared ? `cleared · ${best}` : best != null ? `best ${best}` : "unattempted"}
                  </Chip>
                  <Icon name="bolt" size={16} className={cleared ? "text-amber-400" : "text-ink-faint"} />
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t.category}</p>
                <h3 className="mt-1 font-display font-bold text-ink">{t.task}</h3>
                <p className="mt-2 text-xs italic text-ink-faint">weak start: “{t.weakExample}”</p>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
