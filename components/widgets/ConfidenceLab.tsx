"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";

/** "Why does AI sound so confident?" (spec §14) — fluency vs truth. */
const DEMOS = [
  {
    q: "What year did humans first land on the Moon?",
    answer:
      "Humans first landed on the Moon in 1969, when Apollo 11's lunar module touched down in the Sea of Tranquility.",
    truth: "correct",
    tNote: "Accurate — and confidently delivered.",
  },
  {
    q: "How many hearts does a giraffe have?",
    answer:
      "A giraffe has eight hearts to pump blood up its long neck — one main heart plus seven auxiliary pumps along the neck arteries.",
    truth: "false",
    tNote: "Giraffes have ONE (very strong) heart. This answer reads perfectly — fluent, specific, and fabricated.",
  },
] as const;

export function ConfidenceLab({ onComplete }: { onComplete?: () => void }) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const demo = DEMOS[i]!;
  const onLast = i === DEMOS.length - 1;

  return (
    <div>
      <GlassCard className="p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Simulated assistant · demo {i + 1}/{DEMOS.length}</p>
        <p className="mt-2 rounded-xl border border-void-700 bg-void-900 px-4 py-3 text-sm text-ink-dim">
          <span className="mr-2 font-mono text-pulse-300">you:</span>
          {demo.q}
        </p>
        <div className="mt-3 rounded-xl border border-volt-400/25 bg-volt-400/5 px-4 py-3">
          <p className="mb-1.5 font-mono text-pulse-300 text-xs">ai:</p>
          <p className="text-sm leading-relaxed text-ink">{demo.answer}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-ink-faint">confidence tone</span>
            <div className="h-1.5 flex-1 rounded-full bg-void-700 overflow-hidden">
              <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-pulse-400 to-volt-400" />
            </div>
            <span className="font-mono text-[10px] text-volt-300">max</span>
          </div>
        </div>
        {!revealed ? (
          <Button className="mt-4" variant="secondary" onClick={() => { setRevealed(true); if (onLast) onComplete?.(); }}>
            Reveal ground truth
          </Button>
        ) : (
          <div className={`mt-4 rounded-xl border p-4 ${demo.truth === "correct" ? "border-mint-400/40 bg-mint-400/10" : "border-rose-400/40 bg-rose-400/10"}`}>
            <p className={`font-mono text-xs font-bold uppercase tracking-widest ${demo.truth === "correct" ? "text-mint-300" : "text-rose-400"}`}>
              verdict: {demo.truth === "correct" ? "Accurate" : "Hallucination"}
            </p>
            <p className="mt-1.5 text-sm text-ink">{demo.tNote}</p>
            {!onLast && (
              <Button className="mt-3" size="sm" onClick={() => { setI(1); setRevealed(false); }}>
                Next example
              </Button>
            )}
          </div>
        )}
      </GlassCard>
      <p className="mt-3 text-sm text-ink-dim">
        Same confident tone in both. The model has no internal fact-checker — fluency is its job description, not truth.
        Polished language <strong className="text-ink">does not</strong> guarantee truth.
      </p>
    </div>
  );
}
