"use client";

import { lessonMasteryPct, lessonMasteryState, MASTERY_LABELS, LESSON_XP } from "@/lib/academy";
import { Icon } from "@/components/ui/Icon";
import { useLessonProgress, SignInToSaveNotice } from "./LessonProgressContext";

/**
 * End-of-lesson completion state: quiz result, mastery status, XP earned,
 * next lesson, review and continue actions. XP lines only appear when the
 * server actually banked the award - never fabricated.
 */
export function CompletionPanel({
  nextHref,
  nextLessonTitle,
  alreadyBanked,
  attemptCount,
}: {
  nextHref: string | null;
  nextLessonTitle: string | null;
  alreadyBanked: boolean;
  attemptCount: number;
}) {
  const { completed, pct, quizBest, lessonXpAwarded, requiredIds, done, signedIn } = useLessonProgress();

  if (!completed) {
    const remaining = requiredIds.filter((id) => !done.has(id)).length;
    return (
      <div className="rounded-xl border border-void-700/70 bg-void-850 px-5 py-4 text-sm text-ink-dim">
        <p className="font-semibold text-ink">
          {remaining} step{remaining === 1 ? "" : "s"} left to complete this lesson
        </p>
        <p className="mt-1">
          Answer every checkpoint, finish the exercise, pass the quiz (50%+), and submit the free
          response to bank the lesson.
        </p>
      </div>
    );
  }

  const masteryPct = lessonMasteryPct({
    sectionsDone: done.size,
    requiredSections: requiredIds.length,
    completed: true,
    quizBest,
    attempts: attemptCount,
  });
  const state = lessonMasteryState({
    sectionsDone: done.size,
    requiredSections: requiredIds.length,
    completed: true,
    quizBest,
    attempts: attemptCount,
  });

  return (
    <div
      aria-live="polite"
      className="rounded-xl border border-mint-400/50 bg-mint-400/5 px-5 py-5 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-500/15 text-mint-600">
          <Icon name="trophy" size={22} />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-ink">Lesson complete</p>
          <p className="text-sm text-ink-dim">
            Mastery status: <span className="font-semibold text-ink">{MASTERY_LABELS[state]}</span> ·{" "}
            {quizBest !== null ? `quiz best ${quizBest}%` : "quiz not attempted"}
          </p>
        </div>
        <span className="ml-auto rounded-lg border border-void-700 bg-void-900 px-3 py-1.5 font-mono text-xs font-bold text-ink-dim">
          {pct}% of steps
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-void-700/70 bg-void-900 px-3.5 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Lesson mastery</dt>
          <dd className="mt-1 font-display text-xl font-bold text-ink">{masteryPct}%</dd>
        </div>
        <div className="rounded-lg border border-void-700/70 bg-void-900 px-3.5 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">XP earned</dt>
          <dd className="mt-1 font-display text-xl font-bold text-ink">
            {signedIn ? (alreadyBanked || lessonXpAwarded ? `+${LESSON_XP}` : "—") : "Sign in"}
          </dd>
        </div>
        <div className="rounded-lg border border-void-700/70 bg-void-900 px-3.5 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Quiz best</dt>
          <dd className="mt-1 font-display text-xl font-bold text-ink">{quizBest !== null ? `${quizBest}%` : "—"}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        How mastery works: 40% while learning, 55% once practicing, 70% when the lesson
        is completed, 100% when your best quiz score reaches 80%.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {nextHref ? (
          <a
            href={nextHref}
            className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
          >
            Continue: {nextLessonTitle}
            <Icon name="arrow-right" size={15} aria-hidden="true" />
          </a>
        ) : (
          <a
            href="/academy-new/module/1/test"
            className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
          >
            Take the Module 1 test
            <Icon name="arrow-right" size={15} aria-hidden="true" />
          </a>
        )}
        <a
          href="#lesson-top"
          className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-4 py-2.5 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
        >
          Review lesson
        </a>
      </div>

      {!signedIn && (
        <div className="mt-4">
          <SignInToSaveNotice body="You finished as a guest - sign in to save this lesson, earn XP and pick up where you left off." />
        </div>
      )}
    </div>
  );
}
