"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** Interactive confusion matrix (spec §64). */
const CELLS = [
  {
    id: "tp", label: "TRUE POSITIVE", short: "TP", row: 0, col: 0,
    plain: "The model said spam, and it was spam. Caught.",
    example: "A scam email titled 'You won a prize!!!' lands in the junk folder.",
    tone: "border-mint-400/50 bg-mint-400/10",
  },
  {
    id: "fn", label: "FALSE NEGATIVE", short: "FN", row: 0, col: 1,
    plain: "It WAS spam, but the model called it safe. A miss.",
    example: "A phishing email lands in your inbox looking like a school notice.",
    tone: "border-amber-400/50 bg-amber-400/10",
  },
  {
    id: "fp", label: "FALSE POSITIVE", short: "FP", row: 1, col: 0,
    plain: "The model cried spam on a legit email. A false alarm.",
    example: "Your acceptance email gets buried in junk.",
    tone: "border-amber-400/50 bg-amber-400/10",
  },
  {
    id: "tn", label: "TRUE NEGATIVE", short: "TN", row: 1, col: 1,
    plain: "Legit email, correctly delivered. Correct rejection.",
    example: "A classmate's project notes arrive in your inbox as they should.",
    tone: "border-pulse-400/40 bg-pulse-400/5",
  },
];

export function ConfusionMatrix({ onComplete }: { onComplete?: () => void }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = CELLS.find((c) => c.id === activeId);

  function pick(id: string) {
    setActiveId(id);
    setSeen((s) => new Set(s).add(id));
    if (seen.size + 1 >= 4) onComplete?.();
  }

  // sample counts for precision/recall illustration
  const tp = 85, fp = 15, fn = 25, tn = 875;
  const precision = Math.round((tp / (tp + fp)) * 100);
  const recall = Math.round((tp / (tp + fn)) * 100);

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">
        <span />
        <span className="pb-1">Predicted: spam</span>
        <span className="pb-1">Predicted: safe</span>
        <span className="pr-2 [writing-mode:vertical-rl] rotate-180">Actually spam</span>
        <CellButton cell={CELLS[0]!} seen={seen.has("tp")} onPick={pick} />
        <CellButton cell={CELLS[1]!} seen={seen.has("fn")} onPick={pick} />
        <span className="pr-2 [writing-mode:vertical-rl] rotate-180">Actually safe</span>
        <CellButton cell={CELLS[2]!} seen={seen.has("fp")} onPick={pick} />
        <CellButton cell={CELLS[3]!} seen={seen.has("tn")} onPick={pick} />
      </div>

      {active && (
        <GlassCard className="mt-4 border-pulse-400/30 p-4 animate-fade-up">
          <p className="font-mono text-xs font-bold text-pulse-300">{active.label}</p>
          <p className="mt-1.5 text-sm text-ink">{active.plain}</p>
          <p className="mt-1 text-xs italic text-ink-dim">e.g. {active.example}</p>
        </GlassCard>
      )}

      <GlassCard className="mt-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <p className="text-ink">
              Precision <span className="font-mono text-pulse-300">{precision}%</span> — of the {tp + fp} emails flagged, {tp} were really spam.
            </p>
            <p className="mt-1 text-ink">
              Recall <span className="font-mono text-volt-300">{recall}%</span> — of all {tp + fn} real spam emails, {tp} were caught.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => { CELLS.forEach((c) => { seen.add(c.id); }); setSeen(new Set(CELLS.map(c => c.id))); onComplete?.(); }}>
            Explore all four
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-faint">Progress: {seen.size}/4 cells explored.</p>
      </GlassCard>
    </div>
  );
}

function CellButton({ cell, seen, onPick }: { cell: (typeof CELLS)[number]; seen: boolean; onPick: (id: string) => void }) {
  return (
    <button
      onClick={() => onPick(cell.id)}
      className={`rounded-xl border p-3 text-left transition hover:brightness-125 focus-ring ${cell.tone}`}
      aria-label={`${cell.label}. Click to learn what it means.`}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{cell.short}</span>
      <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-ink">
        {cell.label} {seen && <span className="text-mint-400" aria-hidden>✓</span>}
      </span>
    </button>
  );
}
