"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { scorePrompt, type PromptScore } from "@/server/services/promptScore";
import { Button } from "@/components/ui/Button";
import { GlassCard, Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { fireLevelUp } from "@/components/app/LevelUpModal";

/**
 * Shared prompt editor + rubric display.
 * Live preview is computed client-side (instant, free); submitting posts to
 * the server, which re-scores and records XP/attempts authoritatively.
 */
export function PromptLabClient({ taskId, task }: { taskId: string; task?: string }) {
  const [prompt, setPrompt] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(`aq-draft:${taskId}`) ?? "";
    } catch {
      return "";
    }
  });
  const [submitted, setSubmitted] = useState<PromptScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coach, setCoach] = useState<{ text: string } | { unavailable: string } | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const live = useMemo(() => scorePrompt(prompt), [prompt]);

  // Draft autosave on this device (spec §51)
  useMemo(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`aq-draft:${taskId}`, prompt);
    } catch {
      /* storage full/blocked: ignore */
    }
  }, [prompt, taskId]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prompt/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, taskId }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Submission failed");
        return;
      }
      const data = (await res.json()) as {
        score: PromptScore;
        xp?: { awarded: number; leveledUp: { to: string; level: number } | null };
        badges?: string[];
      };
      setSubmitted(data.score);
      if (data.xp && data.xp.awarded > 0) push({ kind: "xp", title: `+${data.xp.awarded} XP`, body: `Prompt score ${data.score.total}` });
      if (data.xp?.leveledUp) fireLevelUp({ to: data.xp.leveledUp.to, level: data.xp.leveledUp.level });
      for (const b of data.badges ?? []) push({ kind: "badge", title: `Badge unlocked: ${b}` });
      router.refresh();
    } catch {
      setError("Network error — your prompt is still in the editor.");
    } finally {
      setLoading(false);
    }
  }

  const display = submitted ?? live;

  /** Optional AI coaching layer. The score stays the deterministic rubric. */
  async function askCoach() {
    setCoachLoading(true);
    setCoach(null);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, taskId }),
      });
      const data = (await res.json()) as { feedback?: string; error?: string };
      if (!res.ok) {
        setCoach({ unavailable: data.error ?? "Coach unavailable right now." });
      } else if (data.feedback) {
        setCoach({ text: data.feedback });
      }
    } catch {
      setCoach({ unavailable: "Network error — check your connection." });
    } finally {
      setCoachLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {task && (
          <Card className="border-amber-400/30 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">Task</p>
            <p className="mt-1 font-display font-bold text-ink">{task}</p>
          </Card>
        )}
        <GlassCard className="p-5">
          <label htmlFor="prompt-editor" className="text-sm font-semibold text-ink">
            Prompt editor
          </label>
          <textarea
            id="prompt-editor"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 4000))}
            rows={9}
            placeholder="Ask for anything — then make it impossible to misunderstand. (Drafts are auto-saved on this device.)"
            className="mt-2 w-full rounded-xl border border-void-700 bg-void-900 p-3 font-mono text-sm leading-relaxed text-ink placeholder:text-ink-faint focus-ring"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-ink-faint">
            <span>{prompt.length}/4000</span>
            <span>live score = draft preview · submit to bank XP</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={submit} loading={loading} disabled={prompt.trim().length < 2}>
              Analyze &amp; submit
            </Button>
            <Button variant="secondary" onClick={askCoach} loading={coachLoading} disabled={prompt.trim().length < 10}>
              AI coach feedback
            </Button>
            <Button variant="ghost" onClick={() => { setPrompt(""); setSubmitted(null); setCoach(null); }}>
              Clear
            </Button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-rose-400">{error}</p>}
          {coach && (
            <div className="mt-3 rounded-xl border border-volt-400/30 bg-volt-400/5 p-4" role="status">
              <p className="font-mono text-[10px] uppercase tracking-widest text-volt-300">AI coach (advisory — the rubric is the score)</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {"text" in coach ? coach.text : coach.unavailable}
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      <div>
        <GlassCard className={`p-5 transition-colors ${display.total >= 80 ? "border-mint-400/40" : display.total >= 50 ? "border-amber-400/30" : "border-void-700"}`}>
          <div className="flex items-center justify-between">
            <Chip tone={display.total >= 80 ? "mint" : display.total >= 50 ? "amber" : "neutral"}>
              {submitted ? "official score" : "live preview"}
            </Chip>
            <span className="font-display text-4xl font-black text-ink">{display.total}</span>
          </div>
          <ProgressBar value={display.total} label="PROMPT SCORE (educational heuristic)" className="mt-3" tone={display.total >= 80 ? "mint" : display.total >= 50 ? "amber" : "pulse"} />
          <ul className="mt-4 space-y-2">
            {display.dimensions.map((d) => (
              <li key={d.key} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-ink-dim">
                  <span aria-hidden="true" className={d.passed ? "text-mint-400" : "text-rose-400"}>
                    {d.passed ? "✓" : "✗"}
                  </span>
                  {d.label}
                </span>
                {!d.passed && <span className="max-w-[55%] text-right text-[11px] text-ink-faint">{d.tip}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-void-700/60 pt-3 text-sm text-pulse-300">
            <Icon name="spark" size={14} className="mr-1 inline" /> {display.improvedVs ?? "Write something to analyze."}
          </p>
          {display.total >= 80 && submitted && (
            <p className="mt-3 rounded-xl border border-mint-400/30 bg-mint-400/10 p-3 text-sm font-semibold text-mint-300">
              80+ club. Mission objective satisfied if you&apos;re on Mission 04.
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
