import Link from "next/link";
import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { HeroNetwork } from "@/components/public/HeroNetwork";
import { GlassCard, SectionHeading } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";
import { isDemoEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "AI Quest — Learn AI. Challenge AI. Use AI Responsibly.",
  description:
    "Become an AI Apprentice: interactive lessons, real simulations, AI Detective cases, and ethics missions for grades 9–12.",
};

const PILLARS: { icon: IconName; kicker: string; title: string; desc: string; tone: string }[] = [
  {
    icon: "brain",
    kicker: "LEARN",
    title: "AI Academy",
    desc: "Interactive lessons across 7 modules — from 'what is AI' to how language models predict tokens. Short, visual, never walls of text.",
    tone: "text-pulse-300 border-pulse-400/30",
  },
  {
    icon: "lab",
    kicker: "EXPERIMENT",
    title: "AI Lab",
    desc: "Train your own model on real-ish data. Push it until it breaks. Discover why more data isn't automatically better.",
    tone: "text-volt-300 border-volt-400/30",
  },
  {
    icon: "detective",
    kicker: "QUESTION",
    title: "AI Detective",
    desc: "Investigate AI-generated responses. Expose hallucinations, bias, fake citations, and overconfidence — with evidence.",
    tone: "text-rose-400 border-rose-400/30",
  },
  {
    icon: "scale",
    kicker: "DECIDE",
    title: "Ethics Court",
    desc: "Judge real deployment scenarios: AI grading, surveillance cameras, prediction systems. Your reasoning is the score.",
    tone: "text-mint-300 border-mint-400/30",
  },
];

const STEPS = [
  { n: "1", title: "LEARN", body: "Understand AI fundamentals through interactive lessons." },
  { n: "2", title: "EXPERIMENT", body: "Train simulations and run real AI labs." },
  { n: "3", title: "QUESTION", body: "Spot hallucinations, bias, and questionable outputs." },
  { n: "4", title: "BUILD", body: "Solve practical missions and prompt challenges." },
  { n: "5", title: "MASTER", body: "Earn XP, badges, levels — and your AI Architect certificate." },
];

const BADGES_PREVIEW = [
  { icon: "🔎", name: "AI Detective" },
  { icon: "🧠", name: "Machine Learner" },
  { icon: "🛡️", name: "Ethical Guardian" },
  { icon: "🏗️", name: "AI Architect" },
];

export default function LandingPage() {
  const demo = isDemoEnabled();
  return (
    <div className="app-backdrop min-h-screen">
      <PublicNav demoEnabled={demo} />
      <main id="main">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="mx-auto grid min-h-[92vh] max-w-6xl items-center gap-10 px-4 pb-16 pt-32 lg:grid-cols-2">
          <div>
            <Chip tone="pulse" className="mb-5 font-mono uppercase tracking-[0.2em]">
              Learn · Experiment · Question · Build · Master
            </Chip>
            <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
              BECOME AN <br />
              <span className="text-gradient">AI APPRENTICE</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-dim">
              Learn how artificial intelligence works, experiment with real concepts,
              spot AI mistakes, master prompting, and make responsible decisions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-pulse-500 to-volt-500 px-7 py-3.5 font-display text-base font-bold text-white shadow-glow transition hover:brightness-110 focus-ring"
              >
                START YOUR QUEST
              </Link>
              <Link
                href="/preview"
                className="rounded-xl border border-pulse-400/40 bg-pulse-400/10 px-7 py-3.5 font-display text-base font-bold text-pulse-300 transition hover:bg-pulse-400/20 focus-ring"
              >
                EXPLORE AI
              </Link>
            </div>
            {demo && (
              <p className="mt-6 flex items-center gap-2 text-sm text-ink-faint">
                <Icon name="shield" size={16} />
                No paywall for judges: hit &quot;Try demo&quot; up top and explore instantly.
              </p>
            )}
          </div>
          <div className="relative hidden h-[480px] lg:block">
            <div className="glass-panel absolute inset-0 rounded-3xl p-2 shadow-card">
              <HeroNetwork />
              <div className="absolute bottom-5 left-5 rounded-xl border border-void-700 bg-void-900/90 px-4 py-3 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Mission map</p>
                <p className="mt-0.5 font-display text-sm font-bold text-ink">7 modules · 10 missions · 12 badges</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PILLARS ──────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeading
            kicker="One platform, four ways to think"
            title="Not a webpage with answers. A place to practice."
            description="Every concept ends in something you do: a simulation, an investigation, a decision."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <GlassCard key={p.title} className="p-6 transition-transform duration-200 hover:-translate-y-1">
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-void-800/60 ${p.tone}`}>
                  <Icon name={p.icon} size={22} />
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-faint">{p.kicker}</p>
                <h3 className="mt-1 font-display text-xl font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{p.desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeading kicker="The loop" title="How it works" />
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.n} className="relative">
                <GlassCard className="h-full p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pulse-500 to-volt-500 font-display text-sm font-black text-white">
                    {s.n}
                  </div>
                  <h3 className="mt-4 font-display text-sm font-bold tracking-wide text-ink">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-dim">{s.body}</p>
                </GlassCard>
                {i < STEPS.length - 1 && (
                  <div aria-hidden="true" className="absolute -right-3 top-1/2 hidden h-px w-6 bg-gradient-to-r from-pulse-400/60 to-transparent md:block" />
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* ── GAMIFICATION STRIP ───────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="glass-panel grid gap-8 rounded-3xl p-8 md:grid-cols-2 md:p-10">
            <div>
              <SectionHeading
                kicker="Progress you can feel"
                title="XP, levels, badges — earned, never given"
                description="Ten ranks from AI Rookie to AI Master. XP is validated server-side: every point ties to something you actually did."
              />
              <div className="mt-6 space-y-3">
                {[
                  { lvl: "LEVEL 3", title: "Machine Learner", xp: "600 XP" },
                  { lvl: "LEVEL 7", title: "Ethical AI Guardian", xp: "3,000 XP" },
                  { lvl: "LEVEL 10", title: "AI Master", xp: "7,000 XP" },
                ].map((l) => (
                  <div key={l.lvl} className="flex items-center justify-between rounded-xl border border-void-700 bg-void-800/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Icon name="bolt" className="text-amber-400" size={18} />
                      <div>
                        <p className="font-mono text-[10px] tracking-widest text-ink-faint">{l.lvl}</p>
                        <p className="text-sm font-bold text-ink">{l.title}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-pulse-300">{l.xp}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                {BADGES_PREVIEW.map((b) => (
                  <GlassCard key={b.name} glow className="flex flex-col items-center gap-2 p-6 text-center">
                    <span className="text-4xl" aria-hidden="true">{b.icon}</span>
                    <span className="font-display text-sm font-bold text-ink">{b.name}</span>
                  </GlassCard>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-ink-faint">
                12 badges across detection, ethics, prompting, and labs — each with a story of how you earned it.
              </p>
            </div>
          </div>
        </section>

        {/* ── RESPONSIBLE AI STATEMENT ─────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Icon name="shield" className="mx-auto text-mint-300" size={34} />
          <h2 className="mt-4 font-display text-3xl font-bold text-ink">Understand it. Question it. Own it.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink-dim">
            AI Quest never pretends AI is magic or infallible. Every simulation is labeled as educational.
            Capability is taught side-by-side with limits: models can be wrong, biased, or overconfident —
            and you&apos;ll learn exactly when to check.
          </p>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="glass-panel relative overflow-hidden rounded-3xl p-10 text-center shadow-glow md:p-16">
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              The AI age won&apos;t wait. <span className="text-gradient">Neither should your understanding.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-dim">
              {demo
                ? "Free to try in demo mode. Progress saved when you create an account."
                : "Create your account and start earning XP in minutes."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-pulse-500 to-volt-500 px-8 py-3.5 font-display font-bold text-white shadow-glow transition hover:brightness-110 focus-ring"
              >
                START YOUR QUEST
              </Link>
              <Link href="/about" className="rounded-xl border border-void-700 px-8 py-3.5 font-display font-bold text-ink-dim transition hover:border-pulse-400/40 hover:text-ink focus-ring">
                About the project
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-void-700/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-ink-faint sm:flex-row">
        <p>AI QUEST — an educational platform concept for TSA Webmasters.</p>
        <nav className="flex gap-5" aria-label="Footer">
          <Link className="hover:text-ink focus-ring rounded" href="/about">About</Link>
          <Link className="hover:text-ink focus-ring rounded" href="/preview">Preview</Link>
          <Link className="hover:text-ink focus-ring rounded" href="/privacy">Privacy</Link>
          <Link className="hover:text-ink focus-ring rounded" href="/login">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}
