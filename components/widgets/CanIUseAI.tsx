"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

/** "Can I use AI for this?" (spec §24). Nuanced verdicts per scenario. */
const SCENARIOS = [
  {
    id: "glossary",
    text: "Ask AI to explain a concept from class three different ways until it clicks.",
    verdict: "appropriate",
    note: "Classic good use: tutoring explanations. You still need to do the practicing.",
  },
  {
    id: "essay-banned",
    text: "Have AI write your assigned essay when the teacher explicitly said no AI.",
    verdict: "inappropriate",
    note: "Violates the stated policy AND skips the skill the assignment builds. Double loss.",
  },
  {
    id: "outline",
    text: "Ask AI to help outline your essay — the assignment says 'AI allowed for brainstorming only'.",
    verdict: "depends",
    note: "An outline may be brainstorming or may be structure+drafting. Check: does the policy mean ideas-only, or structure too? When unsure, ask the teacher.",
  },
  {
    id: "citations",
    text: "Paste AI-generated citations straight into your bibliography without opening them.",
    verdict: "inappropriate",
    note: "LLMs invent references. Each one must exist, say what you claim, and be one you've actually read.",
  },
  {
    id: "practice-quiz",
    text: "Have AI quiz you on chapters before the exam.",
    verdict: "appropriate",
    note: "Practice questions = studying, elevated. Verify wonky answers against your notes.",
  },
  {
    id: "answers",
    text: "Screenshot homework problems and copy the AI's answers, unaltered.",
    verdict: "inappropriate",
    note: "No learning happened; you'll be defenseless on the test that isn't multiple-choice-about-copying.",
  },
  {
    id: "code-debug",
    text: "Ask AI why your loop prints twice, then apply the fix yourself and add a comment on what was wrong.",
    verdict: "appropriate",
    note: "Socratic debugging with comprehension checks is exactly the healthy-use pattern.",
  },
  {
    id: "group-summary",
    text: "Have AI summarize a colleague's report your group will present as joint work — and disclose that you did.",
    verdict: "depends",
    note: "Disclosure helps, but verify the summary against the original and confirm your teacher's policy on AI summaries.",
  },
] as const;

const VERDICT_TONE = {
  appropriate: { chip: "mint" as const, label: "Likely appropriate" },
  depends: { chip: "amber" as const, label: "Depends on class rules" },
  inappropriate: { chip: "rose" as const, label: "Likely inappropriate" },
};

export function CanIUseAI({ onComplete }: { onComplete?: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const done = Object.keys(answers).length === SCENARIOS.length;
  const correct = SCENARIOS.filter((s) => answers[s.id] === s.verdict).length;

  return (
    <div>
      <div className="space-y-3">
        {SCENARIOS.map((s) => {
          const mine = answers[s.id];
          const right = mine === s.verdict;
          return (
            <GlassCard key={s.id} className={`p-4 ${checked ? (right ? "border-mint-400/30" : "border-amber-400/40") : ""}`}>
              <p className="text-sm text-ink">{s.text}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Verdict for this scenario">
                {(Object.keys(VERDICT_TONE) as (keyof typeof VERDICT_TONE)[]).map((v) => (
                  <button
                    key={v}
                    role="radio"
                    aria-checked={mine === v}
                    disabled={checked}
                    onClick={() => setAnswers((a) => ({ ...a, [s.id]: v }))}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus-ring ${
                      mine === v ? "border-pulse-400 bg-pulse-400/15 text-pulse-300" : "border-void-700 text-ink-faint hover:text-ink"
                    }`}
                  >
                    {VERDICT_TONE[v].label}
                  </button>
                ))}
              </div>
              {checked && (
                <p className="mt-2 text-xs text-ink-dim">
                  <Chip tone={VERDICT_TONE[s.verdict].chip} className="mr-2">{VERDICT_TONE[s.verdict].label}</Chip>
                  {s.note}
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>
      <div className="mt-4">
        {!checked ? (
          <button
            onClick={() => { setChecked(true); if (correct >= 6) onComplete?.(); }}
            disabled={!done}
            className="rounded-xl bg-gradient-to-r from-pulse-500 to-volt-500 px-5 py-2.5 text-sm font-bold text-white shadow-glow disabled:opacity-40 focus-ring"
          >
            Check my calls
          </button>
        ) : (
          <p className="text-sm font-semibold text-ink">
            {correct}/{SCENARIOS.length} aligned. Remember the meta-rule: <em>your school&apos;s policy wins.</em> Check it first, every class.
          </p>
        )}
      </div>
    </div>
  );
}
