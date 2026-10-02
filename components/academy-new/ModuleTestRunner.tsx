"use client";

import { useState } from "react";
import type { PublicAcademyQuestion } from "@/lib/academy";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { QuizRunner } from "./QuizRunner";

/**
 * The Module 1 mastery assessment. Deliberately a different experience from
 * a lesson quiz: an exam-style intro, one sitting per attempt, a pass mark,
 * topic review, unlimited retakes (best score counts) and - on passing -
 * the module completion state.
 */
export function ModuleTestRunner({
  questions,
  signedIn,
  bestScore,
  attempts,
  passed,
  passThreshold,
  lessonMasteryThreshold,
  lessonsCompleted,
}: {
  questions: PublicAcademyQuestion[];
  signedIn: boolean;
  bestScore: number | null;
  attempts: number;
  passed: boolean;
  passThreshold: number;
  lessonMasteryThreshold: number;
  lessonsCompleted: number;
}) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="rounded-xl border border-void-700/70 bg-void-900 p-6 shadow-card">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">
          Module 1 mastery assessment
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">Module 1 Test</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-dim">
          {questions.length} questions across everything in Module 1: what machine learning is, the
          learning stack, supervised vs. unsupervised problems, regression vs. classification,
          evaluation metrics, data splits, bias and variance, and overfitting.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-ink-dim">
          <li className="flex gap-2.5">
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-pulse-500" aria-hidden="true" />
            Pass mark: <span className="font-semibold text-ink">{passThreshold}%</span> - passing marks
            the module complete.
          </li>
          <li className="flex gap-2.5">
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-pulse-500" aria-hidden="true" />
            Retakes are always allowed and never punished - your best score is what counts.
          </li>
          <li className="flex gap-2.5">
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-pulse-500" aria-hidden="true" />
            Full explanations appear for every question after you submit, grouped by the topics to
            review.
          </li>
          <li className="flex gap-2.5">
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-pulse-500" aria-hidden="true" />
            The learning assistant will not give you active test answers - but reviewing any lesson first
            is always allowed.
          </li>
        </ul>

        {signedIn ? (
          <div className="mt-5 rounded-lg border border-void-700/70 bg-void-850 px-4 py-3 text-sm text-ink-dim">
            {attempts > 0 ? (
              <>
                Previous attempts: <span className="font-semibold text-ink">{attempts}</span>
                {bestScore !== null && (
                  <>
                    {" "}· best score: <span className="font-semibold text-ink">{bestScore}%</span>
                  </>
                )}
                {passed && <span className="font-semibold text-mint-700 dark:text-mint-300"> · passed</span>}
                <span>{" "}· lessons completed: {lessonsCompleted}/8</span>
              </>
            ) : (
              <>First attempt. Lessons completed so far: {lessonsCompleted} of 8 - finishing them all first is the surest path.</>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-ink-dim">
            Browsing as a guest - you can take the test and see full feedback, but attempts
            are not recorded.{" "}
            <a href="/login" className="font-semibold text-amber-700 underline-offset-2 hover:underline focus-ring dark:text-amber-300">
              Sign in
            </a>{" "}
            to save your score and earn XP.
          </div>
        )}

        <Button size="lg" className="mt-5" onClick={() => setStarted(true)}>
          {attempts > 0 ? "Retake the test" : "Begin the test"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="sr-only">Module 1 test in progress. Answer every question, then submit.</p>
      <QuizRunner
        quizId="m1-module-test"
        questions={questions}
        signedIn={signedIn}
        initialBest={bestScore}
        initialAttempts={attempts}
        passThreshold={passThreshold}
        masteryThresholdPct={lessonMasteryThreshold}
      />
    </div>
  );
}
