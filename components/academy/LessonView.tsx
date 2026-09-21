"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lesson, LessonSection } from "@/lib/content";
import { quizById } from "@/content/quizzes";
import { GlassCard, Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";
import { QuizRunner } from "./QuizRunner";
import { useToast } from "@/components/ui/Toast";
import { Term } from "@/components/ui/Tooltip";
import { TutorPanel } from "@/components/ai/TutorPanel";

// Widget registry — interactive components referenced by content
import { AIOrNot } from "@/components/widgets/AIOrNot";
import { WhatIsModel } from "@/components/widgets/WhatIsModel";
import { AITypesMatch } from "@/components/widgets/AITypesMatch";
import { FeaturePicker } from "@/components/widgets/FeaturePicker";
import { MLPipeline } from "@/components/widgets/MLPipeline";
import { OverfittingLab } from "@/components/widgets/OverfittingLab";
import { ConfusionMatrix } from "@/components/widgets/ConfusionMatrix";
import { NextToken, TokenVisualizer } from "@/components/widgets/GenerativeWidgets";
import { ConfidenceLab } from "@/components/widgets/ConfidenceLab";
import { HallucinationClaims } from "@/components/widgets/HallucinationClaims";
import { PromptUpgrade } from "@/components/widgets/PromptUpgrade";
import { CanIUseAI } from "@/components/widgets/CanIUseAI";
import { ClassifyOrRegress } from "@/components/widgets/ClassifyOrRegress";

const WIDGETS: Record<string, (props: { onComplete?: () => void }) => React.JSX.Element> = {
  "ai-or-not": AIOrNot,
  "what-is-model": WhatIsModel,
  "ai-types-match": AITypesMatch,
  "feature-picker": FeaturePicker,
  "ml-pipeline": MLPipeline,
  "overfitting-lab": OverfittingLab,
  "confusion-matrix": ConfusionMatrix,
  "next-token": NextToken,
  "token-visualizer": TokenVisualizer,
  "confidence-lab": ConfidenceLab,
  "hallucination-claims": HallucinationClaims,
  "prompt-upgrade": PromptUpgrade,
  "can-i-use-ai": CanIUseAI,
  "classify-or-regress": ClassifyOrRegress,
};

/** Simple inline-term highlighting for key vocabulary. */
function RichText({ body }: { body: string }) {
  // lightweight glossary linking for a few core terms
  const terms: Record<string, string> = {
    "machine learning": "Systems that infer patterns from examples instead of following hand-written rules.",
    "model": "The learned pattern produced by training — what actually makes predictions.",
    "hallucination": "Confident output that is factually wrong or invented.",
    "overfitting": "Memorizing training data so well that new data breaks the model.",
    "token": "A chunk of text a model reads or writes — often part of a word.",
    "context window": "How much text a model can see at once.",
  };
  let parts: (string | React.JSX.Element)[] = [body];
  for (const [term, def] of Object.entries(terms)) {
    parts = parts.flatMap((p) => {
      if (typeof p !== "string") return [p];
      const idx = p.toLowerCase().indexOf(term);
      if (idx === -1) return [p];
      return [
        p.slice(0, idx),
        <Term key={term + idx} term={term} definition={def}>{p.slice(idx, idx + term.length)}</Term>,
        p.slice(idx + term.length),
      ];
    });
  }
  return <>{parts}</>;
}

export function LessonView({
  lesson,
  moduleSlug,
  moduleTitle,
  completedSections: initialDone,
  nextHref,
  doneLesson,
}: {
  lesson: Lesson;
  moduleSlug: string;
  moduleTitle: string;
  completedSections: string[];
  nextHref: string | null;
  doneLesson: boolean;
}) {
  const [done, setDone] = useState<Set<string>>(new Set(initialDone));
  const [activeStep, setActiveStep] = useState<number>(0);
  const { push } = useToast();
  const router = useRouter();

  const sections = lesson.sections;
  const completedAll = sections.every((s) => done.has(s.id));
  const displayedPct = Math.round((done.size / sections.length) * 100);

  const inProgressIdx = useMemo(() => {
    const i = sections.findIndex((s) => !done.has(s.id));
    return i === -1 ? sections.length - 1 : i;
  }, [sections, done]);

  async function markSection(sectionId: string) {
    if (done.has(sectionId)) return;
    setDone((d) => new Set(d).add(sectionId));
    try {
      const res = await fetch("/api/lessons/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, sectionId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      push({ kind: "error", title: "Couldn't save progress", body: "Kept locally for now — try again in a moment." });
    }
  }

  function goTo(i: number) {
    // free navigation; completion still requires each step to be genuinely done
    setActiveStep(Math.max(0, Math.min(i, sections.length - 1)));
    document.getElementById("lesson-stage")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const current = sections[activeStep] as (typeof sections)[number] | undefined;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      {/* ── Sticky learning nav ── */}
      <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Lesson progress">
        <Card className="p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Lesson progress</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-void-700" role="progressbar" aria-valuenow={displayedPct} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson completion">
            <div className="h-full rounded-full bg-gradient-to-r from-pulse-500 to-volt-500 transition-[width] duration-500" style={{ width: `${displayedPct}%` }} />
          </div>
          <ol className="mt-3 space-y-1">
            {sections.map((s, i) => {
              const isDone = done.has(s.id);
              const isCurrent = i === activeStep;
              const label = s.kind === "concept" ? s.heading : s.kind === "callout" ? s.title : s.kind === "interactive" ? s.heading : "Knowledge check";
              return (
                <li key={s.id}>
                  <button
                    onClick={() => goTo(i)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors focus-ring ${
                      isCurrent ? "bg-pulse-400/10 text-pulse-300" : isDone ? "text-mint-300/90" : "text-ink-faint hover:text-ink-dim"
                    }`}
                  >
                    <span aria-hidden="true">
                      {isDone ? <Icon name="check" size={13} /> : isCurrent ? "→" : "○"}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 border-t border-void-700/60 pt-3 font-mono text-[10px] text-ink-faint">
            {done.size}/{sections.length} steps · +{lesson.xp} XP on completion
          </p>
        </Card>
      </aside>

      {/* ── Stage ── */}
      <div id="lesson-stage" className="min-w-0">
        {/* breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
          <a href="/academy" className="hover:text-ink focus-ring rounded">Academy</a>
          <span aria-hidden>/</span>
          <a href={`/academy/${moduleSlug}`} className="hover:text-ink focus-ring rounded">{moduleTitle}</a>
          <span aria-hidden>/</span>
          <span className="text-pulse-300">{lesson.title}</span>
        </nav>

        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="pulse" className="font-mono">{lesson.minutes} min</Chip>
            <Chip tone="amber" className="font-mono">+{lesson.xp} XP</Chip>
            {doneLesson && <Chip tone="mint">completed</Chip>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">{lesson.title}</h1>
          <ul className="mt-3 space-y-1">
            {lesson.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm text-ink-dim">
                <Icon name="check" size={14} className="mt-0.5 shrink-0 text-pulse-400" />
                {o}
              </li>
            ))}
          </ul>
        </header>

        {current && (
          <div key={current.id} className="animate-fade-up">
            <SectionRenderer
              section={current}
              lessonId={lesson.id}
              onDone={() => markSection(current.id)}
              isDone={done.has(current.id)}
            />
          </div>
        )}

        {/* step controls */}
        <div className="mt-8 flex items-center justify-between border-t border-void-700/60 pt-5">
          <Button variant="ghost" onClick={() => goTo(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>
            <Icon name="arrow-left" size={16} /> Previous
          </Button>
          <span className="font-mono text-xs text-ink-faint">
            Step {activeStep + 1} / {sections.length}
          </span>
          {activeStep < sections.length - 1 ? (
            <Button
              onClick={() => {
                if (current && !done.has(current.id)) markSection(current.id);
                setActiveStep(activeStep + 1);
              }}
            >
              {current && !done.has(current.id) ? "Got it — next" : "Next"} <Icon name="arrow-right" size={16} />
            </Button>
          ) : completedAll ? (
            nextHref ? (
              <LinkButton href={nextHref}>
                Next lesson <Icon name="arrow-right" size={16} />
              </LinkButton>
            ) : (
              <LinkButton href="/academy" variant="success">
                Module complete <Icon name="check" size={16} />
              </LinkButton>
            )
          ) : (
            <span className="text-xs text-ink-faint">Finish every step to complete the lesson</span>
          )}
        </div>

        {completedAll && (
          <GlassCard glow className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display text-lg font-bold text-ink">Lesson complete — +{lesson.xp} XP banked.</p>
              <p className="text-sm text-ink-dim">
                {doneLesson ? "You already earned this one; replays don't double-dip XP." : "Saved to your permanent record."}
              </p>
            </div>
            <Icon name="trophy" size={30} className="text-amber-400" />
          </GlassCard>
        )}

        <TutorPanel lessonId={lesson.id} lessonTitle={lesson.title} />
      </div>
    </div>
  );
}

function SectionRenderer({
  section,
  lessonId,
  onDone,
  isDone,
}: {
  section: LessonSection;
  lessonId: string;
  onDone: () => void;
  isDone: boolean;
}) {
  switch (section.kind) {
    case "concept":
      return (
        <GlassCard className="p-6">
          <h2 className="font-display text-xl font-bold text-ink">{section.heading}</h2>
          <div className="mt-3 space-y-3">
            {section.body.map((p, i) => (
              <p key={i} className="leading-relaxed text-ink-dim">
                <RichText body={p} />
              </p>
            ))}
          </div>
          {!isDone && (
            <Button className="mt-5" variant="secondary" onClick={onDone}>
              Got it
            </Button>
          )}
        </GlassCard>
      );
    case "callout": {
      const tones = {
        info: "border-pulse-400/40 bg-pulse-400/5 text-pulse-200",
        warning: "border-amber-400/40 bg-amber-400/5 text-amber-100",
        tip: "border-mint-400/40 bg-mint-400/5 text-mint-100",
      };
      return (
        <GlassCard className={`border-l-4 p-6 ${tones[section.variant]}`}>
          <h2 className="font-display text-lg font-bold text-ink">{section.title}</h2>
          <p className="mt-2 leading-relaxed text-ink-dim">{section.body}</p>
          {!isDone && (
            <Button className="mt-4" variant="secondary" size="sm" onClick={onDone}>
              Understood
            </Button>
          )}
        </GlassCard>
      );
    }
    case "interactive": {
      const Widget = WIDGETS[section.widget];
      return (
        <GlassCard className="border-pulse-400/25 p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-pulse-400">Interactive</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">{section.heading}</h2>
          {section.body && <p className="mt-1 mb-4 text-sm text-ink-dim">{section.body}</p>}
          {Widget ? <Widget onComplete={onDone} /> : <p className="text-ink-faint">Interactive module loading…</p>}
        </GlassCard>
      );
    }
    case "quiz": {
      const quiz = quizById(section.quizId);
      if (!quiz) return null;
      return (
        <div>
          <GlassCard className="mb-4 p-5">
            <h2 className="font-display text-lg font-bold text-ink">Check yourself</h2>
            <p className="mt-1 text-sm text-ink-dim">Answer to bank the lesson. Explanations appear after you submit.</p>
          </GlassCard>
          <QuizRunner quiz={quiz} lessonId={lessonId} />
        </div>
      );
    }
  }
}
