import Link from "next/link";
import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { HeroNetwork } from "@/components/public/HeroNetwork";
import { GlassCard, SectionHeading } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";
import { LinkButton } from "@/components/ui/Button";
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
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-32 lg:min-h-[80vh] lg:grid-cols-2 lg:pt-24">
          <div>
            <Chip tone="pulse" className="mb-5 uppercase tracking-[0.14em]">
              Learn · Experiment · Question · Build · Master
            </Chip>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Become an AI <span className="text-gradient">Apprentice</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-dim">
              Learn AI by doing, questioning, and experimenting. Understand how it works,
              practice with interactive challenges, and learn to use it responsibly.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/register" size="lg">
                Start learning
              </LinkButton>
              <LinkButton href="/preview" variant="secondary" size="lg">
                Explore AI
              </LinkButton>
            </div>
            {demo && (
              <p className="mt-6 flex items-center gap-2 text-sm text-ink-faint">
                <Icon name="shield" size={16} />
                No paywall for judges — hit &quot;Try demo&quot; up top and explore instantly.
              </p>
            )}
          </div>
          <div className="relative hidden lg:block">
            <div className="glass-panel rounded-2xl p-4 shadow-pop">
              <HeroNetwork />
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
              <GlassCard key={p.title} className="p-6 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift hover:border-pulse-500/40">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${p.tone}`}>
                  <Icon name={p.icon} size={20} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{p.kicker}</p>
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse-600 font-display text-sm font-bold text-white">
                    {s.n}
                  </div>
                  <h3 className="mt-4 font-display text-sm font-bold tracking-wide text-ink">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-dim">{s.body}</p>
                </GlassCard>
                {i < STEPS.length - 1 && (
                  <div aria-hidden="true" className="absolute -right-2.5 top-1/2 hidden h-px w-5 bg-void-700 md:block" />
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* ── GAMIFICATION STRIP ───────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="glass-panel grid gap-8 rounded-2xl p-8 md:grid-cols-2 lg:p-10">
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
                  <div key={l.lvl} className="flex items-center justify-between rounded-lg border border-void-700 bg-void-850 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Icon name="bolt" className="text-amber-500" size={16} />
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest text-ink-faint">{l.lvl}</p>
                        <p className="text-sm font-bold text-ink">{l.title}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-pulse-600">{l.xp}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                {BADGES_PREVIEW.map((b) => (
                  <GlassCard key={b.name} className="flex flex-col items-center gap-2 p-6 text-center transition-transform hover:-translate-y-0.5 hover:shadow-lift">
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
          <Icon name="shield" className="mx-auto text-mint-600" size={32} />
          <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">Understand it. Question it. Own it.</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-dim">
            AI Quest never pretends AI is magic or infallible. Every simulation is labeled as educational.
            Capability is taught side-by-side with limits: models can be wrong, biased, or overconfident —
            and you&apos;ll learn exactly when to check.
          </p>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="glass-panel relative overflow-hidden rounded-2xl p-10 text-center shadow-pop md:p-16">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              The AI age won&apos;t wait. Neither should your understanding.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-dim">
              {demo
                ? "Free to try in demo mode. Progress saved when you create an account."
                : "Create your account and start earning XP in minutes."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href="/register" size="lg">
                Start learning
              </LinkButton>
              <LinkButton href="/about" variant="secondary" size="lg">
                About the project
              </LinkButton>
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
