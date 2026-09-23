"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";

const LEARNER_TYPES = [
  { id: "beginner", label: "AI Beginner", desc: "New to all of this - start gentle.", icon: "spark" },
  { id: "explorer", label: "Curious Explorer", desc: "Show me how things work.", icon: "search" },
  { id: "coder", label: "Coding Enthusiast", desc: "I like building and debugging.", icon: "terminal" },
  { id: "researcher", label: "Researcher", desc: "Sources, evidence, depth.", icon: "book" },
  { id: "creative", label: "Creative", desc: "Ideas, art, and what-ifs.", icon: "star" },
  { id: "engineer", label: "Future Engineer", desc: "Systems, math, how it scales.", icon: "cpu" },
] as const;

const GOALS = [
  { id: "understand", label: "Understand AI", desc: "Demystify the tech behind the headlines." },
  { id: "school", label: "Use AI for school", desc: "Learn to use AI tools well - and honestly." },
  { id: "prompting", label: "Master prompting", desc: "Get dramatically better outputs." },
  { id: "ml", label: "Learn machine learning", desc: "Datasets, models, training - the real mechanics." },
  { id: "expert", label: "Become an AI expert", desc: "The full path. All seven levels." },
] as const;

const ROADMAP: { icon: IconName; label: string }[] = [
  { icon: "brain", label: "AI Fundamentals" },
  { icon: "cpu", label: "Machine Learning" },
  { icon: "spark", label: "Generative AI" },
  { icon: "chat", label: "Prompt Engineering" },
  { icon: "scale", label: "AI Ethics" },
  { icon: "detective", label: "AI Detective" },
  { icon: "trophy", label: "Final AI Mission" },
];

export function OnboardingWizard({ name }: { name: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function finish(skip = false) {
    setSaving(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skip ? { action: "skip" } : { action: "complete", learnerType, goal }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  const steps = [
    // 1 - Welcome
    <div key="welcome" className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pulse-500 to-volt-500 text-4xl shadow-lift">
        ⚡
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-pulse-400">Welcome, AI Apprentice</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink">
        Hi, {name}.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-dim">
        You are about to learn how AI really works - by training it, challenging it, and occasionally catching it in a lie.
      </p>
      <Button className="mt-8" size="lg" onClick={() => setStep(1)}>
        Begin setup <Icon name="arrow-right" size={18} />
      </Button>
      <div>
        <button onClick={() => finish(true)} className="mt-3 text-sm text-ink-faint hover:text-ink-dim underline-offset-2 hover:underline">
          Skip setup
        </button>
      </div>
    </div>,

    // 2 - Learner type
    <div key="type">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-pulse-400">Step 1 of 2</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Which sounds most like you?</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {LEARNER_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setLearnerType(t.id)}
            aria-pressed={learnerType === t.id}
            className={`rounded-2xl border p-4 text-left transition-all focus-ring ${
              learnerType === t.id
                ? "border-pulse-400 bg-pulse-400/10 shadow-lift"
                : "border-void-700 bg-void-800/60 hover:border-pulse-400/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-void-700 text-pulse-700 dark:text-pulse-300">
                <Icon name={t.icon} size={18} />
              </span>
              <span className="font-semibold text-ink">{t.label}</span>
            </div>
            <p className="mt-2 text-sm text-ink-dim">{t.desc}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
        <Button onClick={() => setStep(2)} disabled={!learnerType}>Continue</Button>
      </div>
    </div>,

    // 3 - Goal
    <div key="goal">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-pulse-400">Step 2 of 2</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">What&apos;s your mission?</h1>
      <div className="mt-6 space-y-3">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoal(g.id)}
            aria-pressed={goal === g.id}
            className={`w-full rounded-2xl border p-4 text-left transition-all focus-ring ${
              goal === g.id
                ? "border-pulse-400 bg-pulse-400/10 shadow-lift"
                : "border-void-700 bg-void-800/60 hover:border-pulse-400/40"
            }`}
          >
            <span className="font-semibold text-ink">{g.label}</span>
            <span className="block text-sm text-ink-dim">{g.desc}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={() => setStep(3)} disabled={!goal}>See your roadmap</Button>
      </div>
    </div>,

    // 4 - Roadmap
    <div key="roadmap" className="text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-pulse-400">Your Roadmap</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Seven levels. One quest.</h1>
      <div className="mx-auto mt-8 max-w-xs space-y-0">
        {ROADMAP.map((r, i) => (
          <div key={r.label}>
            <GlassCard className="flex items-center gap-3 px-4 py-3 animate-fade-up">
              <span className="font-mono text-xs text-ink-faint w-8">LV{i + 1}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-void-700 text-pulse-700 dark:text-pulse-300">
                <Icon name={r.icon} size={16} />
              </span>
              <span className="font-semibold text-ink text-sm">{r.label}</span>
            </GlassCard>
            {i < ROADMAP.length - 1 && <div className="mx-auto h-4 w-px bg-gradient-to-b from-pulse-400/50 to-volt-400/50" />}
          </div>
        ))}
      </div>
      <Button className="mt-8" size="lg" loading={saving} onClick={() => finish(false)}>
        Enter Cognia Quest <Icon name="arrow-right" size={18} />
      </Button>
    </div>,
  ];

  return (
    <main id="main" className="app-backdrop flex min-h-screen items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl p-8 sm:p-10">{steps[step]}</GlassCard>
    </main>
  );
}
