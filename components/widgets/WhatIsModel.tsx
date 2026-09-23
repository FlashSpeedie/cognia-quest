"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * "What is a model?" - examples → pattern → prediction.
 * Click points onto the chart; least-squares line = the model. Deterministic.
 */
export function WhatIsModel({ onComplete }: { onComplete?: () => void }) {
  const [points, setPoints] = useState<[number, number][]>([
    [1, 5], [2, 10], [3, 14], [4, 20], [5, 24],
  ]);
  const [queryX, setQueryX] = useState(6);

  const { slope, intercept, prediction } = useMemo(() => {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, prediction: 0 };
    const sx = points.reduce((s, p) => s + p[0], 0);
    const sy = points.reduce((s, p) => s + p[1], 0);
    const sxx = points.reduce((s, p) => s + p[0] * p[0], 0);
    const sxy = points.reduce((s, p) => s + p[0] * p[1], 0);
    const denom = n * sxx - sx * sx;
    const slope = Math.abs(denom) < 1e-9 ? 0 : (n * sxy - sx * sy) / denom;
    const intercept = (sy - slope * sx) / n;
    return { slope, intercept, prediction: slope * queryX + intercept };
  }, [points, queryX]);

  // chart: x 0..10 (hours studying), y 0..50 (test score)
  const W = 420, H = 220, pad = 28;
  const cx = (x: number) => pad + (x / 10) * (W - pad * 2);
  const cy = (y: number) => H - pad - (y / 50) * (H - pad * 2);

  function onChartClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left - pad) / (W - pad * 2)) * 10;
    const y = ((H - pad - (e.clientY - rect.top)) / (H - pad * 2)) * 50;
    if (x < 0 || x > 10 || y < 0 || y > 50) return;
    const next = [...points, [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as [number, number]].slice(-14);
    setPoints(next);
    if (next.length >= 8) onComplete?.();
  }

  const y = (x: number) => Math.max(0, Math.min(50, slope * x + intercept));

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-void-700 bg-void-900 p-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full cursor-crosshair"
            role="img"
            aria-label={`Scatter plot of study hours vs test score with a fitted line. The model predicts ${Math.round(prediction)} points at ${queryX} hours.`}
            onClick={onChartClick}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <line key={i} x1={pad} x2={W - pad} y1={cy(i * 10)} y2={cy(i * 10)} stroke="#182036" strokeWidth="1" />
            ))}
            {points.map((p, i) => (
              <circle key={i} cx={cx(p[0])} cy={cy(p[1])} r="5" fill="#38bdf8" />
            ))}
            {points.length >= 2 && (
              <line x1={cx(0)} y1={cy(y(0))} x2={cx(10)} y2={cy(y(10))} stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="6 4" />
            )}
            <line x1={cx(queryX)} y1={cy(0)} x2={cx(queryX)} y2={cy(50)} stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            {points.length >= 2 && <circle cx={cx(queryX)} cy={cy(y(queryX))} r="7" fill="none" stroke="#34d399" strokeWidth="2.5" />}
            <text x={W - pad} y={H - 6} textAnchor="end" fill="#5d6a86" fontSize="9">study hours →</text>
            <text x={pad - 4} y={pad - 8} textAnchor="start" fill="#5d6a86" fontSize="9">test score</text>
          </svg>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-void-700 bg-void-900 p-4 sm:w-48">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">The model</p>
          <p className="text-sm text-ink">
            score ≈ <span className="font-mono text-volt-700 dark:text-volt-300">{slope.toFixed(1)}</span> × hours{" "}
            {intercept >= 0 ? "+" : "−"} <span className="font-mono text-volt-700 dark:text-volt-300">{Math.abs(intercept).toFixed(1)}</span>
          </p>
          {points.length >= 2 && (
            <p className="text-sm text-ink">
              At <span className="font-mono text-mint-700 dark:text-mint-300">{queryX}h</span> → predicts{" "}
              <span className="font-mono text-mint-700 dark:text-mint-300">{Math.round(prediction)}</span>
            </p>
          )}
          <label className="text-xs text-ink-dim">
            Ask about hours:
            <input
              type="range" min={0} max={10} step={0.5} value={queryX}
              onChange={(e) => setQueryX(Number(e.target.value))}
              className="mt-1 w-full accent-pulse-400"
              aria-label="Study hours to predict for"
            />
          </label>
          <p className="text-[11px] leading-relaxed text-ink-faint">
            Click the chart to add examples. Add a wild outlier (0h → 48 points?) and watch the line bend - the model only knows the examples you showed it.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setPoints([[1, 5], [2, 10], [3, 14], [4, 20], [5, 24]])}>
            Reset data
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs font-mono uppercase tracking-widest text-ink-faint">
        EXAMPLES → PATTERN (line) → MODEL → PREDICTION · educational simulation
      </p>
    </div>
  );
}
