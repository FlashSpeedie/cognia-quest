import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { HeroNetwork } from "@/components/public/HeroNetwork";
import { GlassCard, SectionHeading } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";
import { LinkButton } from "@/components/ui/Button";
import { isDemoEnabled } from "@/lib/env";
import { pageMetadata, siteUrl, SITE } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = pageMetadata({
  title: "Cognia Quest | Interactive AI Learning for High School Students",
  description:
    "An interactive AI learning platform for high school students: understand how AI works, practice with interactive challenges, investigate AI mistakes, and learn responsible usage.",
  path: "/",
});

const PILLARS: { icon: IconName; kicker: string; title: string; desc: string; tone: string }[] = [
  {
    icon: "brain",
    kicker: "LEARN",
    title: "AI Academy",
    desc: "Interactive lessons across 7 modules - from 'what is AI' to how language models predict tokens. Short, visual, never walls of text.",
    tone: "text-pulse-700 dark:text-pulse-300 border-pulse-400/30",
  },
  {
    icon: "lab",
    kicker: "EXPERIMENT",
    title: "AI Lab",
    desc: "Train your own model on real-ish data. Push it until it breaks. Discover why more data isn't automatically better.",
    tone: "text-volt-700 dark:text-volt-300 border-volt-400/30",
  },
  {
    icon: "detective",
    kicker: "QUESTION",
    title: "AI Detective",
    desc: "Investigate AI-generated responses. Expose hallucinations, bias, fake citations, and overconfidence - with evidence.",
    tone: "text-rose-400 border-rose-400/30",
  },
  {
    icon: "scale",
    kicker: "DECIDE",
    title: "Ethics Court",
    desc: "Judge real deployment scenarios: AI grading, surveillance cameras, prediction systems. Your reasoning is the score.",
    tone: "text-mint-700 dark:text-mint-300 border-mint-400/30",
  },
];

const STEPS = [
  { n: "1", title: "LEARN", body: "Understand AI fundamentals through interactive lessons." },
  { n: "2", title: "EXPERIMENT", body: "Train simulations and run real AI labs." },
  { n: "3", title: "QUESTION", body: "Spot hallucinations, bias, and questionable outputs." },
  { n: "4", title: "BUILD", body: "Solve practical missions and prompt challenges." },
  { n: "5", title: "MASTER", body: "Earn XP, badges, levels - and your AI Architect certificate." },
];

const BADGES_PREVIEW = [
  { icon: "ðŸ”Ž", name: "AI Detective" },
  { icon: "ðŸ§ ", name: "Machine Learner" },
  { icon: "ðŸ›¡ï¸", name: "Ethical Guardian" },
  { icon: "ðŸ—ï¸", name: "AI Architect" },
];

export default function LandingPage() {
  const demo = isDemoEnabled();
  const base = siteUrl();
  return (
    <div className="app-backdrop min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: `${base}/`,
          description:
            "Interactive AI learning platform for high school students: lessons, simulations, prompt engineering practice, and ethics scenarios.",
          publisher: { "@type": "Organization", name: SITE.name, url: `${base}/` },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE.name,
          url: `${base}/`,
          description: SITE.tagline,
          logo: `${base}/icon.svg`,
        }}
      />
      <PublicNav demoEnabled={demo} />
      <main id="main">
        {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-32 lg:min-h-[80vh] lg:grid-cols-2 lg:pt-24">
          <div>
            <Chip tone="pulse" className="mb-5 uppercase tracking-[0.14em]">
              For high school students
            </Chip>
            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight text-ink sm:text-5xl">
              Learn AI.<br />
              Question AI.<br />
              <span className="text-gradient">Use AI Responsibly.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-dim">
              An interactive learning platform for high school students to understand artificial
              intelligence, practice practical AI techniques, investigate AI limitations, and make
              responsible decisions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/register" size="lg">
                Start learning
              </LinkButton>
              <LinkButton href="/academy-new" variant="secondary" size="lg">
                Explore the Academy
              </LinkButton>
            </div>
            {demo && (
              <p className="mt-6 flex items-center gap-2 text-sm text-ink-faint">
                <Icon name="shield" size={16} />
                Explore instantly in demo mode - no account needed.
              </p>
            )}
          </div>
          <div className="relative hidden lg:block">
            <div className="glass-panel rounded-2xl p-4 shadow-pop">
              <HeroNetwork />
            </div>
          </div>
        </section>

        {/* â”€â”€ PILLARS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

        {/* â”€â”€ HOW IT WORKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

        {/* â”€â”€ MISSION MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeading
            kicker="Your route"
            title="The mission map"
            description="A guided sequence from AI fundamentals to the capstone challenge. Finish a stage to unlock the next - every step is earned."
          />
          <ol
            aria-label="Mission roadmap"
            className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-7"
          >
            {([
              { icon: "book", label: "AI Fundamentals" },
              { icon: "lab", label: "Machine Learning" },
              { icon: "spark", label: "Generative AI" },
              { icon: "terminal", label: "Prompt Engineering" },
              { icon: "scale", label: "AI Ethics" },
              { icon: "detective", label: "AI Detective" },
              { icon: "trophy", label: "Final Challenge" },
            ] as const).map((m, i, arr) => (
              <li key={m.label} className="relative">
                <div className="flex items-center gap-3 rounded-xl border border-void-700/70 bg-void-900 p-3.5 shadow-card lg:flex-col lg:items-center lg:gap-2.5 lg:p-5 lg:text-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pulse-600/40 bg-pulse-50 text-pulse-600 dark:bg-pulse-950/50 dark:text-pulse-700 dark:text-pulse-300">
                    <Icon name={m.icon} size={17} />
                  </span>
                  <span className="text-sm font-semibold leading-snug text-ink">{m.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div aria-hidden="true" className="absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-void-700 lg:block" />
                )}
              </li>
            ))}
          </ol>
          <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-5">
            {[
              { n: "7", label: "Modules" },
              { n: "10", label: "Missions" },
              { n: "12", label: "Badges" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-void-700/70 bg-void-900 p-4 text-center shadow-card sm:p-6">
                <dt className="order-2 mt-1 text-sm font-medium text-ink-dim">{s.label}</dt>
                <dd className="order-1 font-display text-2xl font-bold text-pulse-600 sm:text-3xl">{s.n}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* â”€â”€ GAMIFICATION STRIP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="glass-panel grid gap-8 rounded-2xl p-8 md:grid-cols-2 lg:p-10">
            <div>
              <SectionHeading
                kicker="Progress you can feel"
                title="XP, levels, badges - earned, never given"
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
                12 badges across detection, ethics, prompting, and labs - each with a story of how you earned it.
              </p>
            </div>
          </div>
        </section>

        {/* â”€â”€ RESPONSIBLE AI STATEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Icon name="shield" className="mx-auto text-mint-600" size={32} />
          <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">Understand it. Question it. Own it.</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-dim">
            Cognia Quest never pretends AI is magic or infallible. Every simulation is labeled as educational.
            Capability is taught side-by-side with limits: models can be wrong, biased, or overconfident -
            and you&apos;ll learn exactly when to check.
          </p>
        </section>

        {/* â”€â”€ FINAL CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
