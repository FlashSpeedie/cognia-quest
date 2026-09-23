"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRIVACY_SCENARIOS } from "@/content/privacy";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";

export function PrivacyChallenge() {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<null | {
    correct: boolean;
    perfect: boolean;
    reasons: { label: string; needed: boolean; picked: boolean; reason: string }[];
  }>(null);
  const [doneScenarios, setDoneScenarios] = useState(0);
  const { push } = useToast();
  const router = useRouter();

  const s = PRIVACY_SCENARIOS[idx]!;
  const total = PRIVACY_SCENARIOS.length;

  async function submit() {
    try {
      const res = await fetch("/api/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: s.id, dataIds: [...chosen] }),
      });
      const d = (await res.json()) as {
        correct: boolean; perfect: boolean;
        reasons: { label: string; needed: boolean; picked: boolean; reason: string }[];
        xp?: { awarded: number }; badges?: string[];
      };
      setResult(d);
      if (d.perfect) push({ kind: "success", title: "Minimal data, maximum sense", body: "Perfect data minimization." });
      if (d.xp && d.xp.awarded > 0) push({ kind: "xp", title: `+${d.xp.awarded} XP` });
      for (const b of d.badges ?? []) push({ kind: "badge", title: `Badge unlocked: ${b}` });
      setDoneScenarios((n) => n + 1);
      router.refresh();
    } catch {
      push({ kind: "error", title: "Couldn't submit", body: "Network issue - selection kept, try again." });
    }
  }

  function next() {
    setIdx((i) => (i + 1) % total);
    setChosen(new Set());
    setResult(null);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-5 max-w-md">
        <ProgressBar value={doneScenarios} max={total} label={`Scenario ${idx + 1} of ${total}`} />
      </div>
      <GlassCard className="border-amber-400/25 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Chip tone="amber" className="font-mono uppercase tracking-widest">{s.app}</Chip>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">policy check</span>
        </div>
        <h3 className="mt-2 font-display text-xl font-bold text-ink">{s.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">{s.context}</p>
      </GlassCard>

      <GlassCard className="mt-4 p-5">
        <p className="text-sm font-semibold text-ink">It asks for the following. What is <em>actually necessary</em>?</p>
        <div className="mt-3 space-y-2" role="group" aria-label="Data requests">
              {s.dataRequests.map((d) => {
            const on = chosen.has(d.id);
            const showVerdict = result !== null;
            return (
              <label
                key={d.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-pulse-400 ${
                  showVerdict
                    ? d.needed && on
                      ? "border-mint-400/50 bg-mint-400/5"
                      : d.needed && !on
                        ? "border-amber-400/40 bg-amber-400/5"
                        : !d.needed && on
                          ? "border-rose-400/50 bg-rose-400/5"
                          : "border-void-700/60"
                    : on
                      ? "border-pulse-400 bg-pulse-400/10"
                      : "border-void-700 hover:border-pulse-400/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  disabled={!!result}
                  onChange={() =>
                    setChosen((c) => {
                      const next = new Set(c);
                      if (next.has(d.id)) next.delete(d.id);
                      else next.add(d.id);
                      return next;
                    })
                  }
                  className="mt-0.5 h-4 w-4 accent-pulse-500"
                />
                <span className="flex-1">
                  <span className="text-sm text-ink">{d.label}</span>
                  {showVerdict && (
                    <span className="mt-1 block text-xs text-ink-dim">
                      <span className={`mr-1 font-bold ${d.needed ? "text-mint-700 dark:text-mint-300" : "text-rose-400"}`}>
                        {d.needed ? "needed." : "not needed."}
                      </span>
                      {result.reasons.find((x) => x.label === d.label)?.reason}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3">
          {!result ? (
            <Button onClick={submit} disabled={chosen.size === 0}>Decide</Button>
          ) : (
            <>
              <Chip tone={result.perfect ? "mint" : result.correct ? "amber" : "rose"}>
                {result.perfect ? "perfect minimization" : result.correct ? "close - some gaps" : "review the reasons"}
              </Chip>
              <Button variant="secondary" onClick={next}>Next scenario</Button>
            </>
          )}
        </div>
        {result && (
          <p className="mt-3 border-l-2 border-pulse-400/40 pl-3 text-xs text-ink-dim">{s.principle}</p>
        )}
      </GlassCard>
    </div>
  );
}
