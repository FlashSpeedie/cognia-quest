"use client";

import { useMemo, useState } from "react";
import type { FreeResponseDef } from "@/content/academy/types";
import type { PublicAcademyQuestion } from "@/lib/academy";
import { lessonQuizStepId } from "@/lib/academy";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { ChoiceGroup, OrderGroup, MatchGroup } from "./QuestionControls";
import { FreeResponseItem } from "./FreeResponseItem";
import { CompletionPanel } from "./CompletionPanel";
import { useLessonProgress, SignInToSaveNotice } from "./LessonProgressContext";

/**
 * The sequential Lesson Quiz (Step 4 of 4): ten questions, one at a time.
 *
 *   Questions 1-6   auto-graded (MCQ / multi / order / match), submitted
 *                  together to the server, which grades and explains.
 *   Questions 7-10 written-reasoning FRQs, each submitted for rubric
 *                  feedback as the student goes.
 *
 * Passing (80%+) on the auto-graded half plus every FRQ completes the
 * lesson and unlocks the next one. Retakes never lower the best score and
 * never re-award completion XP. The module test keeps its own runner.
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
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Warm-up",
  conceptual: "Concept",
  application: "Apply it",
  reasoning: "Reason it out",
};

type Phase = "intro" | "auto" | "auto-result" | "written";

export function LessonQuizFlow({
  lessonId,
  lessonSlug,
  quizId,
  quizTitle,
  questions,
  freeResponses,
  signedIn,
  initialBest,
  initialAttempts,
  masteryThresholdPct,
  alreadyBanked,
  nextHref,
  nextLessonTitle,
}: {
  lessonId: string;
  lessonSlug: string;
  quizId: string;
  quizTitle: string;
  questions: PublicAcademyQuestion[];
  freeResponses: FreeResponseDef[];
  signedIn: boolean;
  initialBest: number | null;
  initialAttempts: number;
  masteryThresholdPct: number;
  alreadyBanked: boolean;
  nextHref: string | null;
  nextLessonTitle: string | null;
}) {
  const { isDone, syncLocal, setQuizBest, reportLessonXp, completed, quizBest } = useLessonProgress();
  const { push } = useToast();

  const total = questions.length + freeResponses.length; // 10

  const [practice, setPractice] = useState(false);
  const [phase, setPhase] = useState<Phase>(() => {
    const passedInitially = (initialBest ?? 0) >= masteryThresholdPct;
    if (passedInitially) return "written";
    return "intro";
  });
  const [qi, setQi] = useState(0);
  const [wi, setWi] = useState(() => {
    const firstUndone = freeResponses.findIndex((f) => !isDone(f.id));
    return firstUndone === -1 ? 0 : firstUndone;
  });
  const [choice, setChoice] = useState<Record<number, number[]>>({});
  const [orders, setOrders] = useState<Record<number, number[]>>({});
  const [picks, setPicks] = useState<Record<number, number[]>>({});
  const [result, setResult] = useState<QuizResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [showReview, setShowReview] = useState(false);

  const answeredAll = useMemo(
    () =>
      questions.every((q, i) => {
        switch (q.kind) {
          case "mcq":
          case "multi":
            return (choice[i] ?? []).length > 0;
          case "order":
            return (orders[i] ?? []).length === q.items.length;
          case "match":
            return (picks[i] ?? q.left.map(() => -1)).every((p) => p >= 0);
        }
      }),
    [questions, choice, orders, picks],
  );

  function setAnswer(i: number, kind: PublicAcademyQuestion["kind"], value: number[]) {
    if (result) return; // locked after submit
    if (kind === "mcq" || kind === "multi") setChoice((c) => ({ ...c, [i]: value }));
    else if (kind === "order") setOrders((o) => ({ ...o, [i]: value }));
    else setPicks((p) => ({ ...p, [i]: value }));
  }

  function payload(): number[][] {
    return questions.map((q, i) => {
      switch (q.kind) {
        case "mcq":
        case "multi":
          return choice[i] ?? [];
        case "order":
          return orders[i] ?? q.items.map((_, k) => k);
        case "match":
          return picks[i] ?? q.left.map(() => -1);
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
      setShowReview(false);
      if (typeof data.quizBest === "number") setQuizBest(data.quizBest);
      else if (!data.guest) setQuizBest(data.pct);
      if (typeof data.attempts === "number") setAttempts(data.attempts);
      if (!data.guest) {
        if (data.xp && data.xp.awarded > 0) {
          push({
            kind: "xp",
            title: `+${data.xp.awarded} XP`,
            body: `Quiz scored ${data.score}/${data.total}`,
          });
        }
        if (data.lessonXp && data.lessonXp.awarded > 0) reportLessonXp(data.lessonXp);
        const xp = data.xp ?? data.lessonXp;
        if (xp?.leveledUp) {
          push({ kind: "success", title: "Level up!", body: `You're now ${xp.leveledUp.to} (Level ${xp.leveledUp.level}).` });
        }
        for (const b of data.badges ?? []) {
          push({ kind: "badge", title: `Badge unlocked: ${b.title}`, body: "See it in your trophy room." });
        }
        // The server persisted the quiz step when the attempt passed.
        if (data.pct >= masteryThresholdPct) syncLocal(lessonQuizStepId(lessonId));
      }
      setPhase("auto-result");
    } catch {
      setError("Network hiccup - your answers weren't submitted. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setResult(null);
    setChoice({});
    setOrders({});
    setPicks({});
    setQi(0);
    setShowReview(false);
    setPhase("auto");
  }

  // ── Lesson finished: the pass screen (kept above the written phase so the
  // last answer's feedback is never snatched away mid-read). Practice mode
  // re-enters the flow from the top. ──
  const showCompletion = completed && !practice;
  const completionBlock = showCompletion ? (
    <div className="mb-6" data-completion-block>
      <CompletionPanel
        nextHref={nextHref}
        nextLessonTitle={nextLessonTitle}
        alreadyBanked={alreadyBanked}
        attemptCount={attempts}
      />
      <Button variant="ghost" size="sm" className="mt-4" onClick={() => { setPractice(true); restart(); }}>
        Retake the quiz for practice
      </Button>
    </div>
  ) : null;
  if (showCompletion && phase !== "written") {
    return (
      <div data-quiz-flow data-quiz-phase="completed">{completionBlock}</div>
    );
  }

  // ── Intro ──
  if (phase === "intro") {
    return (
      <div className="rounded-xl border border-void-700/70 bg-void-900 p-6 shadow-card" data-quiz-flow data-quiz-phase="intro">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">
          Lesson quiz · {total} questions
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">{quizTitle}</h2>
        <ul className="mt-4 space-y-2 text-sm text-ink-dim">
          <li className="flex gap-2.5">
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-pulse-500" aria-hidden="true" />
            Questions 1-6 are auto-graded; 7-10 are written-reasoning with feedback.
          </li>
          <li className="flex gap-2.5">
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-pulse-500" aria-hidden="true" />
            Score {masteryThresholdPct}% or higher to pass and complete this lesson.
          </li>
          <li className="flex gap-2.5">
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-pulse-500" aria-hidden="true" />
            Retakes are always allowed and never punished: your best score is what counts.
          </li>
        </ul>
        {attempts > 0 && (
          <p className="mt-4 rounded-lg border border-void-700/70 bg-void-850 px-4 py-3 text-sm text-ink-dim">
            {attempts} attempt{attempts === 1 ? "" : "s"} so far
            {quizBest !== null && (
              <>
                {" "}· best score <span className="font-semibold text-ink">{quizBest}%</span>
              </>
            )}
            {" "}· pass mark {masteryThresholdPct}%
          </p>
        )}
        {!signedIn && (
          <div className="mt-4">
            <SignInToSaveNotice body="You're browsing as a guest: the quiz works fully, but scores are not saved. Sign in to record progress and earn XP." />
          </div>
        )}
        <Button size="lg" className="mt-5" onClick={() => { restart(); }}>
          {attempts > 0 ? "Try the quiz again" : "Begin the quiz"}
        </Button>
      </div>
    );
  }

  // ── Auto-graded result ──
  if (phase === "auto-result" && result) {
    const passed = result.pct >= masteryThresholdPct;
    return (
      <div data-quiz-flow data-quiz-phase="auto-result">
        <div
          className={`rounded-xl border p-5 shadow-card ${
            passed ? "border-mint-400/50 bg-mint-400/5" : "border-amber-400/50 bg-amber-400/5"
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div
              aria-hidden="true"
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                passed ? "bg-mint-500/15 text-mint-600" : "bg-amber-500/15 text-amber-600"
              }`}
            >
              <Icon name={passed ? "trophy" : "brain"} size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold text-ink">
                {passed
                  ? `Passed: ${result.score}/${result.total} correct (${result.pct}%)`
                  : `Not yet: ${result.score}/${result.total} correct (${result.pct}%)`}
              </p>
              <p className="mt-0.5 text-sm text-ink-dim">
                {result.guest ? (
                  <>Guest attempt, not saved. <a href="/login" className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300">Sign in</a> to record it.</>
                ) : (
                  <>
                    Best: <span className="font-semibold text-ink">{quizBest}%</span>
                    {attempts > 1 ? <> · {attempts} attempts</> : null}
                    {" "}· pass mark {masteryThresholdPct}%
                  </>
                )}
              </p>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            Quiz graded. Score {result.pct} percent. {passed ? "Passed." : `Review and try again; the pass mark is ${masteryThresholdPct} percent.`}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {passed ? (
              <Button onClick={() => setPhase("written")}>
                Continue to written reasoning <Icon name="arrow-right" size={15} aria-hidden="true" />
              </Button>
            ) : (
              <>
                <Button onClick={restart}>Review and try again</Button>
                <a
                  href={`/academy-new/module/1/lesson/${lessonSlug}?section=lesson`}
                  className="text-sm font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300"
                >
                  Review the lesson sheet
                </a>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowReview((v) => !v)}>
              {showReview ? "Hide answer review" : "Show answer review"}
            </Button>
          </div>
        </div>

        {showReview && (
          <ol className="mt-5 space-y-4">
            {questions.map((q, i) => {
              const exp = result.explanations?.find((e) => e.qId === q.id);
              return (
                <li key={q.id} id={`q-${q.id}`} className="rounded-xl border border-void-700/70 bg-void-900 px-5 py-5 shadow-card">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-xs font-bold text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span className="rounded-md border border-void-700 bg-void-850 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      {DIFFICULTY_LABEL[q.difficulty] ?? q.difficulty}
                    </span>
                    <span className={`text-[11px] font-bold ${exp?.right ? "text-mint-700 dark:text-mint-300" : "text-amber-700 dark:text-amber-300"}`}>
                      {exp?.right ? "Correct" : "Missed"}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] font-semibold leading-snug text-ink">{q.prompt}</p>
                  {(q.kind === "mcq" || q.kind === "multi") && (
                    <ChoiceGroup
                      label={q.prompt}
                      options={q.options}
                      selected={choice[i] ?? []}
                      onSelect={() => {}}
                      multi={q.kind === "multi"}
                      disabled
                      reveal={exp ? { correct: exp.correct } : null}
                    />
                  )}
                  {q.kind === "order" && (
                    <OrderGroup
                      label={q.prompt}
                      items={q.items}
                      arrangement={orders[i] ?? q.items.map((_, k) => k)}
                      onArrange={() => {}}
                      disabled
                      revealCorrect={exp ? exp.correct : null}
                    />
                  )}
                  {q.kind === "match" && (
                    <MatchGroup
                      label={q.prompt}
                      left={q.left}
                      right={q.right}
                      picks={picks[i] ?? q.left.map(() => -1)}
                      onPick={() => {}}
                      disabled
                      revealCorrect={exp ? exp.correct : null}
                    />
                  )}
                  {exp && (
                    <div
                      className={`mt-4 rounded-lg border p-3.5 text-sm leading-relaxed ${
                        exp.right ? "border-mint-400/30 bg-mint-400/5" : "border-amber-400/30 bg-amber-400/5"
                      }`}
                    >
                      <span className={`font-bold ${exp.right ? "text-mint-700 dark:text-mint-300" : "text-amber-700 dark:text-amber-300"}`}>
                        {exp.right ? "✓ " : "Review this: "}
                      </span>
                      <span className="text-ink-dim">{exp.explanation}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  // ── Auto-graded questions, one at a time ──
  if (phase === "auto") {
    const q = questions[qi];
    if (!q) return null;
    const isLast = qi === questions.length - 1;
    const ready = (() => {
      switch (q.kind) {
        case "mcq":
        case "multi":
          return (choice[qi] ?? []).length > 0;
        case "order":
          return (orders[qi] ?? []).length === q.items.length;
        case "match":
          return (picks[qi] ?? q.left.map(() => -1)).every((p) => p >= 0);
      }
    })();
    return (
      <div data-quiz-flow data-quiz-phase="auto">
        <QuizProgressDots total={total} current={qi} doneThrough={qi} />
        <p className="mt-2 text-[11px] font-semibold text-ink-faint">
          Question {qi + 1} of {total} · auto-graded
        </p>
        <div className="mt-3 rounded-xl border border-void-700/70 bg-void-900 px-5 py-5 shadow-card" id={`q-${q.id}`} data-quiz-question={q.id}>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-ink-faint">{String(qi + 1).padStart(2, "0")}</span>
            <span className="rounded-md border border-void-700 bg-void-850 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              {DIFFICULTY_LABEL[q.difficulty] ?? q.difficulty}
            </span>
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
            />
          )}
          {q.kind === "order" && (
            <OrderGroup
              label={q.prompt}
              items={q.items}
              arrangement={orders[qi] ?? q.items.map((_, k) => k)}
              onArrange={(next) => setAnswer(qi, "order", next)}
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
            />
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-rose-400/50 bg-rose-400/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-void-700/60 pt-4">
            <Button variant="ghost" size="sm" disabled={qi === 0} onClick={() => setQi((v) => Math.max(0, v - 1))}>
              <Icon name="arrow-left" size={14} aria-hidden="true" /> Previous question
            </Button>
            {isLast ? (
              <Button onClick={submit} disabled={!ready} loading={submitting}>
                Submit answers
              </Button>
            ) : (
              <Button disabled={!ready} onClick={() => setQi((v) => v + 1)}>
                Next question <Icon name="arrow-right" size={14} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
        {!signedIn && (
          <div className="mt-4">
            <SignInToSaveNotice body="Guest scores are not saved. Sign in to record progress and earn XP." />
          </div>
        )}
      </div>
    );
  }

  // ── Written-reasoning questions, one at a time ──
  const fr = freeResponses[wi];
  const frAnswered = fr ? isDone(fr.id) : false;
  const frIsLast = wi === freeResponses.length - 1;
  const frDoneCount = freeResponses.filter((f) => isDone(f.id)).length;
  return (
    <div data-quiz-flow data-quiz-phase="written">
      {completionBlock}
      <QuizProgressDots total={total} current={questions.length + wi} doneThrough={questions.length + wi} />
      <p className="mt-2 text-[11px] font-semibold text-ink-faint">
        Question {questions.length + wi + 1} of {total} · written reasoning
      </p>
      {fr && (
        <div className="mt-3 rounded-xl border border-void-700/70 bg-void-900 px-5 py-5 shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-volt-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-volt-700 dark:text-volt-300">
              Written reasoning
            </span>
            {isDone(fr.id) && (
              <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-mint-700 dark:text-mint-300">
                <Icon name="check" size={13} aria-hidden="true" /> Submitted
              </span>
            )}
          </div>
          <div className="mt-3">
            <FreeResponseItem
              key={fr.id}
              lessonId={lessonId}
              fr={fr}
              questionNumber={questions.length + wi + 1}
              totalQuestions={total}
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-void-700/60 pt-4">
            <Button variant="ghost" size="sm" disabled={wi === 0} onClick={() => setWi((v) => Math.max(0, v - 1))}>
              <Icon name="arrow-left" size={14} aria-hidden="true" /> Previous question
            </Button>
            {frIsLast ? (
              <span className="text-xs text-ink-faint">
                {frDoneCount === freeResponses.length
                  ? "All written questions submitted."
                  : "Last question: submit your answer to finish the lesson."}
              </span>
            ) : (
              <Button disabled={!frAnswered} onClick={() => setWi((v) => Math.min(freeResponses.length - 1, v + 1))}>
                Next question <Icon name="arrow-right" size={14} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      )}
      {!signedIn && (
        <div className="mt-4">
          <SignInToSaveNotice body="Guest answers get feedback but are not saved. Sign in to keep them on your record." />
        </div>
      )}
    </div>
  );
}

function QuizProgressDots({ total, current, doneThrough }: { total: number; current: number; doneThrough: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < doneThrough ? "bg-mint-500" : i === current ? "bg-pulse-500" : "bg-void-700"
          }`}
        />
      ))}
    </div>
  );
}
