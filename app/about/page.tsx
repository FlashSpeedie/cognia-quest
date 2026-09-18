import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/app/page";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "About AI Quest",
  description: "Why AI Quest exists: interactive AI literacy for grades 9–12 — learning by doing, questioning, and deciding.",
};

const PRINCIPLES = [
  {
    icon: "lab" as const,
    title: "Experience over exposition",
    body: "You don't just read about overfitting — you cause it, see the train/test gap widen, and fix it. Concepts stick because you made them happen.",
  },
  {
    icon: "shield" as const,
    title: "Honest about AI",
    body: "Every simulation is labeled as what it is: a simplified teaching model. AI Quest never pretends a rules engine is a magical oracle.",
  },
  {
    icon: "detective" as const,
    title: "Skepticism as a skill",
    body: "The verification habit — claims, sources, checks — is trained until it's reflex. AI output is evidence to evaluate, not truth to copy.",
  },
  {
    icon: "scale" as const,
    title: "Ethics as analysis, not slogans",
    body: "Ethics Court doesn't score 'did you pick the nice answer'. It scores whether you asked the hard questions: privacy, fairness, oversight, accountability.",
  },
  {
    icon: "lock" as const,
    title: "Privacy by design",
    body: "Minimal data: an email and a display name. No trackers, no ads, leaderboard off by default. Students are users, never the product.",
  },
  {
    icon: "check" as const,
    title: "Accessible & honest progress",
    body: "Keyboard navigable, reduced-motion aware, WCAG-conscious contrast — and XP rules that can't be gamed, because progress should mean something.",
  },
];

export default function AboutPage() {
  return (
    <div className="app-backdrop min-h-screen">
      <PublicNav />
      <main id="main" className="mx-auto max-w-4xl px-4 pb-20 pt-32">
        <SectionHeading
          kicker="About the project"
          title="AI literacy you can touch"
          description="AI Quest turns AI education from something students read into something students experience."
        />
        <div className="mt-8 space-y-4 text-ink-dim leading-relaxed">
          <p>
            Artificial intelligence is now infrastructure — in search results, recommendations, grading tools, and
            homework helpers. Students deserve more than articles warning them about it. They deserve a place to
            <em> try it, break it, verify it, and govern it.</em>
          </p>
          <p>
            In AI Quest, grades 9–12 students become AI Apprentices: they train a real (simplified, transparent)
            classifier, dissect how language models produce fluent nonsense, interrogate AI answers like investigators,
            and sit in judgment over realistic deployment scenarios. Gamification keeps momentum; server-side validation
            keeps it honest.
          </p>
        </div>
        <h2 className="mt-12 font-display text-2xl font-bold text-ink">Design principles</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <GlassCard key={p.title} className="p-5">
              <Icon name={p.icon} size={20} className="text-pulse-300" />
              <h3 className="mt-3 font-display font-bold text-ink">{p.title}</h3>
              <p className="mt-1.5 text-sm text-ink-dim">{p.body}</p>
            </GlassCard>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
