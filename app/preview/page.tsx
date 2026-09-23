import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/app/page";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { AIOrNot } from "@/components/widgets/AIOrNot";
import { MODULES } from "@/content/modules";
import { DETECTIVE_CASES } from "@/content/detective";
import { Icon } from "@/components/ui/Icon";
import { isDemoEnabled } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Preview the Learning Experience",
  description: "Try Cognia Quest before you sign up: sort AI from not-AI, browse the learning path, and peek at detective cases and ethics scenarios.",
  path: "/preview",
});

export default function PreviewPage() {
  const s = DETECTIVE_CASES[0]!;
  return (
    <div className="app-backdrop min-h-screen">
      <PublicNav demoEnabled={isDemoEnabled()} />
      <main id="main" className="mx-auto max-w-5xl px-4 pb-24 pt-32">
        <SectionHeading
          kicker="Try before you enroll"
          title="A taste of the experience"
          description="This is what 'interactive' means at Cognia Quest. Everything below is playable right now, no account needed."
        />

        {/* Fundamentals preview: playable */}
        <section className="mt-14">
          <Chip tone="pulse" className="mb-3 font-mono uppercase tracking-widest">AI Fundamentals · Lesson 1</Chip>
          <h2 className="font-display text-2xl font-bold text-ink">AI or Not?</h2>
          <p className="mt-1 mb-5 max-w-2xl text-ink-dim">
            Eight systems. Which are actually AI? This is the real activity from the first lesson of the course.
          </p>
          <AIOrNot />
        </section>

        {/* Learning preview: modules */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-ink">The full learning path</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {MODULES.map((m) => (
              <GlassCard key={m.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">Module {m.order}</p>
                    <h3 className="mt-1 font-display text-lg font-bold text-ink">{m.title}</h3>
                  </div>
                  <span className="rounded-lg border border-void-700 bg-void-800 p-2 text-pulse-700 dark:text-pulse-300">
                    <Icon name={m.icon as never} size={18} />
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-dim">{m.tagline}</p>
                <p className="mt-3 font-mono text-xs text-ink-faint">
                  {m.lessons.length} lessons · {m.lessons.reduce((n, l) => n + l.minutes, 0)} min
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Detective preview */}
        <section className="mt-20">
          <Chip tone="rose" className="mb-3 font-mono uppercase tracking-widest">AI Detective · Case preview</Chip>
          <h2 className="font-display text-2xl font-bold text-ink">{s.title}</h2>
          <GlassCard className="mt-4 border-rose-400/20 p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">AI generated response</p>
            <blockquote className="mt-3 border-l-2 border-rose-400/50 pl-4 text-lg text-ink">
              &quot;{s.response}&quot;
            </blockquote>
            <p className="mt-4 text-sm text-ink-dim">
              Verdict: <span className="font-bold text-rose-400">hallucination</span>. {s.teachingPoint}
            </p>
          </GlassCard>
          <p className="mt-3 text-sm text-ink-dim">14 more cases inside, across hallucinations, bias, privacy leaks, and overconfidence.</p>
        </section>

        {/* Ethics preview */}
        <section className="mt-20">
          <Chip tone="mint" className="mb-3 font-mono uppercase tracking-widest">Ethics Court · Preview</Chip>
          <h2 className="font-display text-2xl font-bold text-ink">You are the reviewer</h2>
          <p className="mt-2 max-w-2xl text-ink-dim">
            A school wants AI that predicts which students might fail. Good idea? That&rsquo;s not the question.
            The question is which questions <em>you</em> ask first: Who knows it exists? Who can appeal? What data does it hoard?
            Ethics Court scores your <em>coverage</em> - because responsible AI is a checklist, not a vibe.
          </p>
        </section>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="rounded-xl bg-gradient-to-r from-pulse-500 to-volt-500 px-7 py-3.5 font-display font-bold text-white shadow-glow transition hover:brightness-110 focus-ring">
            START YOUR QUEST
          </Link>
          <Link href="/login" className="rounded-xl border border-void-700 px-7 py-3.5 font-display font-bold text-ink-dim transition hover:text-ink focus-ring">
            I have an account
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
