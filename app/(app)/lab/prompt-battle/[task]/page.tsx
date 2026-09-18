import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
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

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/lab" className="hover:text-ink focus-ring rounded">AI Lab</Link>
        <span aria-hidden>/</span>
        <Link href="/lab/prompt-battle" className="hover:text-ink focus-ring rounded">Prompt Battle</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-300">{task.category}</span>
      </nav>
      <SectionHeading kicker={task.category} title={task.task} />
      <GlassCard className="mt-6 border-amber-400/25 bg-amber-400/5 p-5">
        <p className="text-sm text-ink-dim">
          <span className="font-semibold text-amber-300">Weak start:</span> “{task.weakExample}” — improve on this.
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
