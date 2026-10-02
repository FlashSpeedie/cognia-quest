import { Icon } from "@/components/ui/Icon";
import type { AcademyLessonMeta } from "@/content/academy/types";

/**
 * Friendly locked screens, server-rendered so locked content is never sent
 * to the browser at all. Sequential course rule: a lesson opens once every
 * earlier lesson is completed; the module test opens once all lessons are.
 */

function LockFrame({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl" data-locked-screen>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-void-700 bg-void-850 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-ink-faint">
        <Icon name="lock" size={12} aria-hidden="true" /> {eyebrow}
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">{title}</h1>
      <div className="mt-6 rounded-xl border border-void-700/70 bg-void-900 px-6 py-6 shadow-card">
        {children}
      </div>
    </div>
  );
}

/** Lesson N deep-linked before its prerequisites are complete. */
export function LessonLockedScreen({
  lesson,
  blockingLesson,
  completedCount,
  totalLessons,
}: {
  lesson: AcademyLessonMeta;
  blockingLesson: AcademyLessonMeta;
  completedCount: number;
  totalLessons: number;
}) {
  const href = `/academy-new/module/1/lesson/${blockingLesson.slug}`;
  return (
    <LockFrame eyebrow={`Module 1 · Lesson ${lesson.order}`} title={lesson.title}>
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-void-800 text-ink-faint"
        >
          <Icon name="lock" size={22} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-ink">
            This lesson is locked for now
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">
            Complete Lesson {blockingLesson.order}, {blockingLesson.title}, to unlock this lesson.
            Lessons open in order so each idea builds on the last one.
          </p>
          <p className="mt-1.5 text-xs text-ink-faint">
            {completedCount} of {totalLessons} lessons complete so far.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={href}
          className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
        >
          Back to current lesson <Icon name="arrow-right" size={15} aria-hidden="true" />
        </a>
        <a
          href="/academy-new/module/1"
          className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-4 py-2.5 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
        >
          Module 1 overview
        </a>
      </div>
    </LockFrame>
  );
}

/** Module test page before every lesson is completed. */
export function ModuleTestLockedScreen({
  currentLesson,
  completedCount,
  totalLessons,
}: {
  currentLesson: AcademyLessonMeta;
  completedCount: number;
  totalLessons: number;
}) {
  const href = `/academy-new/module/1/lesson/${currentLesson.slug}`;
  return (
    <LockFrame eyebrow="Module 1 · Assessment" title="Module 1 Test">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-void-800 text-ink-faint"
        >
          <Icon name="lock" size={22} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-ink">
            The test unlocks when every lesson is complete
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">
            You have finished {completedCount} of {totalLessons} lessons. Finish them all and the
            module test opens: it checks everything Module 1 teaches.
          </p>
          <div className="mt-3" aria-hidden="true">
            <div className="h-1.5 w-full max-w-xs rounded-full bg-void-700">
              <div
                className="h-full rounded-full bg-pulse-600"
                style={{ width: `${Math.round((completedCount / totalLessons) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={href}
          className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
        >
          Back to current lesson <Icon name="arrow-right" size={15} aria-hidden="true" />
        </a>
        <a
          href="/academy-new/module/1"
          className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-4 py-2.5 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
        >
          Module 1 overview
        </a>
      </div>
    </LockFrame>
  );
}
