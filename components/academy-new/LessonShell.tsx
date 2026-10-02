"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import {
  LESSON_XP,
  LESSON_MASTERY_THRESHOLD,
  LESSON_SECTION_KEYS,
  LESSON_SECTION_LABELS,
  lessonSectionDone,
  lessonSectionUnlocked,
  type LessonSectionKey,
  type LessonSectionProgress,
} from "@/lib/academy";
import { useLessonProgress } from "./LessonProgressContext";

/**
 * The Academy (New) learning shell: the Khan/Udemy-style COURSE sidebar plus
 * the lesson header and the section body slot.
 *
 * Course sidebar semantics (sequential course):
 *  - Module 1 is a real expand/collapse tree (▼ / ▶).
 *  - The current lesson shows its four internal sections (Video, Lesson
 *    Sheet, References, Quiz) with done/current/locked states, expanded on
 *    entry and collapsible by clicking the lesson row.
 *  - Completed lessons stay clickable for review; the next lesson opens
 *    once every earlier lesson is completed; later lessons are locked
 *    (aria-disabled, no link).
 *  - The Module Test stays locked until every lesson is completed.
 *  - All states recompute live from the shared progress context, so the
 *    sidebar reflects checkpoint answers and lesson completion in-session,
 *    without a reload.
 *
 * The global Cognia app shell stays visible around this for signed-in
 * students; this is course navigation only.
 */

export interface NavLesson {
  slug: string;
  order: number;
  title: string;
  minutes: number;
  state: "completed" | "available" | "locked";
}

/** Persistable step ids behind each section, so states recompute live. */
export interface SectionSteps {
  video: string[]; // checkpoint ids
  lesson: string[]; // the -sheet step id
  references: string[]; // the -refs step id
  quiz: string[]; // the -quiz step id
}

export interface ModuleProgress {
  completed: number;
  total: number;
  testLocked: boolean;
  testPassed: boolean;
}

function lessonHref(slug: string) {
  return `/academy-new/module/1/lesson/${slug}`;
}

function SectionRows({
  currentSlug,
  section,
  secProgress,
  lockSections,
  onNavigate,
}: {
  currentSlug: string;
  section: LessonSectionKey;
  secProgress: LessonSectionProgress;
  /** Sequential locks describe the signed-in student flow; guests browse freely. */
  lockSections: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ol className="ml-4 mt-1 space-y-0.5 border-l border-void-700/60 pl-2" aria-label="Lesson sections">
      {LESSON_SECTION_KEYS.map((key, i) => {
        const label = LESSON_SECTION_LABELS[key];
        const done = lessonSectionDone(key, secProgress);
        const locked = lockSections && !lessonSectionUnlocked(key, secProgress);
        const isCurrent = key === section;
        const common = "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors focus-ring";
        if (locked) {
          return (
            <li key={key}>
              <span
                aria-disabled="true"
                data-locked-section={key}
                title="Complete the previous section to unlock"
                className={`${common} cursor-not-allowed text-ink-faint/70`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-ink-faint">
                  <Icon name="lock" size={12} aria-hidden="true" />
                </span>
                <span className="font-mono text-[10px] text-ink-faint">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
              </span>
            </li>
          );
        }
        return (
          <li key={key}>
            <a
              href={`${lessonHref(currentSlug)}?section=${key}`}
              onClick={onNavigate}
              aria-current={isCurrent ? "page" : undefined}
              data-section-link={key}
              className={`${common} ${
                isCurrent
                  ? "bg-pulse-400/10 font-semibold text-pulse-700 dark:text-pulse-300"
                  : done
                    ? "text-mint-700/90 hover:bg-void-800 dark:text-mint-300/80"
                    : "text-ink-dim hover:bg-void-800 hover:text-ink"
              }`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {done ? (
                  <Icon name="check" size={13} className="text-mint-500" aria-hidden="true" />
                ) : (
                  <span className="text-ink-faint" aria-hidden="true">
                    {isCurrent ? "→" : "○"}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {isCurrent && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-pulse-700 dark:text-pulse-300">
                  Now
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function CourseSidebarBody({
  lessons,
  currentSlug,
  currentOrder,
  section,
  sectionSteps,
  progress,
  onNavigate,
}: {
  lessons: NavLesson[];
  currentSlug: string;
  currentOrder: number;
  section: LessonSectionKey;
  sectionSteps: SectionSteps;
  progress: ModuleProgress;
  onNavigate?: () => void;
}) {
  const [moduleOpen, setModuleOpen] = useState(true);
  const [sectionsOpen, setSectionsOpen] = useState(true);
  const { done, quizBest, completed, signedIn } = useLessonProgress();

  // Live section states from the shared progress context (works during SSR
  // too: the context hydrates from the server-persisted steps).
  const secProgress: LessonSectionProgress = completed
    ? { videoDone: true, sheetDone: true, referencesDone: true, quizDone: true }
    : {
        videoDone: sectionSteps.video.every((id) => done.has(id)),
        sheetDone: sectionSteps.lesson.length > 0 && done.has(sectionSteps.lesson[0]!),
        referencesDone: sectionSteps.references.length > 0 && done.has(sectionSteps.references[0]!),
        quizDone:
          sectionSteps.quiz.length > 0 &&
          done.has(sectionSteps.quiz[0]!) &&
          (quizBest ?? 0) >= LESSON_MASTERY_THRESHOLD,
      };

  // Lesson-level states also adjust live: the current lesson flips to
  // completed, and completing it unlocks exactly the next lesson.
  const completedAtLoad = lessons.find((l) => l.slug === currentSlug)?.state === "completed";
  const justCompleted = completed && !completedAtLoad;
  const effectiveLessons = lessons.map((l) => {
    if (l.slug === currentSlug) return { ...l, state: "completed" as const };
    if (justCompleted && l.order === currentOrder + 1 && l.state === "locked") {
      return { ...l, state: "available" as const };
    }
    return l;
  });
  const effectiveProgress = {
    ...progress,
    completed: progress.completed + (justCompleted ? 1 : 0),
    testLocked: progress.testLocked && !(justCompleted && currentOrder === progress.total),
  };

  return (
    <div>
      {/* ── Module header: a real expand/collapse control ── */}
      <button
        type="button"
        onClick={() => setModuleOpen((v) => !v)}
        aria-expanded={moduleOpen}
        aria-controls="course-module-1-tree"
        data-module-toggle
        className="w-full rounded-lg px-1 py-1 text-left transition-colors hover:bg-void-800/60 focus-ring"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Module 1</span>
          <span className="text-ink-faint" aria-hidden="true">
            {moduleOpen ? "▼" : "▶"}
          </span>
        </span>
        <span className="mt-0.5 block text-sm font-bold leading-snug text-ink">
          AI & Machine Learning Foundations
        </span>
      </button>

      {moduleOpen && (
        <div id="course-module-1-tree">
          <ol className="mt-3 space-y-0.5" aria-label="Module 1 lessons">
            {effectiveLessons.map((l) => {
              const isCurrent = l.slug === currentSlug;
              if (l.state === "locked") {
                return (
                  <li key={l.slug}>
                    <span
                      aria-disabled="true"
                      data-locked-lesson={l.slug}
                      title="Complete the current lesson to unlock this one"
                      className="flex cursor-not-allowed items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-faint/70"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                        <Icon name="lock" size={13} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          <span className="mr-1 font-mono text-[11px]">
                            {String(l.order).padStart(2, "0")}
                          </span>
                          {l.title}
                        </span>
                      </span>
                    </span>
                  </li>
                );
              }
              if (isCurrent) {
                return (
                  <li key={l.slug}>
                    <button
                      type="button"
                      onClick={() => setSectionsOpen((v) => !v)}
                      aria-expanded={sectionsOpen}
                      aria-controls="current-lesson-sections"
                      data-current-lesson-toggle
                      className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-ring ${
                        sectionsOpen
                          ? "bg-pulse-400/10 text-pulse-700 dark:text-pulse-300"
                          : "text-pulse-700 hover:bg-void-800 dark:text-pulse-300"
                      }`}
                    >
                      <span className="mt-0.5 w-4 shrink-0 text-center" aria-hidden="true">
                        {sectionsOpen ? "▼" : "▶"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">
                          <span className="mr-1 font-mono text-[11px]">
                            {String(l.order).padStart(2, "0")}
                          </span>
                          {l.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink-faint">
                          {l.minutes} min · Lesson {l.order} of {lessons.length}
                        </span>
                      </span>
                      {l.state === "completed" && (
                        <Icon name="check" size={13} className="mt-1 shrink-0 text-mint-500" aria-hidden="true" />
                      )}
                    </button>
                    {sectionsOpen && (
                      <div id="current-lesson-sections">
                        <SectionRows
                          currentSlug={currentSlug}
                          section={section}
                          secProgress={secProgress}
                          lockSections={signedIn}
                          onNavigate={onNavigate}
                        />
                      </div>
                    )}
                  </li>
                );
              }
              return (
                <li key={l.slug}>
                  <a
                    href={lessonHref(l.slug)}
                    onClick={onNavigate}
                    data-lesson-link={l.slug}
                    className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors focus-ring ${
                      l.state === "completed"
                        ? "text-mint-700 hover:bg-void-800 dark:text-mint-300/90"
                        : "text-ink-dim hover:bg-void-800 hover:text-ink"
                    }`}
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                      {l.state === "completed" ? (
                        <Icon name="check" size={13} className="text-mint-500" aria-hidden="true" />
                      ) : (
                        <span aria-hidden="true" className="font-mono text-xs text-ink-faint">
                          ○
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        <span className="mr-1 font-mono text-[11px] text-ink-faint">
                          {String(l.order).padStart(2, "0")}
                        </span>
                        {l.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-ink-faint">
                        {l.minutes} min
                        {l.state === "completed" ? " · complete" : ""}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>

          {/* ── Module test: locked until every lesson is completed ── */}
          {effectiveProgress.testLocked ? (
            <span
              aria-disabled="true"
              data-locked-module-test
              title="Complete all 8 lessons to unlock the module test"
              className="mt-3 flex cursor-not-allowed items-center gap-2 rounded-lg border border-void-700 bg-void-850 px-3 py-2.5 text-xs font-semibold text-ink-faint/70"
            >
              <Icon name="badge" size={14} aria-hidden="true" /> Module Test
              <Icon name="lock" size={12} className="ml-auto" aria-hidden="true" />
            </span>
          ) : (
            <a
              href="/academy-new/module/1/test"
              onClick={onNavigate}
              className="mt-3 flex items-center gap-2 rounded-lg border border-void-700 bg-void-850 px-3 py-2.5 text-xs font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
            >
              <Icon name="badge" size={14} aria-hidden="true" /> Module Test
              {effectiveProgress.testPassed && (
                <Icon name="check" size={13} className="ml-auto text-mint-500" aria-hidden="true" />
              )}
            </a>
          )}
        </div>
      )}

      {/* ── Course progress ── */}
      <div className="mt-4 border-t border-void-700/60 pt-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Course progress</p>
        <p className="mt-1.5 text-sm font-semibold text-ink">
          {effectiveProgress.completed} / {effectiveProgress.total} lessons complete
          <span className="ml-2 font-mono text-xs font-normal text-ink-faint">
            Lesson {currentOrder} of {effectiveProgress.total}
          </span>
        </p>
        <div className="mt-2">
          <ProgressBar
            value={effectiveProgress.completed}
            max={effectiveProgress.total}
            label="Lessons completed"
            tone={effectiveProgress.completed === effectiveProgress.total ? "mint" : "pulse"}
          />
        </div>
      </div>
    </div>
  );
}

export function LessonShell({
  lessons,
  currentSlug,
  currentOrder,
  title,
  minutes,
  section,
  sectionSteps,
  progress,
  signedIn,
  children,
}: {
  lessons: NavLesson[];
  currentSlug: string;
  currentOrder: number;
  title: string;
  minutes: number;
  section: LessonSectionKey;
  sectionSteps: SectionSteps;
  progress: ModuleProgress;
  signedIn: boolean;
  children: ReactNode;
}) {
  const { pct, completed } = useLessonProgress();
  const [navOpen, setNavOpen] = useState(false);
  const sectionIdx = LESSON_SECTION_KEYS.indexOf(section);

  return (
    <div id="lesson-top" className="grid grid-cols-1 gap-8 lg:grid-cols-[272px_minmax(0,1fr)]">
      {/* ── Course sidebar (desktop) ── */}
      <aside className="hidden lg:block" aria-label="Course navigation">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-void-700/70 bg-void-900 p-4 shadow-card">
          <CourseSidebarBody
            lessons={lessons}
            currentSlug={currentSlug}
            currentOrder={currentOrder}
            section={section}
            sectionSteps={sectionSteps}
            progress={progress}
          />
        </div>
      </aside>

      {/* ── Content column ── */}
      <div className="min-w-0">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
          <a href="/academy-new" className="hover:text-ink focus-ring rounded">
            Academy (New)
          </a>
          <span aria-hidden="true">/</span>
          <a href="/academy-new/module/1" className="hover:text-ink focus-ring rounded">
            Module 1
          </a>
          <span aria-hidden="true">/</span>
          <span className="text-pulse-700 dark:text-pulse-300">Lesson {currentOrder}</span>
        </nav>

        {/* Header */}
        <header className="mt-4" data-lesson-header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-pulse-400/40 bg-pulse-400/10 px-2.5 py-0.5 text-[11px] font-bold text-pulse-700 dark:text-pulse-300">
              Module 1 · Lesson {currentOrder} of {lessons.length}
            </span>
            <span className="rounded-full border border-void-700 bg-void-850 px-2.5 py-0.5 text-[11px] font-semibold text-ink-dim">
              ~{minutes} min
            </span>
            {signedIn && (
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                +{LESSON_XP} XP on completion
              </span>
            )}
            {completed && (
              <span className="rounded-full border border-mint-400/40 bg-mint-400/10 px-2.5 py-0.5 text-[11px] font-bold text-mint-700 dark:text-mint-300">
                Complete
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">{title}</h1>

          <div className="sticky top-16 z-20 -mx-1 mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-void-850/95 px-1 py-1.5 backdrop-blur-sm lg:static lg:z-auto lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
            <div className="min-w-40 flex-1">
              <ProgressBar value={pct} label="Lesson progress" showValue tone="pulse" />
            </div>
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-void-700 bg-void-900 px-3 py-1.5 text-xs font-semibold text-ink-dim transition-colors hover:text-ink focus-ring lg:hidden"
            >
              <Icon name="menu" size={14} aria-hidden="true" /> Lessons
            </button>
          </div>

          {/* Section indicator: where you are inside this lesson */}
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint" data-section-indicator>
            <span className="font-mono font-bold uppercase tracking-widest text-ink-dim">
              Section {sectionIdx + 1} of {LESSON_SECTION_KEYS.length}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-ink-dim">{LESSON_SECTION_LABELS[section]}</span>
          </p>
        </header>

        {/* Section body */}
        <div className="mt-8">{children}</div>
      </div>

      {/* ── Mobile course drawer ── */}
      <Modal open={navOpen} onClose={() => setNavOpen(false)} title="Module 1 lessons">
        <CourseSidebarBody
          lessons={lessons}
          currentSlug={currentSlug}
          currentOrder={currentOrder}
          section={section}
          sectionSteps={sectionSteps}
          progress={progress}
          onNavigate={() => setNavOpen(false)}
        />
      </Modal>
    </div>
  );
}
