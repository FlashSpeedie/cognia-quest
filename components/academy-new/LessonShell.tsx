"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { LESSON_XP } from "@/lib/academy";
import { useLessonProgress, SignInToSaveNotice } from "./LessonProgressContext";

/**
 * The learning shell: module lesson navigation (desktop sidebar /
 * mobile drawer), lesson header with live progress, and prev/next
 * movement. Nothing is locked in Module 1 - students navigate freely;
 * states reflect real progress only.
 */

export interface NavLesson {
  slug: string;
  order: number;
  title: string;
  minutes: number;
  state: "not_started" | "in_progress" | "completed";
}

const STATE_ICON: Record<NavLesson["state"], string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "✓",
};

function LessonList({
  lessons,
  currentSlug,
  onNavigate,
}: {
  lessons: NavLesson[];
  currentSlug: string;
  onNavigate?: () => void;
}) {
  return (
    <ol className="space-y-1" aria-label="Module 1 lessons">
      {lessons.map((l) => {
        const isCurrent = l.slug === currentSlug;
        return (
          <li key={l.slug}>
            <a
              href={`/academy-new/module/1/lesson/${l.slug}`}
              onClick={onNavigate}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors focus-ring ${
                isCurrent
                  ? "bg-pulse-400/10 text-pulse-700 dark:text-pulse-300"
                  : l.state === "completed"
                    ? "text-mint-700 hover:bg-void-800 dark:text-mint-300/90"
                    : "text-ink-dim hover:bg-void-800 hover:text-ink"
              }`}
            >
              <span aria-hidden="true" className="mt-0.5 w-4 shrink-0 text-center font-mono text-xs">
                {STATE_ICON[l.state]}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate ${isCurrent ? "font-semibold" : "font-medium"}`}>
                  <span className="mr-1 font-mono text-[11px] text-ink-faint">{String(l.order).padStart(2, "0")}</span>
                  {l.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-ink-faint">
                  {l.minutes} min
                  {l.state === "completed" ? " · complete" : l.state === "in_progress" ? " · in progress" : ""}
                </span>
              </span>
              {l.state === "completed" && (
                <Icon name="check" size={13} className="mt-1 shrink-0 text-mint-500" aria-hidden="true" />
              )}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function LessonShell({
  moduleNumber,
  moduleTitle,
  lessons,
  currentSlug,
  currentOrder,
  title,
  minutes,
  videoSource,
  prevHref,
  nextHref,
  children,
}: {
  moduleNumber: number;
  moduleTitle: string;
  lessons: NavLesson[];
  currentSlug: string;
  currentOrder: number;
  title: string;
  minutes: number;
  videoSource: string;
  prevHref: string | null;
  nextHref: string | null;
  children: ReactNode;
}) {
  const { pct, signedIn, completed } = useLessonProgress();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div id="lesson-top" className="grid grid-cols-1 gap-8 lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* ── Desktop lesson nav ── */}
      <aside className="hidden lg:block" aria-label="Module lessons">
        <div className="sticky top-20 rounded-xl border border-void-700/70 bg-void-900 p-4 shadow-card">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            Module {moduleNumber}
          </p>
          <p className="mt-1 text-sm font-bold leading-snug text-ink">{moduleTitle}</p>
          <div className="mt-3">
            <LessonList lessons={lessons} currentSlug={currentSlug} />
          </div>
          <a
            href="/academy-new/module/1/test"
            className="mt-3 flex items-center gap-2 rounded-lg border border-void-700 bg-void-850 px-3 py-2.5 text-xs font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
          >
            <Icon name="badge" size={14} aria-hidden="true" /> Module test
          </a>
        </div>
      </aside>

      {/* ── Content column ── */}
      <div className="min-w-0">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
          <a href="/academy-new" className="hover:text-ink focus-ring rounded">Academy</a>
          <span aria-hidden="true">/</span>
          <a href={`/academy-new/module/${moduleNumber}`} className="hover:text-ink focus-ring rounded">
            Module {moduleNumber}
          </a>
          <span aria-hidden="true">/</span>
          <span className="text-pulse-700 dark:text-pulse-300">
            Lesson {currentOrder}
          </span>
        </nav>

        {/* Header */}
        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-pulse-400/40 bg-pulse-400/10 px-2.5 py-0.5 text-[11px] font-bold text-pulse-700 dark:text-pulse-300">
              Module {moduleNumber} · Lesson {currentOrder} of {lessons.length}
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

          <div className="sticky top-16 z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-lg bg-void-850/95 px-1 py-1.5 backdrop-blur-sm lg:static lg:z-auto lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
            <div className="min-w-40 flex-1">
              <ProgressBar value={pct} label="Lesson progress" showValue tone="pulse" />
            </div>
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-void-700 bg-void-900 px-3 py-1.5 text-xs font-semibold text-ink-dim transition-colors hover:text-ink focus-ring lg:hidden"
            >
              <Icon name="menu" size={14} aria-hidden="true" /> All lessons
            </button>
          </div>
          <p className="mt-2 text-[11px] text-ink-faint">Video source: {videoSource}</p>
        </header>

        {/* Lesson body */}
        <div className="mt-8 space-y-8">{children}</div>

        {/* Prev / next */}
        <nav
          aria-label="Lesson navigation"
          className="mt-10 flex items-center justify-between gap-4 border-t border-void-700/60 pt-5"
        >
          {prevHref ? (
            <a
              href={prevHref}
              className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-4 py-2.5 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
            >
              <Icon name="arrow-left" size={15} aria-hidden="true" /> Previous lesson
            </a>
          ) : (
            <span aria-hidden="true" />
          )}
          <span className="font-mono text-xs text-ink-faint">
            Lesson {currentOrder} / {lessons.length}
          </span>
          {nextHref ? (
            <a
              href={nextHref}
              className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
            >
              Next lesson <Icon name="arrow-right" size={15} aria-hidden="true" />
            </a>
          ) : (
            <a
              href="/academy-new/module/1/test"
              className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
            >
              Module test <Icon name="arrow-right" size={15} aria-hidden="true" />
            </a>
          )}
        </nav>
      </div>

      {/* ── Mobile lesson nav drawer ── */}
      <Modal open={navOpen} onClose={() => setNavOpen(false)} title="Module 1 lessons">
        <LessonList lessons={lessons} currentSlug={currentSlug} onNavigate={() => setNavOpen(false)} />
      </Modal>
    </div>
  );
}
