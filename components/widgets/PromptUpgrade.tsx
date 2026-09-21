"use client";

import { useMemo, useState } from "react";
import { scorePrompt } from "@/server/services/promptScore";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

const WEAK = "Tell me about the Roman Empire.";
const STRONG =
  "I'm a 10th grader preparing a 1-minute speech on why the Roman Empire fell. Give me the 3 biggest causes, each with a one-sentence example, and a closing line. No more than 180 words, no jargon.";

export function PromptUpgrade({ onComplete }: { onComplete?: () => void }) {
  const [prompt, setPrompt] = useState(WEAK);
  const [showStrong, setShowStrong] = useState(false);
  const score = useMemo(() => scorePrompt(prompt), [prompt]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="upgrade-prompt" className="text-sm font-medium text-ink">
            Your prompt — edit it live
          </label>
          <textarea
            id="upgrade-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 600))}
            rows={6}
            className="mt-1.5 w-full rounded-xl border border-void-700 bg-void-850 p-3 font-mono text-sm text-ink focus-ring"
          />
          <div className="mt-2 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setPrompt(WEAK); setShowStrong(false); }}>
              Reset to weak
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setPrompt(STRONG); setShowStrong(true); }}>
              Load a strong example
            </Button>
          </div>
        </div>
        <div>
          <GlassCard className={`p-4 transition-colors ${score.total >= 80 ? "border-mint-400/40" : score.total >= 50 ? "border-amber-400/30" : "border-rose-400/30"}`}>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">PROMPT SCORE (heuristic)</span>
              <span className="font-display text-2xl font-black text-ink">{score.total}</span>
            </div>
            <ProgressBar value={score.total} label="" tone={score.total >= 80 ? "mint" : score.total >= 50 ? "amber" : "pulse"} className="mt-2" />
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {score.dimensions.map((d) => (
                <div key={d.key} className="flex items-center justify-between text-xs">
                  <span className="text-ink-dim">{d.label}</span>
                  <span aria-label={d.passed ? "covered" : "missing"}>{d.passed ? "✓" : "✗"}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-faint">{score.improvedVs}</p>
          </GlassCard>
          {(score.total >= 80 || showStrong) && (
            <p className="mt-3 rounded-xl border border-mint-400/30 bg-mint-400/10 p-3 text-sm text-mint-200">
              That&apos;s the whole trick: audience + format + length + specifics + verification. You did it by hand — now do it by instinct.
            </p>
          )}
          {score.total >= 80 && <MarkDone onDone={onComplete} />}
        </div>
      </div>
    </div>
  );
}

function MarkDone({ onDone }: { onDone?: () => void }) {
  const [clicked, setClicked] = useState(false);
  return (
    <Button
      className="mt-3 w-full"
      variant="success"
      onClick={() => { setClicked(true); onDone?.(); }}
      disabled={clicked}
    >
      {clicked ? "Recorded ✓" : "I got it to 80+ — mark this step"}
    </Button>
  );
}
