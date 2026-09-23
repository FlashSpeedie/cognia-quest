import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "AI Lab" };
export const dynamic = "force-dynamic";

const LABS: { href: string; icon: IconName; title: string; desc: string; tag: string; tone: string }[] = [
  {
    href: "/lab/train-the-machine",
    icon: "cpu",
    title: "Train the Machine",
    desc: "Train a real classifier on your own dataset. Then sabotage the data and watch it fall apart.",
    tag: "core simulation",
    tone: "text-volt-700 dark:text-volt-300 border-volt-400/30",
  },
  {
    href: "/lab/prompt-lab",
    icon: "chat",
    title: "Prompt Lab",
    desc: "Write prompts, score them against an 8-dimension rubric, and learn the anatomy of great asks.",
    tag: "rubric engine",
    tone: "text-amber-600 dark:text-amber-300 border-amber-400/30",
  },
  {
    href: "/lab/prompt-battle",
    icon: "bolt",
    title: "Prompt Battle",
    desc: "Ten scenarios. One prompt each. Beat 80 to clear the mission.",
    tag: "game",
    tone: "text-pulse-700 dark:text-pulse-300 border-pulse-400/30",
  },
  {
    href: "/lab/bias-simulation",
    icon: "scale",
    title: "Bias Simulation",
    desc: "A scholarship recommender is quietly favoring students who live close to school. Find the leak.",
    tag: "investigation",
    tone: "text-mint-700 dark:text-mint-300 border-mint-400/30",
  },
  {
    href: "/lab/data-explorer",
    icon: "chart",
    title: "Dataset Explorer",
    desc: "Sort, filter, and hunt down missing values, outliers, duplicates, and imbalance before anyone trains on it.",
    tag: "forensics",
    tone: "text-mint-700 dark:text-mint-300 border-mint-400/30",
  },
  {
    href: "/lab/tool-selector",
    icon: "network",
    title: "AI Tool Selector",
    desc: "Match the task to the right tool - and learn when AI isn't the tool at all.",
    tag: "judgment drill",
    tone: "text-rose-400 border-rose-400/30",
  },
  {
    href: "/academy/machine-learning/overfitting",
    icon: "chart",
    title: "Overfitting Lab",
    desc: "The complexity slider: watch training accuracy hit 100% while test accuracy craters.",
    tag: "in Academy · ML module",
    tone: "text-pulse-700 dark:text-pulse-300 border-pulse-400/30",
  },
];

export default async function LabPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const runs = await db.table("sim_runs").find({ userId: user.id });
  const runCounts = new Map<string, number>();
  for (const r of runs) runCounts.set(r.simId, (runCounts.get(r.simId) ?? 0) + 1);

  return (
    <div>
      <SectionHeading
        kicker="STATUS: ONLINE"
        title="AI Lab"
        description="The laboratory: everything here does something. Models actually train. Prompts actually score. Simulations are honest about being simulations."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {LABS.map((lab) => (
          <Link key={lab.href} href={lab.href} className="focus-ring rounded-2xl">
            <GlassCard className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-void-800/60 ${lab.tone}`}>
                  <Icon name={lab.icon} size={22} />
                </span>
                <Chip tone="neutral" className="font-mono text-[10px] uppercase tracking-widest">{lab.tag}</Chip>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">{lab.title}</h3>
              <p className="mt-2 text-sm text-ink-dim">{lab.desc}</p>
              <p className="mt-4 font-mono text-xs text-ink-faint">
                {(runCounts.get(lab.href.split("/").pop() ?? "") ?? 0) > 0
                  ? `${runCounts.get(lab.href.split("/").pop() ?? "")} runs logged`
                  : "not run yet"}
              </p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
