"use client";

import { useMemo, useState } from "react";
import type { PublicAcademyQuestion } from "@/lib/academy";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { ChoiceGroup, OrderGroup, MatchGroup } from "./QuestionControls";
import { useLessonProgress, SignInToSaveNotice } from "./LessonProgressContext";

/**
 * Shared quiz/test runner for the Academy.
 *
 * - Questions arrive WITHOUT answers (server strips correct/explanation);
 *   graded feedback comes only from the POST /api/academy/quiz response.
 * - Lesson mode: score, best-score tracking, retry, and progress marking.
 * - Module-test mode: adds the pass threshold verdict, missed-topic review
 *   and the module completion state.
 * - Guest mode: full graded feedback, honest notice that nothing was saved.
 */

interface XPPayload {
  awarded: number;
  total: number;
  duplicate: boolean;
  leveledUp: { to: string; level: number } | null;
}

interface QuizResponse {
  ok: boolean;
  guest?: boolean;
  score: number;
  total: number;
  pct: number;
  explanations: { qId: string; correct: number[]; explanation: string; right: boolean }[];
  quizBest?: number | null;
  attempts?: number;
  xp?: XPPayload | null;
  lessonXp?: XPPayload | null;
  badges?: { id: string; title: string; icon: string }[];
  passed?: boolean;
  bestScore?: number;
  firstPass?: boolean;
  masteryPct?: number;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Warm-up",
  conceptual: "Concept",
  application: "Apply it",
  reasoning: "Reason it out",
};

/** quizId "quiz-m1-l3" -> lessonId "m1-l3" (quiz ids follow this one convention). */
function lessonIdFromQuiz(quizId: string): string {
  return quizId.startsWith("quiz-") ? quizId.slice(5) : quizId;
}

export function QuizRunner({
  quizId,
  questions,
  signedIn,
  mode,
  initialBest,
  initialAttempts,
  passThreshold,
  masteryThresholdPct,
}: {
  quizId: string;
  questions: PublicAcademyQuestion[];
  signedIn: boolean;
  mode: "lesson" | "module-test";
  initialBest?: number | null;
  initialAttempts?: number;
  passThreshold?: number;
  masteryThresholdPct?: number;
}) {
  const { syncLocal, setQuizBest, reportLessonXp } = useLessonProgress();
  const { push } = useToast();

  // Per-question answer state, keyed by question index.
  const [choice, setChoice] = useState<Record<number, number[]>>({});
  const [orders, setOrders] = useState<Record<number, number[]>>({});
  const [picks, setPicks] = useState<Record<number, number[]>>({});
  const [result, setResult] = useState<QuizResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [best, setBest] = useState<number | null>(initialBest ?? null);
  const [attempts, setAttempts] = useState(initialAttempts ?? 0);

  const answeredAll = useMemo(
    () =>
      questions.every((q, qi) => {
        switch (q.kind) {
          case "mcq":
          case "multi":
            return (choice[qi] ?? []).length > 0;
          case "order":
            return (orders[qi] ?? []).length === q.items.length;
          case "match":
            return (picks[qi] ?? q.left.map(() => -1)).every((p) => p >= 0);
        }
      }),
    [questions, choice, orders, picks],
  );

  function setAnswer(qi: number, kind: PublicAcademyQuestion["kind"], value: number[]) {
    if (result) return; // locked after submit
    if (kind === "mcq" || kind === "multi") setChoice((c) => ({ ...c, [qi]: value }));
    else if (kind === "order") setOrders((o) => ({ ...o, [qi]: value }));
    else setPicks((p) => ({ ...p, [qi]: value }));
  }

  function payload(): number[][] {
    return questions.map((q, qi) => {
      switch (q.kind) {
        case "mcq":
        case "multi":
          return choice[qi] ?? [];
        case "order":
          return orders[qi] ?? q.items.map((_, i) => i);
        case "match":
          return picks[qi] ?? q.left.map(() => -1);
      }
    });
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers: payload() }),
      });
      const data = (await res.json()) as QuizResponse & { error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong saving your attempt.");
        return;
      }
      setResult(data);
      if (typeof data.quizBest === "number") setBest(data.quizBest);
      else if (!data.guest) setBest((b) => Math.max(b ?? 0, data.pct));
      if (typeof data.attempts === "number") setAttempts(data.attempts);
      if (!data.guest) setQuizBest(Math.max(best ?? 0, data.pct));

      if (!data.guest) {
        if (data.xp && data.xp.awarded > 0) {
          push({
            kind: "xp",
            title: `+${data.xp.awarded} XP`,
            body: mode === "lesson" ? `Quiz scored ${data.score}/${data.total}` : `Module test: ${data.pct}%`,
          });
        }
        if (data.lessonXp && data.lessonXp.awarded > 0) {
          reportLessonXp(data.lessonXp);
        }
        const xp = data.xp ?? data.lessonXp;
        if (xp?.leveledUp) {
          push({ kind: "success", title: "Level up!", body: `You're now ${xp.leveledUp.to} (Level ${xp.leveledUp.level}).` });
        }
        for (const b of data.badges ?? []) {
          push({ kind: "badge", title: `Badge unlocked: ${b.title}`, body: "See it in your trophy room." });
        }
        // The server persisted the quiz step (when score >= 50%); sync the bar.
        if (mode === "lesson" && data.pct >= 50) syncLocal(`${lessonIdFromQuiz(quizId)}-quiz`);
      }
    } catch {
      setError("Network hiccup - your answers weren't submitted. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setResult(null);
    setChoice({});
    setOrders({});
    setPicks({});
  }

  const missedTopics = result
    ? questions
        .filter((q) => !result.explanations?.find((e) => e.qId === q.id)?.right)
        .map((q) => q.concept)
    : [];

  return (
    <div>
      {/* Questions */}
      <ol className="space-y-4">
        {questions.map((q, qi) => {
          const exp = result?.explanations?.find((e) => e.qId === q.id);
          return (
            <li key={q.id} id={`q-${q.id}`} className="rounded-xl border border-void-700/70 bg-void-900 px-5 py-5 shadow-card">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs font-bold text-ink-faint">
                  {String(qi + 1).padStart(2, "0")}
                </span>
                <span className="rounded-md border border-void-700 bg-void-850 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {DIFFICULTY_LABEL[q.difficulty] ?? q.difficulty}
                </span>
                {result && (
                  <span
                    className={`text-[11px] font-bold ${
                      exp?.right ? "text-mint-700 dark:text-mint-300" : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {exp?.right ? "Correct" : "Missed"}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[15px] font-semibold leading-snug text-ink">
                {q.prompt}
                {q.kind === "multi" && (
                  <span className="ml-2 text-xs font-normal text-ink-faint">(select all that apply)</span>
                )}
              </p>

              {(q.kind === "mcq" || q.kind === "multi") && (
                <ChoiceGroup
                  label={q.prompt}
                  options={q.options}
                  selected={choice[qi] ?? []}
                  onSelect={(v) => setAnswer(qi, q.kind, v)}
                  multi={q.kind === "multi"}
                  disabled={!!result}
                  reveal={exp ? { correct: exp.correct } : null}
                />
              )}
              {q.kind === "order" && (
                <OrderGroup
                  label={q.prompt}
                  items={q.items}
                  arrangement={orders[qi] ?? q.items.map((_, i) => i)}
                  onArrange={(next) => setAnswer(qi, "order", next)}
                  disabled={!!result}
                  revealCorrect={exp ? exp.correct : null}
                />
              )}
              {q.kind === "match" && (
                <MatchGroup
                  label={q.prompt}
                  left={q.left}
                  right={q.right}
                  picks={picks[qi] ?? q.left.map(() => -1)}
                  onPick={(li, ri) => {
                    const base = picks[qi] ?? q.left.map(() => -1);
                    const next = [...base];
                    next[li] = ri;
                    setAnswer(qi, "match", next);
                  }}
                  disabled={!!result}
                  revealCorrect={exp ? exp.correct : null}
                />
              )}

              {exp && (
                <div
                  className={`mt-4 rounded-lg border p-3.5 text-sm leading-relaxed ${
                    exp.right ? "border-mint-400/30 bg-mint-400/5" : "border-amber-400/30 bg-amber-400/5"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      exp.right ? "text-mint-700 dark:text-mint-300" : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {exp.right ? "✓ " : "Review this: "}
                  </span>
                  <span className="text-ink-dim">{exp.explanation}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-400/50 bg-rose-400/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}{" "}
          <button type="button" onClick={() => setError(null)} className="font-semibold underline">
            dismiss
          </button>
        </p>
      )}

      {/* Pre-submit */}
      {!result && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={!answeredAll} loading={submitting} size="lg">
            Submit {mode === "lesson" ? "quiz" : "test"}
          </Button>
          {!answeredAll && (
            <span className="text-xs text-ink-faint">Answer every question to submit.</span>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div aria-live="polite" className="mt-5">
          {mode === "module-test" ? (
            <ModuleTestResult
              result={result}
              passThreshold={passThreshold ?? 80}
              missedTopics={missedTopics}
              signedIn={signedIn}
              best={best}
              attempts={attempts}
              masteryThresholdPct={masteryThresholdPct}
              onRetry={retry}
            />
          ) : (
            <LessonQuizResult
              result={result}
              signedIn={signedIn}
              best={best}
              attempts={attempts}
              onRetry={retry}
            />
          )}
        </div>
      )}

      {!signedIn && !result && (
        <div className="mt-4">
          <SignInToSaveNotice body="You're browsing as a guest - sign in to record scores and earn XP when you submit." />
        </div>
      )}

      {/* Lesson quiz counts for lesson completion when signed in. */}
      {mode === "lesson" && signedIn && result && !result.guest && best !== null && best >= 50 && (
        <p className="sr-only" aria-live="polite">
          Quiz submitted. Best score {best} percent.
        </p>
      )}
    </div>
  );
}

function LessonQuizResult({
  result,
  signedIn,
  best,
  attempts,
  onRetry,
}: {
  result: QuizResponse;
  signedIn: boolean;
  best: number | null;
  attempts: number;
  onRetry: () => void;
}) {
  const perfect = result.score === result.total;
  const pct = result.pct;
  return (
    <div className="rounded-xl border border-void-700/70 bg-void-900 p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        <div
          aria-hidden="true"
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            pct >= 80 ? "bg-mint-500/15 text-mint-600" : pct >= 50 ? "bg-pulse-500/15 text-pulse-600" : "bg-amber-500/15 text-amber-600"
          }`}
        >
          <Icon name={pct >= 50 ? "trophy" : "brain"} size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-ink">
            {result.score}/{result.total} correct —{" "}
            {perfect ? "flawless." : pct >= 80 ? "mastered." : pct >= 50 ? "passed." : "keep practicing."}
          </p>
          <p className="mt-0.5 text-sm text-ink-dim">
            {result.guest ? (
              <>Guest attempt — not saved. <a href="/login" className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300">Sign in</a> to record it.</>
            ) : (
              <>
                Best: <span className="font-semibold text-ink">{best}%</span>
                {attempts > 1 ? <> · {attempts} attempts</> : null}
                {result.xp && result.xp.awarded > 0 ? <> · +{result.xp.awarded} XP earned</> : null}
              </>
            )}
          </p>
        </div>
      </div>
      {!perfect && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
      {perfect && (
        <Button variant="ghost" size="sm" className="mt-4" onClick={onRetry}>
          Retake for practice
        </Button>
      )}
      {signedIn && pct < 80 && (
        <p className="mt-3 text-xs text-ink-faint">
          Score 80% or higher to mark this lesson as mastered. Retries never lower your best score.
        </p>
      )}
    </div>
  );
}

function ModuleTestResult({
  result,
  passThreshold,
  missedTopics,
  signedIn,
  best,
  attempts,
  masteryThresholdPct,
  onRetry,
}: {
  result: QuizResponse;
  passThreshold: number;
  missedTopics: string[];
  signedIn: boolean;
  best: number | null;
  attempts: number;
  masteryThresholdPct?: number;
  onRetry: () => void;
}) {
  const passed = result.pct >= passThreshold;
  return (
    <div
      className={`rounded-xl border p-6 shadow-card ${
        passed ? "border-mint-400/50 bg-mint-400/5" : "border-amber-400/50 bg-amber-400/5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div
          aria-hidden="true"
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            passed ? "bg-mint-500/15 text-mint-600" : "bg-amber-500/15 text-amber-600"
          }`}
        >
          <Icon name={passed ? "trophy" : "brain"} size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-bold text-ink">
            {passed ? "Module test passed." : "Not there yet — and that's fine."}
          </p>
          <p className="mt-1 text-sm text-ink-dim">
            {result.score}/{result.total} correct — {result.pct}%
            {!result.guest && typeof result.bestScore === "number" && (
              <>
                {" "}· best {result.bestScore}%
                {attempts > 1 ? ` · attempt ${attempts}` : ""}
              </>
            )}
            {" "}· pass mark {passThreshold}%
          </p>
        </div>
      </div>

      {result.guest ? (
        <div className="mt-4">
          <SignInToSaveNotice body="Guest attempts aren't recorded. Sign in to save your score, earn XP and unlock the module completion." />
        </div>
      ) : (
        <>
          {passed && result.firstPass && result.xp && result.xp.awarded > 0 && (
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-mint-400/40 bg-mint-400/10 px-4 py-3 text-sm font-semibold text-ink">
              <Icon name="bolt" size={15} className="text-amber-500" aria-hidden="true" />
              +{result.xp.awarded} XP earned for passing Module 1.
            </p>
          )}
          {passed && (
            <div className="mt-4 rounded-xl border border-void-700/70 bg-void-900 p-5">
              <p className="font-display text-lg font-bold text-ink">Module complete</p>
              <p className="mt-1 text-sm text-ink-dim">AI & Machine Learning Foundations</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Test score", `${result.pct}%`],
                  ["Best score", `${best ?? result.pct}%`],
                  ["Module mastery", `${result.masteryPct ?? 0}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-void-700/70 bg-void-850 px-3.5 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{label}</dt>
                    <dd className="mt-1 font-display text-xl font-bold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-ink-dim">
                Module mastery = 70% lesson mastery + 30% best test score.{" "}
                {masteryThresholdPct !== undefined && `Lessons reach "mastered" at ${masteryThresholdPct}% quiz scores.`}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/academy-new"
                  className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
                >
                  Back to the Academy
                  <Icon name="arrow-right" size={15} aria-hidden="true" />
                </a>
                <a
                  href="/academy-new/module/1"
                  className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-4 py-2.5 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
                >
                  Review the module
                </a>
                <a
                  href="/academy-new/references"
                  className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-4 py-2.5 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
                >
                  Sources & references
                </a>
                <Button variant="ghost" size="sm" onClick={onRetry}>
                  Retake for practice
                </Button>
              </div>
            </div>
          )}
          {!passed && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Retake the test
              </Button>
              <p className="text-sm text-ink-dim">
                Nothing is locked - only your best score counts toward mastery.
              </p>
            </div>
          )}
        </>
      )}

      {missedTopics.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">Topics to review</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {[...new Set(missedTopics)].map((t) => (
              <li
                key={t}
                className="rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300"
              >
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-faint">
            Each question above shows the full explanation — the topics listed here are where to focus.
          </p>
        </div>
      )}
    </div>
  );
}
