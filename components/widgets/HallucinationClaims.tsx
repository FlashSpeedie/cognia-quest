"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";

/** Claim verification triage (spec §61). */
type Verdict = "supported" | "unsupported" | "contradicted" | "ambiguous";
const VERDICTS: { id: Verdict; label: string; tone: string }[] = [
  { id: "supported", label: "Supported", tone: "border-mint-400/50 text-mint-700 dark:text-mint-300" },
  { id: "unsupported", label: "Unsupported", tone: "border-amber-400/50 text-amber-600 dark:text-amber-300" },
  { id: "contradicted", label: "Contradicted", tone: "border-rose-400/50 text-rose-400" },
  { id: "ambiguous", label: "Ambiguous", tone: "border-volt-400/50 text-volt-700 dark:text-volt-300" },
];

const ANSWER =
  "The Eiffel Tower, completed in 1889 for the World's Fair, was meant to stand for twenty years. Tesla invented the radio, and in 1901 a single station in Europe broadcast music to ships across the entire Atlantic.";

const CLAIMS: { text: string; correct: Verdict; why: string }[] = [
  {
    text: "The Eiffel Tower was completed in 1889.",
    correct: "supported",
    why: "Checks out - completed March 1889 for the Exposition Universelle.",
  },
  {
    text: "The Eiffel Tower was originally temporary.",
    correct: "supported",
    why: "True - it had a 20-year permit and survived because it became useful as a radio antenna.",
  },
  {
    text: "Tesla 'invented the radio'.",
    correct: "ambiguous",
    why: "Disputed: Marconi got the famous patent (later partially rescinded), Tesla held earlier radio patents, and others contributed. Attributing it to one person is contested.",
  },
  {
    text: "A 1901 station broadcast music across the entire Atlantic.",
    correct: "unsupported",
    why: "Marconi's 1901 transmission was Morse code (the letter 'S'), not music - and 'entire Atlantic' overstates the reception. No source supports the claim as written.",
  },
];

export function HallucinationClaims({ onComplete }: { onComplete?: () => void }) {
  const [answers, setAnswers] = useState<Record<number, Verdict>>({});
  const [checked, setChecked] = useState(false);
  const done = Object.keys(answers).length === CLAIMS.length;
  const correct = CLAIMS.filter((c, i) => answers[i] === c.correct).length;

  return (
    <div>
      <GlassCard className="border-volt-400/25 bg-volt-400/5 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">AI answer under review</p>
        <p className="mt-2 text-sm leading-relaxed text-ink">{ANSWER}</p>
      </GlassCard>
      <p className="mt-4 text-sm text-ink-dim">Break it into claims. Label each one:</p>
      <div className="mt-3 space-y-3">
        {CLAIMS.map((c, i) => (
          <GlassCard key={i} className="p-4">
            <p className="text-sm font-medium text-ink">CLAIM {String.fromCharCode(65 + i)} - {c.text}</p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Verdict for claim ${String.fromCharCode(65 + i)}`}>
              {VERDICTS.map((v) => (
                <button
                  key={v.id}
                  role="radio"
                  aria-checked={answers[i] === v.id}
                  disabled={checked}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: v.id }))}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors focus-ring ${
                    answers[i] === v.id ? v.tone + " bg-void-800" : "border-void-700 text-ink-faint hover:text-ink"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            {checked && (
              <p className="mt-2 text-xs text-ink-dim">
                <span className={answers[i] === c.correct ? "font-bold text-mint-700 dark:text-mint-300" : "font-bold text-rose-400"}>
                  {answers[i] === c.correct ? "✓ " : `✗ - best answer: ${c.correct}. `}
                </span>
                {c.why}
              </p>
            )}
          </GlassCard>
        ))}
      </div>
      <div className="mt-4">
        {!checked ? (
          <Button disabled={!done} onClick={() => { setChecked(true); if (correct >= 3) onComplete?.(); }}>
            Submit verdicts
          </Button>
        ) : (
          <p className="text-sm font-semibold text-ink">
            {correct}/{CLAIMS.length} - {correct === CLAIMS.length ? "Flawless triage." : "Verification is a skill; the notes above show the tells."}
          </p>
        )}
      </div>
    </div>
  );
}
