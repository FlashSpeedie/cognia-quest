"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Quiz } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { fireLevelUp } from "@/components/app/LevelUpModal";

interface QuizResult {
  score: number;
  total: number;
  explanations: { qId: string; correct: number[]; explanation: string; right: boolean }[];
  xp?: { awarded: number; total: number; leveledUp: { to: string; level: number } | null };
  badges?: string[];
}

export function QuizRunner({ quiz, lessonId }: { quiz: Quiz; lessonId?: string }) {
  const [answers, setAnswers] = useState<Record<number, Set<number>>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();
  const router = useRouter();

  const allAnswered = quiz.questions.every((q, i) => {
    const sel = answers[i];
    if (!sel || sel.size === 0) return false;
    return q.kind === "multi" ? true : sel.size === 1;
  });

  function toggle(qi: number, ci: number, multi: boolean) {
    if (result) return;
    setAnswers((a) => {
      const cur = new Set(a[qi] ?? []);
      if (multi) {
        if (cur.has(ci)) cur.delete(ci);
        else cur.add(ci);
      } else {
        cur.clear();
        cur.add(ci);
      }
      return { ...a, [qi]: cur };
    });
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          lessonId,
          answers: quiz.questions.map((_, i) => [...(answers[i] ?? [])]),
        }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Something went wrong saving your attempt.");
        return;
      }
      const data = (await res.json()) as QuizResult;
      setResult(data);
      if (data.xp && data.xp.awarded > 0) {
        push({ kind: "xp", title: `+${data.xp.awarded} XP`, body: `Quiz scored ${data.score}/${data.total}` });
      }
      if (data.xp?.leveledUp) {
        fireLevelUp({ to: data.xp.leveledUp.to, level: data.xp.leveledUp.level });
      }
      for (const b of data.badges ?? []) {
        push({ kind: "badge", title: `Badge unlocked: ${b}`, body: "See it in your trophy room." });
      }
      router.refresh();
    } catch {
      setError("Network hiccup. Your answers weren't saved - try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {quiz.questions.map((q, qi) => {
        const exp = result?.explanations[qi];
        return (
          <GlassCard key={q.id} className="mb-4 p-5">
            <p className="text-sm font-semibold text-ink">
              <span className="mr-2 font-mono text-ink-faint">{String(qi + 1).padStart(2, "0")}</span>
              {q.prompt}
              {q.kind === "multi" && <span className="ml-2 text-xs font-normal text-ink-faint">(select all that apply)</span>}
            </p>
            <div className="mt-3 grid gap-2" role={q.kind === "multi" ? "group" : "radiogroup"} aria-label={q.prompt}>
              {q.choices.map((c, ci) => {
                const selected = answers[qi]?.has(ci) ?? false;
                let cls = "border-void-700 text-ink-dim hover:border-pulse-400/40 hover:text-ink";
                if (selected && !result) cls = "border-pulse-400 bg-pulse-400/10 text-ink";
                if (result) {
                  const isCorrect = exp?.correct.includes(ci);
                  if (isCorrect) cls = "border-mint-400/60 bg-mint-400/10 text-mint-200";
                  else if (selected && !isCorrect) cls = "border-rose-400/60 bg-rose-400/10 text-rose-700 dark:text-rose-300";
                  else cls = "border-void-700/60 text-ink-faint";
                }
                return (
                  <button
                    key={ci}
                    role={q.kind === "multi" ? "checkbox" : "radio"}
                    aria-checked={selected}
                    onClick={() => toggle(qi, ci, q.kind === "multi")}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-all focus-ring ${cls}`}
                  >
                    <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-md border border-current text-[11px]">
                      {selected ? "●" : ""}
                    </span>
                    {c}
                  </button>
                );
              })}
            </div>
            {exp && (
              <div className={`mt-3 rounded-lg border p-3 text-xs leading-relaxed ${exp.right ? "border-mint-400/30 bg-mint-400/5 text-ink-dim" : "border-amber-400/30 bg-amber-400/5 text-ink-dim"}`}>
                <span className={`font-bold ${exp.right ? "text-mint-700 dark:text-mint-300" : "text-amber-600 dark:text-amber-300"}`}>
                  {exp.right ? "✓ Exactly." : "Not quite."}
                </span>{" "}
                {exp.explanation}
              </div>
            )}
          </GlassCard>
        );
      })}
      {error && (
        <p role="alert" className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error} <button onClick={() => setError(null)} className="underline">dismiss</button>
        </p>
      )}
      {!result ? (
        <Button onClick={submit} disabled={!allAnswered} loading={submitting} size="lg" className="w-full sm:w-auto">
          Submit answers
        </Button>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-mint-400/30 bg-mint-400/10 p-4">
          <Icon name="trophy" size={26} className="text-amber-400" />
          <div>
            <p className="font-display font-bold text-ink">
              {result.score}/{result.total} correct - {result.score === result.total ? "flawless." : result.score >= result.total / 2 ? "passed." : "retry whenever you're ready."}
            </p>
            {!result.score || result.score < result.total ? (
              <button
                className="mt-1 text-xs font-semibold text-pulse-700 dark:text-pulse-300 underline-offset-2 hover:underline focus-ring rounded"
                onClick={() => { setResult(null); setAnswers({}); }}
              >
                Try again
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
