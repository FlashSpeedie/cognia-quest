"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Shared engine for scenario-based activities: a stack of scenario cards.
 * Each card requires a choice before the explanation is revealed - the
 * answer is never shown up front. Works fully for signed-out visitors.
 */
export interface ScenarioStep {
  /** the situation text */
  text: string;
  /** small context line (e.g. the setting) */
  sub?: string;
  options: string[];
  correct: number;
  explanation: string;
}

export function ScenarioSteps({
  steps,
  onComplete,
  ariaLabel,
}: {
  steps: ScenarioStep[];
  onComplete: () => void;
  ariaLabel: string;
}) {
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(0);

  const step = steps[current]!;
  const isLast = current === steps.length - 1;

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const next = answered + 1;
    setAnswered(next);
    if (next === steps.length) onComplete();
  }

  function next() {
    setPicked(null);
    setCurrent((c) => Math.min(c + 1, steps.length - 1));
  }

  return (
    <div aria-label={ariaLabel}>
      {/* progress */}
      <div className="flex items-center gap-3" role="status">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-void-700" aria-hidden="true">
          <div
            className="h-full rounded-full bg-pulse-500 transition-[width] duration-300"
            style={{ width: `${(answered / steps.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[11px] font-semibold text-ink-faint">
          {answered}/{steps.length}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">
          Situation {current + 1}
        </p>
        {step.sub && <p className="mt-1 text-xs font-semibold text-pulse-700 dark:text-pulse-300">{step.sub}</p>}
        <p className="mt-1.5 text-sm leading-relaxed text-ink">{step.text}</p>

        <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Choose your answer">
          {step.options.map((opt, i) => {
            let cls =
              "border-void-700 bg-void-900 text-ink-dim hover:border-pulse-400/50 hover:text-ink";
            if (picked !== null) {
              if (i === step.correct) cls = "border-mint-400/60 bg-mint-400/10 text-ink";
              else if (i === picked) cls = "border-rose-400/60 bg-rose-400/10 text-rose-700 dark:text-rose-300";
              else cls = "border-void-700/60 bg-void-900/60 text-ink-faint";
            }
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={picked === i}
                disabled={picked !== null}
                onClick={() => choose(i)}
                className={`flex min-h-11 items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors focus-ring disabled:cursor-default ${cls}`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current text-[11px] font-bold"
                >
                  {picked !== null && i === step.correct ? "✓" : picked === i ? "●" : ""}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div aria-live="polite" className="mt-3">
            <div
              className={`rounded-lg border p-3.5 text-sm leading-relaxed ${
                picked === step.correct
                  ? "border-mint-400/40 bg-mint-400/10"
                  : "border-amber-400/40 bg-amber-400/10"
              }`}
            >
              <p
                className={`font-bold ${
                  picked === step.correct
                    ? "text-mint-700 dark:text-mint-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {picked === step.correct ? "Exactly." : "Close - here's the reasoning:"}
              </p>
              <p className="mt-1 text-ink-dim">{step.explanation}</p>
            </div>
            {!isLast && (
              <Button size="sm" className="mt-3" onClick={next}>
                Next situation <Icon name="arrow-right" size={14} aria-hidden="true" />
              </Button>
            )}
            {isLast && (
              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-mint-700 dark:text-mint-300">
                <Icon name="check" size={15} aria-hidden="true" /> Activity complete.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Shared ordering exercise: arrange items with up/down buttons (keyboard
 * friendly - no drag needed), check, fix with guidance, complete on correct.
 */
export function OrderingExercise({
  items,
  correctOrder,
  perItemFeedback,
  checkLabel = "Check my order",
  onCorrect,
  ariaLabel,
}: {
  /** display order the items start in (indexes into `items`) */
  items: string[];
  /** correct arrangement, as indexes into `items` in top-to-bottom order */
  correctOrder: number[];
  /** shown while fixing: hints per item index */
  perItemFeedback?: string[];
  checkLabel?: string;
  onCorrect: () => void;
  ariaLabel: string;
}) {
  const [arrangement, setArrangement] = useState<number[]>(items.map((_, i) => i));
  const [checks, setChecks] = useState(0);
  const [wrongPositions, setWrongPositions] = useState<number[] | null>(null);

  function move(pos: number, dir: -1 | 1) {
    const to = pos + dir;
    if (to < 0 || to >= arrangement.length) return;
    const next = [...arrangement];
    const x = next.splice(pos, 1)[0] ?? -1;
    next.splice(to, 0, x);
    setArrangement(next);
  }

  function check() {
    const wrong = arrangement
      .map((itemIdx, pos) => (correctOrder[pos] === itemIdx ? -1 : pos))
      .filter((p) => p >= 0);
    setChecks((c) => c + 1);
    if (wrong.length === 0) {
      setWrongPositions([]);
      onCorrect();
    } else {
      setWrongPositions(wrong);
    }
  }

  return (
    <div aria-label={ariaLabel}>
      <ol className="space-y-2">
        {arrangement.map((itemIdx, pos) => {
          const wrong = wrongPositions?.includes(pos) ?? false;
          const right = wrongPositions !== null && wrongPositions.length === 0;
          return (
            <li
              key={itemIdx}
              className={`flex items-stretch gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                right
                  ? "border-mint-400/60 bg-mint-400/10"
                  : wrong
                    ? "border-amber-400/60 bg-amber-400/10"
                    : "border-void-700 bg-void-900"
              }`}
            >
              <span
                aria-hidden="true"
                className="flex w-7 shrink-0 items-center justify-center rounded-md bg-void-800 font-mono text-xs font-bold text-ink-dim"
              >
                {pos + 1}
              </span>
              <span className="flex-1 self-center text-sm text-ink-dim">
                {items[itemIdx]}
                {wrong && perItemFeedback?.[itemIdx] && (
                  <span className="mt-1 block text-xs text-amber-700 dark:text-amber-300">
                    {perItemFeedback[itemIdx]}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label={`Move ${items[itemIdx]} up`}
                  disabled={pos === 0}
                  onClick={() => move(pos, -1)}
                  className="rounded-md border border-void-700 bg-void-850 px-2 py-0.5 text-[11px] font-bold text-ink-dim transition-colors hover:bg-void-800 hover:text-ink focus-ring disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Move ${items[itemIdx]} down`}
                  disabled={pos === arrangement.length - 1}
                  onClick={() => move(pos, 1)}
                  className="rounded-md border border-void-700 bg-void-850 px-2 py-0.5 text-[11px] font-bold text-ink-dim transition-colors hover:bg-void-800 hover:text-ink focus-ring disabled:opacity-30"
                >
                  ↓
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {wrongPositions === null || wrongPositions.length > 0 ? (
          <Button size="sm" onClick={check}>
            {checkLabel}
          </Button>
        ) : (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-mint-700 dark:text-mint-300">
            <Icon name="check" size={15} aria-hidden="true" /> Correct order - activity complete.
          </p>
        )}
        {checks > 0 && (wrongPositions === null || wrongPositions.length > 0) && (
          <span aria-live="polite" className="text-xs text-ink-faint">
            {wrongPositions?.length ?? 0} item{wrongPositions?.length === 1 ? "" : "s"} out of place - the
            highlights hint at where each belongs.
          </span>
        )}
      </div>
    </div>
  );
}
