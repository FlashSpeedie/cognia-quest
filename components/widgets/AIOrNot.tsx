"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";

/** "AI OR NOT?" — classify systems. Deterministic, educational. */
export const AI_OR_NOT_ITEMS = [
  { id: "spam", label: "Spam filter that learned from millions of emails", isAI: true, why: "Learns patterns from data — that's machine learning." },
  { id: "calc", label: "Pocket calculator", isAI: false, why: "Follows fixed arithmetic rules. Nothing is learned." },
  { id: "rec", label: "Video app recommending your next watch", isAI: true, why: "Predicts your taste from behavior — a recommender model." },
  { id: "search", label: "Search engine ranking pages with learned relevance signals", isAI: true, why: "Modern ranking uses ML models trained on click/query data." },
  { id: "ifelse", label: "Thermostat: IF temp < 68°F THEN heat on", isAI: false, why: "A hand-written rule. No learning, no data-driven pattern." },
  { id: "vision", label: "Phone unlock that recognizes your face", isAI: true, why: "Computer vision model trained on facial features." },
  { id: "dice", label: "Random number generator for a board game", isAI: false, why: "Randomness ≠ intelligence. No pattern, no learning." },
  { id: "chat", label: "Chatbot that writes essays from a prompt", isAI: true, why: "Generative model predicting likely text." },
];

export function AIOrNot({ onComplete }: { onComplete?: (scorePct: number) => void }) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);

  const done = Object.keys(answers).length === AI_OR_NOT_ITEMS.length;
  const correctCount = AI_OR_NOT_ITEMS.filter((i) => answers[i.id] === i.isAI).length;

  return (
    <div>
      <div className="grid gap-2.5" role="group" aria-label="Classify each system as AI or not AI">
        {AI_OR_NOT_ITEMS.map((item) => {
          const a = answers[item.id];
          const state = checked
            ? a === item.isAI
              ? "border-mint-400/50 bg-mint-400/10"
              : "border-rose-400/50 bg-rose-400/10"
            : "border-void-700";
          return (
            <GlassCard key={item.id} className={`p-3.5 transition-colors ${state}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-ink">{item.label}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={a === true ? "primary" : "secondary"}
                    onClick={() => !checked && setAnswers((p) => ({ ...p, [item.id]: true }))}
                    aria-pressed={a === true}
                  >
                    AI
                  </Button>
                  <Button
                    size="sm"
                    variant={a === false ? "primary" : "secondary"}
                    onClick={() => !checked && setAnswers((p) => ({ ...p, [item.id]: false }))}
                    aria-pressed={a === false}
                  >
                    Not AI
                  </Button>
                </div>
              </div>
              {checked && (
                <p className="mt-2 text-xs text-ink-dim">
                  <span className={a === item.isAI ? "font-bold text-mint-300" : "font-bold text-rose-400"}>
                    {a === item.isAI ? "Correct — " : "Actually — "}
                  </span>
                  {item.why}
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        {!checked ? (
          <Button onClick={() => checked || (done && (setChecked(true), onComplete?.(Math.round((correctCount / AI_OR_NOT_ITEMS.length) * 100))))} disabled={!done}>
            Check answers
          </Button>
        ) : (
          <p className="font-display text-lg font-bold text-ink">
            {correctCount}/{AI_OR_NOT_ITEMS.length} — {correctCount === AI_OR_NOT_ITEMS.length ? "Perfect detector." : "the reveals above explain each."}
          </p>
        )}
      </div>
    </div>
  );
}
