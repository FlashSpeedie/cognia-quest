"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Model flexibility explorer - a CONCEPTUAL visualization, not a
 * mathematical simulation. Moving the slider changes the model's
 * personality: bias falls as variance rises, and an over-flexible model
 * starts reacting to noise it should ignore.
 */

const STOPS = [
  {
    label: "Very simple model",
    bias: 90,
    variance: 12,
    misses: 92,
    noiseReaction: 8,
    headline: "High bias, low variance",
    body: "Like a straight line through curved data: steady across samples, but it systematically misses the real pattern.",
    path: "M6,86 C50,80 94,58 94,58",
  },
  {
    label: "Fairly simple model",
    bias: 72,
    variance: 24,
    misses: 70,
    noiseReaction: 20,
    headline: "Bias still dominant",
    body: "It follows the broad shape now, but real subtleties of the pattern are still being averaged away.",
    path: "M6,86 C40,78 62,52 94,56",
  },
  {
    label: "Balanced model",
    bias: 38,
    variance: 38,
    misses: 34,
    noiseReaction: 34,
    headline: "The sweet spot",
    body: "Enough flexibility to capture the true pattern, not enough to wrap around the quirks of this particular sample.",
    path: "M6,86 C30,74 38,50 50,48 C62,46 74,52 94,76",
  },
  {
    label: "Very flexible model",
    bias: 18,
    variance: 66,
    misses: 16,
    noiseReaction: 68,
    headline: "Variance is creeping up",
    body: "It now fits bumps that exist only in this sample - retrain on new data and the model's shape shifts noticeably.",
    path: "M6,86 C14,64 18,84 30,52 C38,34 44,66 52,48 C60,34 70,58 78,52 C86,46 90,70 94,74",
  },
  {
    label: "Extremely flexible model",
    bias: 8,
    variance: 94,
    misses: 8,
    noiseReaction: 92,
    headline: "Low bias, high variance - memorizing",
    body: "It touches nearly every training point, noise included. Brilliant on this sample, unreliable on the next one.",
    path: "M6,86 C10,58 14,92 20,50 C26,22 30,80 38,58 C44,40 48,20 54,50 C60,74 66,28 72,44 C78,58 84,30 90,62 C92,70 93,72 94,74",
  },
];

const POINTS: [number, number][] = [
  [8, 74], [22, 60], [36, 42], [50, 34], [64, 40], [78, 58], [92, 76],
];

function LevelBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  const shown = Math.max(6, value);
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="font-semibold text-ink-dim">{label}</span>
        <span className="font-mono font-bold text-ink-faint">{Math.round(value)}%</span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-void-700"
        role="img"
        aria-label={`${label}: ${Math.round(value)} out of 100`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${tone}`}
          style={{ width: `${shown}%` }}
        />
      </div>
    </div>
  );
}

export function FlexSlider({ onComplete, done }: { onComplete?: () => void; done?: boolean }) {
  const [stop, setStop] = useState(2);
  const [touched, setTouched] = useState(false);
  const s = STOPS[stop]!;

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-ink-dim">
        <span>Rigid</span>
        <span className="text-ink-faint">Flexible</span>
      </div>
      <input
        type="range"
        min={0}
        max={STOPS.length - 1}
        step={1}
        value={stop}
        onChange={(e) => {
          setStop(Number(e.target.value));
          setTouched(true);
        }}
        aria-label={`Model flexibility: currently ${s.label}`}
        aria-valuetext={s.label}
        className="mt-2 w-full accent-pulse-600"
      />
      <p className="mt-1 text-center text-xs font-bold text-pulse-700 dark:text-pulse-300">{s.label}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-void-700 bg-void-850 p-4">
          <svg viewBox="0 0 100 100" className="h-24 w-full text-ink-faint" aria-hidden="true" preserveAspectRatio="none">
            {POINTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={100 - y} r="2.6" fill="currentColor" />
            ))}
            <path d={s.path} fill="none" strokeWidth="2" stroke="#0ea5e9" strokeLinecap="round" />
          </svg>
          <p className="mt-1 text-center text-[10px] text-ink-faint">
            dots = training examples (some are noise)
          </p>
        </div>
        <div className="space-y-3">
          <LevelBar label="Bias (misses the true pattern)" value={s.bias} tone="bg-amber-500" />
          <LevelBar label="Variance (reacts to this sample's quirks)" value={s.variance} tone="bg-rose-500" />
          <LevelBar label="Tendency to miss real patterns" value={s.misses} tone="bg-amber-400/80" />
          <LevelBar label="Tendency to chase noise" value={s.noiseReaction} tone="bg-rose-400/80" />
        </div>
      </div>

      <div aria-live="polite" className="mt-4 rounded-lg border border-pulse-400/30 bg-pulse-400/5 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-pulse-700 dark:text-pulse-300">{s.headline}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-dim">{s.body}</p>
      </div>

      <p className="mt-3 text-[11px] text-ink-faint">
        Conceptual visualization - the levels illustrate the trade-off, they are not a measured simulation.
      </p>

      {!done && (
        <Button
          size="sm"
          className="mt-3"
          disabled={!touched}
          onClick={() => onComplete?.()}
        >
          {touched ? "Got it - mark step done" : "Move the slider to explore first"}
        </Button>
      )}
      {done && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-mint-700 dark:text-mint-300">
          Activity complete.
        </p>
      )}
    </div>
  );
}
