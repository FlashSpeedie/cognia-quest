import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { promptTaskById } from "@/content/prompts";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { PromptLabClient } from "@/components/lab/PromptLabClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ task: string }> }): Promise<Metadata> {
  const t = promptTaskById((await params).task);
  return { title: t ? `Prompt Battle: ${t.category}` : "Prompt Battle" };
}

export default async function PromptBattleTaskPage({ params }: { params: Promise<{ task: string }> }) {
  const taskId = (await params).task;
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const task = promptTaskById(taskId);
  if (!task) notFound();

  const db = await getDb();
  const attempts = await db.table("prompt_attempts").find({ userId: user.id, taskId: task.id });
  const best = attempts.reduce((m, a) => Math.max(m, a.score), 0);
  const recent = [...attempts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/lab" className="hover:text-ink focus-ring rounded">AI Lab</Link>
        <span aria-hidden>/</span>
        <Link href="/lab/prompt-battle" className="hover:text-ink focus-ring rounded">Prompt Battle</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">{task.category}</span>
      </nav>
      <SectionHeading kicker={task.category} title={task.task} />
      {attempts.length > 0 && (
        <GlassCard className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm text-ink-dim">Your best on this task</p>
            <p className="mt-1 flex gap-1" aria-label={`Recent attempts: ${recent.map((a) => a.score).join(", ")}`}>
              {recent.map((a) => (
                <span
                  key={a.id}
                  title={new Date(a.createdAt).toLocaleString()}
                  className={`inline-block h-2.5 w-2.5 rounded-full ${a.score >= 80 ? "bg-mint-400" : a.score >= 50 ? "bg-amber-400" : "bg-void-700"}`}
                />
              ))}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-display text-2xl font-black ${best >= 80 ? "text-mint-700 dark:text-mint-300" : "text-ink"}`}>{best}/100</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{attempts.length} attempt{attempts.length === 1 ? "" : "s"}</p>
          </div>
        </GlassCard>
      )}
      <GlassCard className="mt-6 border-amber-400/25 bg-amber-400/5 p-5">
        <p className="text-sm text-ink-dim">
          <span className="font-semibold text-amber-600 dark:text-amber-300">Weak start:</span> “{task.weakExample}” - improve on this.
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          Strong prompts here usually name: {task.expectations.join(" · ")}
        </p>
      </GlassCard>
      <div className="mt-6">
        <PromptLabClient taskId={task.id} />
      </div>
    </div>
  );
}
