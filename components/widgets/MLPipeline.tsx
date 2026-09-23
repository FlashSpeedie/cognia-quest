"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const STAGES = [
  { id: "data", label: "DATA", icon: "chart" as const, body: "Collect examples. Quality beats quantity: representative, consenting, documented. Whoever picks the data is already shaping the model." },
  { id: "clean", label: "CLEAN", icon: "shield" as const, body: "Fix errors, remove duplicates, handle missing values. Real datasets are messy; this stage often takes more time than training itself." },
  { id: "train", label: "TRAIN", icon: "cpu" as const, body: "The model adjusts its internal numbers to fit the training examples. This is where 'learning' happens." },
  { id: "validate", label: "VALIDATE", icon: "search" as const, body: "Tune choices (like model complexity) against a held-out validation set - rehearsal for the final exam." },
  { id: "test", label: "TEST", icon: "check" as const, body: "One honest measurement on data the model never saw during training or tuning. This is the number you report." },
  { id: "predict", label: "PREDICT", icon: "spark" as const, body: "Deployment: the model does its job on new inputs - with monitoring, because the world drifts." },
];

export function MLPipeline({ onComplete }: { onComplete?: () => void }) {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(0);
  const stage = STAGES[active]!;

  function visit(i: number) {
    setActive(i);
    setVisited((v) => new Set(v).add(STAGES[i]!.id));
    if (visited.size + 1 >= STAGES.length) onComplete?.();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="ML pipeline stages">
        {STAGES.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <button
              role="tab"
              aria-selected={i === active}
              onClick={() => visit(i)}
              className={`rounded-lg border px-3 py-2 font-mono text-xs font-bold tracking-widest transition-colors focus-ring ${
                i === active
                  ? "border-pulse-400 bg-pulse-400/15 text-pulse-700 dark:text-pulse-300"
                  : visited.has(s.id)
                    ? "border-mint-400/40 text-mint-700 dark:text-mint-300"
                    : "border-void-700 text-ink-dim hover:text-ink"
              }`}
            >
              {s.label}
            </button>
            {i < STAGES.length - 1 && <span className="text-ink-faint" aria-hidden>↓</span>}
          </div>
        ))}
      </div>
      <GlassCard className="mt-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pulse-400/10 text-pulse-700 dark:text-pulse-300">
            <Icon name={stage.icon} size={20} />
          </span>
          <h4 className="font-display text-lg font-bold text-ink">{stage.label}</h4>
          {visited.has(stage.id) && <Icon name="check" size={16} className="text-mint-400" />}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">{stage.body}</p>
      </GlassCard>
      <p className="mt-2 text-xs text-ink-faint">Explore all six stages to finish this step. {visited.size}/{STAGES.length}</p>
    </div>
  );
}
