"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOOL_SCENARIOS } from "@/content/prompts";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";

export function ToolSelector() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; why: string; risks: string; verify: string } | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const { push } = useToast();
  const router = useRouter();
  const s = TOOL_SCENARIOS[idx]!;
  const allDone = doneCount >= TOOL_SCENARIOS.length;

  async function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    try {
      const res = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: s.id, choice: i }),
      });
      const d = (await res.json()) as { correct: boolean; why: string; risks: string; verify: string; xp?: { awarded: number } };
      setFeedback({ correct: d.correct, why: d.why, risks: d.risks, verify: d.verify });
      setDoneCount((n) => n + 1);
      if (d.correct) {
        setCorrectCount((n) => n + 1);
        if (d.xp && d.xp.awarded > 0) push({ kind: "xp", title: `+${d.xp.awarded} XP` });
      }
      router.refresh();
    } catch {
      setFeedback({ correct: i === s.correct, why: s.why, risks: s.risks, verify: s.verify });
      setDoneCount((n) => n + 1);
    }
  }

  function next() {
    setIdx((i) => (i + 1) % TOOL_SCENARIOS.length);
    setPicked(null);
    setFeedback(null);
  }

  return (
    <div>
      <div className="mb-5 max-w-md">
        <ProgressBar value={doneCount} max={TOOL_SCENARIOS.length} label={`Scenario ${Math.min(idx + 1, TOOL_SCENARIOS.length)} of ${TOOL_SCENARIOS.length}`} showValue={false} />
      </div>

      {allDone ? (
        <GlassCard glow className="p-8 text-center">
          <p className="font-display text-2xl font-bold text-ink">Tool judgment: trained.</p>
          <p className="mt-2 text-sm text-ink-dim">
            You scored {correctCount}/{TOOL_SCENARIOS.length}. The meta-skill: the right tool is the simplest one that is honest about the job.
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <Chip tone="pulse" className="font-mono uppercase tracking-widest">Scenario</Chip>
          <p className="mt-3 text-lg font-medium text-ink">{s.scenario}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Choose a tool">
            {s.options.map((o, i) => {
              let cls = "border-void-700 text-ink hover:border-pulse-400/50";
              if (feedback) {
                if (i === s.correct) cls = "border-mint-400/60 bg-mint-400/10 text-mint-200";
                else if (picked === i) cls = "border-rose-400/60 bg-rose-400/10 text-rose-300";
                else cls = "border-void-700 text-ink-faint";
              }
              return (
                <button
                  key={o}
                  role="radio"
                  aria-checked={picked === i}
                  onClick={() => choose(i)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors focus-ring ${cls}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {feedback && (
            <div className="mt-5 space-y-2 rounded-xl border border-void-700 bg-void-900/60 p-4 text-sm">
              <p className="text-ink"><span className="font-bold text-mint-300">Why it fits:</span> {feedback.why}</p>
              <p className="text-ink"><span className="font-bold text-amber-300">Watch out:</span> {feedback.risks}</p>
              <p className="text-ink"><span className="font-bold text-pulse-300">Verify:</span> {feedback.verify}</p>
              <Button className="mt-2" size="sm" onClick={next}>Next scenario</Button>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
