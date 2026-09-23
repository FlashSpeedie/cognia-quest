"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/Card";
import { BarRow } from "@/components/charts/Charts";

/**
 * Overfitting demo (spec §60): complexity slider drives deterministic
 * accuracy curves - training climbs to 100%, test accuracy arcs and falls.
 */
const CURVE = [
  { c: 1, train: 62, test: 60 },
  { c: 2, train: 74, test: 72 },
  { c: 3, train: 84, test: 83 },
  { c: 4, train: 88, test: 86 },
  { c: 5, train: 92, test: 85 },
  { c: 6, train: 95, test: 80 },
  { c: 7, train: 97, test: 74 },
  { c: 8, train: 99, test: 68 },
  { c: 9, train: 100, test: 64 },
  { c: 10, train: 100, test: 61 },
];

export function OverfittingLab({ onComplete }: { onComplete?: () => void }) {
  const [c, setC] = useState(4);
  const [finished, setFinished] = useState(false);
  const row = CURVE[c - 1]!;

  const verdict = useMemo(() => {
    if (c <= 2) return { t: "Too simple - the model misses the pattern (underfit).", tone: "text-amber-600 dark:text-amber-300" };
    if (c <= 5) return { t: "Sweet spot - it learns the signal and it generalizes.", tone: "text-mint-700 dark:text-mint-300" };
    return { t: "Overfit - memorize the training set, flunk the real world.", tone: "text-rose-400" };
  }, [c]);

  return (
    <div>
      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Model complexity</p>
          <span className="font-mono text-lg font-bold text-pulse-700 dark:text-pulse-300">{c}/10</span>
        </div>
        <div className="mt-3 flex h-4 items-end gap-1" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className={`flex-1 rounded-sm transition-all ${i < c ? "bg-gradient-to-t from-pulse-500 to-volt-500" : "bg-void-700"}`} style={{ height: `${((i + 1) / 10) * 100}%` }} />
          ))}
        </div>
        <input
          type="range" min={1} max={10} value={c}
          onChange={(e) => { const v = Number(e.target.value); setC(v); if (v >= 9 && !finished) { setFinished(true); onComplete?.(); } }}
          className="mt-4 w-full accent-pulse-400"
          aria-label="Model complexity from 1 (simple) to 10 (extremely complex)"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <BarRow label="Training accuracy" value={row.train} tone="mint" />
          <BarRow label="Test accuracy (new data)" value={row.test} tone={row.test < 70 ? "amber" : "pulse"} />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-void-700" aria-hidden="true">
          <div className="h-full bg-gradient-to-r from-mint-500 via-amber-500 to-rose-500 opacity-40" />
        </div>
        <p className={`mt-4 text-sm font-semibold ${verdict.tone}`}>{verdict.t}</p>
        {c >= 8 && (
          <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-ink">
            Training accuracy <span className="font-mono">{row.train}%</span> but test accuracy{" "}
            <span className="font-mono">{row.test}%</span> - a {row.train - row.test}-point gap. The model memorized the noise.
          </div>
        )}
      </GlassCard>
      <p className="mt-2 text-xs italic text-ink-faint">Educational simulation - the curves model the classic pattern, not a specific dataset.</p>
    </div>
  );
}
