"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";

const PROBLEMS = [
  { text: "Predict whether a loan applicant will default", type: "classification" as const },
  { text: "Estimate tomorrow's temperature", type: "regression" as const },
  { text: "Decide if an X-ray shows a fracture", type: "classification" as const },
  { text: "Predict a student's score on a 100-point test", type: "regression" as const },
  { text: "Sort support emails into billing vs technical", type: "classification" as const },
  { text: "Forecast how many riders the bus will have", type: "regression" as const },
];

export function ClassifyOrRegress({ onComplete }: { onComplete?: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const done = Object.keys(answers).length === PROBLEMS.length;
  const correct = PROBLEMS.filter((p, i) => answers[i] === p.type).length;

  return (
    <div>
      <div className="grid gap-2">
        {PROBLEMS.map((p, i) => {
          const chosen = answers[i];
          const right = chosen === p.type;
          return (
            <GlassCard key={i} className={`flex flex-wrap items-center justify-between gap-2 p-3.5 ${checked ? (right ? "border-mint-400/40" : "border-rose-400/40") : ""}`}>
              <p className="text-sm text-ink">{p.text}</p>
              <div className="flex gap-1.5" role="radiogroup" aria-label={p.text}>
                {(["classification", "regression"] as const).map((t) => (
                  <button
                    key={t}
                    role="radio"
                    aria-checked={chosen === t}
                    disabled={checked}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: t }))}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize focus-ring ${
                      chosen === t ? "border-pulse-400 bg-pulse-400/15 text-pulse-300" : "border-void-700 text-ink-dim hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>
      <div className="mt-4">
        {!checked ? (
          <Button disabled={!done} onClick={() => { setChecked(true); if (correct >= 5) onComplete?.(); }}>Check</Button>
        ) : (
          <p className="text-sm font-semibold text-ink">
            {correct}/{PROBLEMS.length} right. {correct === PROBLEMS.length ? "Task-types sorted." : "Category or number — that question settles it."}
          </p>
        )}
      </div>
    </div>
  );
}
