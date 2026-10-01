"use client";

import { Icon } from "@/components/ui/Icon";

/**
 * Shared, accessible answer controls for every graded/practice question kind.
 * - ChoiceGroup: radio-style single select (also used for true/false)
 * - MultiGroup: checkbox-style multi select
 * - OrderGroup: arrangement via up/down buttons (keyboard-friendly drag-free)
 * - MatchGroup: per-item native selects (touch friendly)
 *
 * `reveal` (when provided) tints options after grading: correct = mint,
 * chosen-but-wrong = rose. Color is never the only signal - the feedback
 * text always states the outcome.
 */

interface Reveal {
  correct: number[];
}

export function ChoiceGroup({
  label,
  options,
  selected,
  onSelect,
  multi,
  disabled,
  reveal,
}: {
  label: string;
  options: string[];
  selected: number[];
  onSelect: (indexes: number[]) => void;
  multi?: boolean;
  disabled?: boolean;
  reveal?: Reveal | null;
}) {
  const sel = new Set(selected);
  return (
    <div className="mt-3 grid gap-2" role={multi ? "group" : "radiogroup"} aria-label={label}>
      {options.map((opt, ci) => {
        const isSelected = sel.has(ci);
        let cls =
          "border-void-700 bg-void-900 text-ink-dim hover:border-pulse-400/50 hover:text-ink";
        if (isSelected && !reveal) cls = "border-pulse-400 bg-pulse-400/10 text-ink";
        if (reveal) {
          const isCorrect = reveal.correct.includes(ci);
          if (isCorrect) cls = "border-mint-400/60 bg-mint-400/10 text-mint-800 dark:text-mint-200";
          else if (isSelected) cls = "border-rose-400/60 bg-rose-400/10 text-rose-700 dark:text-rose-300";
          else cls = "border-void-700/60 bg-void-900/60 text-ink-faint";
        }
        return (
          <button
            key={ci}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => {
              if (multi) {
                const next = new Set(sel);
                if (next.has(ci)) next.delete(ci);
                else next.add(ci);
                onSelect([...next].sort((a, b) => a - b));
              } else {
                onSelect([ci]);
              }
            }}
            className={`flex min-h-11 items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors focus-ring disabled:cursor-not-allowed ${cls}`}
          >
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current text-[11px] font-bold"
            >
              {reveal
                ? reveal.correct.includes(ci)
                  ? "✓"
                  : isSelected
                    ? "✕"
                    : ""
                : isSelected
                  ? "●"
                  : ""}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function OrderGroup({
  label,
  items,
  arrangement,
  onArrange,
  disabled,
  revealCorrect,
}: {
  label: string;
  items: string[];
  /** indexes into `items`, in current display order */
  arrangement: number[];
  onArrange: (next: number[]) => void;
  disabled?: boolean;
  revealCorrect?: number[] | null;
}) {
  const move = (pos: number, dir: -1 | 1) => {
    const to = pos + dir;
    if (to < 0 || to >= arrangement.length) return;
    const next = [...arrangement];
    const x = next.splice(pos, 1)[0] ?? -1;
    next.splice(to, 0, x);
    onArrange(next);
  };
  return (
    <ol className="mt-3 space-y-2" aria-label={label}>
      {arrangement.map((itemIdx, pos) => {
        const correctPos = revealCorrect ? revealCorrect.indexOf(itemIdx) : -1;
        const isRight = revealCorrect ? revealCorrect[pos] === itemIdx : null;
        return (
          <li
            key={itemIdx}
            className={`flex items-stretch gap-2 rounded-xl border px-3 py-2.5 ${
              isRight === null
                ? "border-void-700 bg-void-900 text-ink-dim"
                : isRight
                  ? "border-mint-400/60 bg-mint-400/10 text-ink"
                  : "border-rose-400/60 bg-rose-400/10 text-ink"
            }`}
          >
            <span
              aria-hidden="true"
              className="flex w-6 shrink-0 items-center justify-center rounded-md bg-void-800 font-mono text-xs font-bold text-ink-dim"
            >
              {pos + 1}
            </span>
            <span className="flex-1 self-center text-sm text-ink-dim">
              {items[itemIdx]}
              {isRight !== null && !isRight && (
                <span className="ml-2 text-xs font-semibold text-ink-faint">
                  (correct position: {correctPos + 1})
                </span>
              )}
            </span>
            <span className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                aria-label={`Move "${items[itemIdx]}" up`}
                disabled={disabled || pos === 0}
                onClick={() => move(pos, -1)}
                className="rounded-md border border-void-700 bg-void-850 px-2 py-0.5 text-[11px] font-bold text-ink-dim transition-colors hover:bg-void-800 hover:text-ink focus-ring disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move "${items[itemIdx]}" down`}
                disabled={disabled || pos === arrangement.length - 1}
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
  );
}

export function MatchGroup({
  label,
  left,
  right,
  picks,
  onPick,
  disabled,
  revealCorrect,
}: {
  label: string;
  left: string[];
  right: string[];
  /** picks[i] = chosen index into `right`, or -1 when unset */
  picks: number[];
  onPick: (leftIdx: number, rightIdx: number) => void;
  disabled?: boolean;
  revealCorrect?: number[] | null;
}) {
  return (
    <div className="mt-3 space-y-2" aria-label={label}>
      {left.map((l, li) => {
        const pick = picks[li] ?? -1;
        const correct = revealCorrect ? revealCorrect[li] ?? -1 : -1;
        const isRight = revealCorrect ? pick === correct : null;
        return (
          <div
            key={li}
            className={`flex flex-col gap-2 rounded-xl border px-3.5 py-3 sm:flex-row sm:items-center sm:gap-4 ${
              isRight === null
                ? "border-void-700 bg-void-900"
                : isRight
                  ? "border-mint-400/60 bg-mint-400/10"
                  : "border-rose-400/60 bg-rose-400/10"
            }`}
          >
            <span className="flex-1 text-sm text-ink-dim">{l}</span>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="text-ink-faint">
                <Icon name="arrow-right" size={14} />
              </span>
              <select
                aria-label={`Match: ${l}`}
                value={pick}
                disabled={disabled}
                onChange={(e) => onPick(li, Number(e.target.value))}
                className={`min-h-11 min-w-44 max-w-full rounded-lg border px-3 py-2 text-sm focus-ring ${
                  pick === -1
                    ? "border-void-700 bg-void-850 text-ink-faint"
                    : isRight === null
                      ? "border-pulse-400/60 bg-void-850 text-ink"
                      : isRight
                        ? "border-mint-400/60 bg-mint-400/10 text-ink"
                        : "border-rose-400/60 bg-rose-400/10 text-ink"
                }`}
              >
                <option value={-1}>Choose the match…</option>
                {right.map((r, ri) => (
                  <option key={ri} value={ri}>
                    {r}
                  </option>
                ))}
              </select>
              {revealCorrect && !isRight && (
                <span className="text-xs font-semibold text-ink-faint">
                  correct: {right[correct] ?? ""}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
