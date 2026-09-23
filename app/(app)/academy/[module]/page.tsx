import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { moduleBySlug } from "@/content/modules";
import { GlassCard, Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const m = moduleBySlug((await params).module);
  return { title: m ? `${m.title} - Academy` : "Module" };
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const m = moduleBySlug(moduleSlug);
  if (!m) notFound();

  const db = await getDb();
  const progress = await db.table("lesson_progress").find({ userId: user.id });
  const byLesson = new Map(progress.map((p) => [p.lessonId, p]));
  const doneCount = m.lessons.filter((l) => byLesson.get(l.id)?.status === "completed").length;
  const pct = Math.round((doneCount / m.lessons.length) * 100);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/academy" className="hover:text-ink focus-ring rounded">Academy</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">{m.title}</span>
      </nav>

      <GlassCard glow className="p-7">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pulse-400">Module {m.order}</p>
        <h1 className="mt-2 font-display text-3xl font-black text-ink">{m.title}</h1>
        <p className="mt-2 max-w-2xl text-ink-dim">{m.description}</p>
        <div className="mt-5 max-w-md">
          <ProgressBar value={pct} label={`${doneCount}/${m.lessons.length} lessons complete`} showValue tone={pct === 100 ? "mint" : "pulse"} />
        </div>
      </GlassCard>

      <ol className="mt-6 space-y-3">
        {m.lessons.map((l, i) => {
          const state = byLesson.get(l.id);
          const status = state?.status ?? "not_started";
          return (
            <li key={l.id}>
              <Link href={`/academy/${m.slug}/${l.slug}`} className="block focus-ring rounded-2xl">
                <Card className="flex flex-wrap items-center gap-4 p-4 transition hover:border-pulse-400/40">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                      status === "completed"
                        ? "bg-mint-400/15 text-mint-700 dark:text-mint-300"
                        : status === "in_progress"
                          ? "bg-pulse-400/15 text-pulse-700 dark:text-pulse-300"
                          : "bg-void-700 text-ink-faint"
                    }`}
                    aria-hidden="true"
                  >
                    {status === "completed" ? <Icon name="check" size={18} /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-display font-bold ${status === "completed" ? "text-ink" : "text-ink"}`}>{l.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-faint">{l.outcomes[0]}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {state?.quizBest != null && <span className="font-mono text-xs text-ink-faint">quiz {state.quizBest}%</span>}
                    <Chip tone={status === "completed" ? "mint" : status === "in_progress" ? "pulse" : "neutral"}>
                      {status === "completed" ? "done" : status === "in_progress" ? "in progress" : `${l.minutes} min`}
                    </Chip>
                    <Icon name="arrow-right" size={16} className="text-ink-faint" />
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
