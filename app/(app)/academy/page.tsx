import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { MODULES } from "@/content/modules";
import { GlassCard, SectionHeading } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Academy" };
export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const progress = await db.table("lesson_progress").find({ userId: user.id });
  const doneIds = new Set(progress.filter((p) => p.status === "completed").map((p) => p.lessonId));

  return (
    <div>
      <SectionHeading
        kicker="The learning path"
        title="Academy"
        description="Seven modules. Each lesson: concept → see it → try it → check it. Everything you do here feeds missions, XP, and badges."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {MODULES.map((m) => {
          const done = m.lessons.filter((l) => doneIds.has(l.id)).length;
          const pct = m.lessons.length ? Math.round((done / m.lessons.length) * 100) : 0;
          const started = m.lessons.some((l) => doneIds.has(l.id));
          return (
            <Link key={m.id} href={`/academy/${m.slug}`} className="focus-ring rounded-2xl">
              <GlassCard className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="flex items-start justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl border text-pulse-700 dark:text-pulse-300 border-${m.color}-400/30 bg-void-800/60`}>
                    <Icon name={m.icon as never} size={22} />
                  </span>
                  <Chip tone={pct === 100 ? "mint" : started ? "pulse" : "neutral"}>
                    {pct === 100 ? "complete" : started ? "in progress" : "not started"}
                  </Chip>
                </div>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">Module {m.order}</p>
                <h3 className="mt-1 font-display text-xl font-bold text-ink">{m.title}</h3>
                <p className="mt-2 text-sm text-ink-dim">{m.tagline}</p>
                <div className="mt-4">
                  <ProgressBar value={pct} label={`${done}/${m.lessons.length} lessons`} showValue />
                </div>
                <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-ink-faint">
                  <Icon name="book" size={13} /> {m.lessons.reduce((n, l) => n + l.minutes, 0)} min
                  <span className="mx-1">·</span>
                  <Icon name="bolt" size={13} className="text-amber-400" /> {m.lessons.reduce((n, l) => n + l.xp, 0)} XP available
                </p>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
