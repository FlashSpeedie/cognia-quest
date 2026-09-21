"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EthicsCase } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";

export function EthicsCourt({ caseData }: { caseData: EthicsCase }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<null | {
    coverage: number;
    breakdown: { importantSelected: string[]; importantMissed: string[]; distractorsPicked: string[] };
  }>(null);
  const [submitting, setSubmitting] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  function toggle(id: string) {
    if (result) return;
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/ethics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: caseData.id, factors: [...selected] }),
      });
      const d = (await res.json()) as {
        coverage: number;
        breakdown: { importantSelected: string[]; importantMissed: string[]; distractorsPicked: string[] };
        xp?: { awarded: number };
        badges?: string[];
      };
      setResult(d);
      if (d.coverage >= 60 && d.xp && d.xp.awarded > 0) {
        push({ kind: "xp", title: `+${d.xp.awarded} XP`, body: `Ethics review: ${d.coverage}% coverage` });
      }
      for (const b of d.badges ?? []) push({ kind: "badge", title: `Badge unlocked: ${b}` });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* briefing */}
      <div className="space-y-4 lg:col-span-2">
        <GlassCard className="border-amber-400/30 p-5">
          <Chip tone="amber" className="font-mono uppercase tracking-widest">On the docket</Chip>
          <h3 className="mt-2 font-display text-xl font-bold text-ink">{caseData.title}</h3>
          <p className="font-mono text-[11px] text-ink-faint">{caseData.setting}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">{caseData.scenario}</p>
        </GlassCard>
        <div className="grid gap-3">
          <GlassCard className="border-mint-400/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-mint-300">Proposed benefits</p>
            <ul className="mt-2 space-y-1 text-sm text-ink-dim">
              {caseData.benefits.map((b) => <li key={b}>+ {b}</li>)}
            </ul>
          </GlassCard>
          <GlassCard className="border-rose-400/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-rose-300">Known risks</p>
            <ul className="mt-2 space-y-1 text-sm text-ink-dim">
              {caseData.risks.map((r) => <li key={r}>− {r}</li>)}
            </ul>
          </GlassCard>
        </div>
      </div>

      {/* questions panel */}
      <div className="lg:col-span-3">
        <GlassCard className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Your job</p>
          <p className="mt-1 text-sm text-ink">
            Before deployment, <strong>which questions must the school answer?</strong> Select every question that genuinely matters.
            Your score is the coverage of the essentials — grabbing irrelevant ones costs points.
          </p>
          <div className="mt-4 space-y-2">
            {caseData.factors.map((f) => {
              const on = selected.has(f.id);
              const reveal = result && f.important !== on;
              return (
                <button
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  aria-pressed={on}
                  className={`w-full rounded-xl border p-3.5 text-left text-sm transition-colors focus-ring ${
                    result
                      ? result.breakdown.importantSelected.includes(f.label)
                        ? "border-mint-400/50 bg-mint-400/10"
                        : result.breakdown.importantMissed.includes(f.label)
                          ? "border-rose-400/50 bg-rose-400/10"
                          : result.breakdown.distractorsPicked.includes(f.label)
                            ? "border-amber-400/40 bg-amber-400/10"
                            : "border-void-700/60"
                      : on
                        ? "border-pulse-400 bg-pulse-400/10"
                        : "border-void-700 hover:border-pulse-400/40"
                  }`}
                >
                  <span className={reveal ? "text-ink" : "text-ink"}>{f.label}</span>
                  {result && (
                    <span className="mt-1 block text-xs text-ink-dim">{f.explanation}</span>
                  )}
                </button>
              );
            })}
          </div>
          {!result ? (
            <Button className="mt-5" size="lg" onClick={submit} loading={submitting} disabled={selected.size === 0}>
              Submit review ({selected.size} selected)
            </Button>
          ) : (
            <div className="mt-5 rounded-2xl border border-mint-400/30 bg-mint-400/5 p-5" aria-live="polite">
              <div className="flex flex-wrap items-center gap-5">
                <ProgressRing value={result.coverage} label="Ethics review coverage" size={88} />
                <div>
                  <p className="font-display text-lg font-bold text-ink">ETHICS REVIEW COMPLETE</p>
                  <p className="mt-1 text-sm text-ink-dim">
                    {result.coverage >= 75
                      ? "Strong analysis — you covered the core concerns."
                      : result.coverage >= 60
                        ? "Solid pass. See what you missed above."
                        : "Partial coverage — the pink cards above are questions you should have raised."}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-ink-dim">{caseData.debrief}</p>
              <Button variant="ghost" className="mt-3" onClick={() => { setResult(null); setSelected(new Set()); }}>
                Review again
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
