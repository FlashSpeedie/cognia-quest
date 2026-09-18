"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FINAL_STAGES } from "@/content/final";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

type Answers = {
  "choose-data"?: string[];
  "spot-problem"?: number;
  "read-results"?: number;
  "prompt-write"?: string;
  "detect-issue"?: number;
  checklist?: string[];
  verdict?: number;
};

export function FinalChallenge({ previousTotal }: { previousTotal?: number }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ stageScores: Record<string, number>; totalScore: number } | null>(
    previousTotal != null ? { stageScores: {}, totalScore: previousTotal } : null,
  );
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();
  const router = useRouter();

  const stage = FINAL_STAGES[step];

  const stageValid = (): boolean => {
    const a = answers[stage!.id as keyof Answers];
    switch (stage!.kind) {
      case "multi-select":
      case "checklist":
        return Array.isArray(a) && a.length > 0;
      case "mcq":
      case "verdict":
        return typeof a === "number";
      case "prompt":
        return typeof a === "string" && a.trim().length >= 40;
    }
  };

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const d = (await res.json()) as { ok: boolean; result?: { stageScores: Record<string, number>; totalScore: number }; error?: string };
      if (!d.ok || !d.result) {
        setError(d.error ?? "Submission failed");
        return;
      }
      setResult(d.result);
      push({ kind: "xp", title: "+500 XP — FINAL COMPLETE", body: `Score: ${d.result.totalScore}%` });
      push({ kind: "badge", title: "🏗 AI Architect unlocked" });
    } catch {
      setError("Network error — your answers are still here. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const pct = result.totalScore;
    return (
      <GlassCard glow className="mx-auto max-w-2xl p-8 text-center">
        <span className="text-5xl" aria-hidden="true">🏆</span>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-amber-300">Final AI Quest complete</p>
        <h1 className="mt-3 font-display text-4xl font-black text-ink">{pct}% overall</h1>
        <div className="mx-auto mt-6 max-w-sm space-y-2 text-left">
          {FINAL_STAGES.map((s) => {
            const v = result.stageScores[s.id];
            return (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-void-700 px-3 py-2 text-sm">
                <span className="text-ink-dim">{s.title.replace(/^Stage \d+ — /, "")}</span>
                <span className={`font-mono font-bold ${v === undefined ? "text-ink" : v >= 70 ? "text-mint-300" : v >= 40 ? "text-amber-300" : "text-rose-400"}`}>
                  {v === undefined ? "—" : `${v}%`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-5 max-w-md text-sm text-ink-dim">
          These are learning indicators from your choices — not a standardized assessment. What they say: you can pick
          data responsibly, read model behavior critically, prompt deliberately, and deploy cautiously.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => router.push("/certificate")}>Claim certificate <Icon name="trophy" size={16} /></Button>
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
        </div>
      </GlassCard>
    );
  }

  if (!stage) return null;
  const a = answers[stage.id as keyof Answers];

  return (
    <div className="mx-auto max-w-2xl">
      {/* progress */}
      <div className="mb-6 flex items-center gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={FINAL_STAGES.length - 1} aria-label="Final challenge progress">
        {FINAL_STAGES.map((s, i) => (
          <div key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-gradient-to-r from-pulse-500 to-volt-500" : "bg-void-700"}`} />
        ))}
      </div>

      <GlassCard glow className="p-6 sm:p-8 animate-fade-up" key={stage.id}>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pulse-400">{stage.title}</p>
        <p className="mt-3 leading-relaxed text-ink">{stage.briefing}</p>

        <div className="mt-6">
          {stage.kind === "multi-select" && (
            <div className="space-y-2" role="group" aria-label="Select appropriate inputs">
              {stage.options.map((o) => {
                const cur = (a as string[] | undefined) ?? [];
                const on = cur.includes(o.id);
                return (
                  <button
                    key={o.id}
                    aria-pressed={on}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [stage.id]: on ? cur.filter((x) => x !== o.id) : [...cur, o.id],
                      }))
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-ring ${
                      on ? "border-pulse-400 bg-pulse-400/10 text-ink" : "border-void-700 text-ink-dim hover:text-ink"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {(stage.kind === "mcq" || stage.kind === "verdict") && (
            <div className="space-y-2" role="radiogroup">
              {stage.options.map((o, i) => {
                const label = typeof o === "string" ? o : o.label;
                const on = a === i;
                return (
                  <button
                    key={i}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setAnswers((prev) => ({ ...prev, [stage.id]: i }))}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-ring ${
                      on ? "border-pulse-400 bg-pulse-400/10 text-ink" : "border-void-700 text-ink-dim hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {stage.kind === "prompt" && (
            <div>
              <label htmlFor="final-prompt" className="text-sm font-medium text-ink">Your prompt</label>
              <textarea
                id="final-prompt"
                rows={7}
                value={(a as string | undefined) ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [stage.id]: e.target.value }))}
                placeholder="Write the exact instructions the system should follow when explaining a flag to a teacher…"
                className="mt-2 w-full rounded-xl border border-void-700 bg-void-900 p-3 font-mono text-sm text-ink placeholder:text-ink-faint focus-ring"
              />
              <p className="mt-1 text-xs text-ink-faint">Scored by the same 8-dimension rubric from the Prompt Lab.</p>
            </div>
          )}

          {stage.kind === "checklist" && (
            <div className="space-y-2" role="group" aria-label="Deployment checklist">
              {stage.items.map((it) => {
                const cur = (a as string[] | undefined) ?? [];
                const on = cur.includes(it.id);
                return (
                  <button
                    key={it.id}
                    aria-pressed={on}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [stage.id]: on ? cur.filter((x) => x !== it.id) : [...cur, it.id],
                      }))
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-ring ${
                      on ? "border-mint-400/60 bg-mint-400/10 text-ink" : "border-void-700 text-ink-dim hover:text-ink"
                    }`}
                  >
                    {it.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-void-700/60 pt-5">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
          <span className="font-mono text-xs text-ink-faint">Stage {step + 1}/{FINAL_STAGES.length}</span>
          {step < FINAL_STAGES.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!stageValid()}>
              Next <Icon name="arrow-right" size={16} />
            </Button>
          ) : (
            <Button onClick={submit} disabled={!stageValid()} loading={submitting} variant="success">
              Submit final report
            </Button>
          )}
        </div>
        {error && <p role="alert" className="mt-3 rounded-lg border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}
        {stage.kind === "prompt" && a && String(a).trim().length > 0 && String(a).trim().length < 40 && (
          <p className="mt-2 text-xs text-amber-300">Write a bit more — strong system prompts are rarely one-liners.</p>
        )}
      </GlassCard>

      <p className="mt-4 text-center text-xs text-ink-faint">
        One submission. Take your time — the point is the reasoning, not the score.
      </p>
    </div>
  );
}
