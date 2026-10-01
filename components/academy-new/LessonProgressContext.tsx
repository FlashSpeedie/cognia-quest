"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/Toast";

/**
 * Per-lesson progress state shared by the shell (progress bar), checkpoints,
 * activities, quiz, free-response and completion panel.
 *
 * Signed-in students: every completed step is POSTed to /api/academy/progress
 * (server validates + persists + awards idempotent XP).
 * Anonymous visitors: progress lives only in this component tree for the
 * session, and the UI shows a "sign in to save progress" action.
 */

export interface AcademyLessonXP {
  awarded: number;
  total: number;
  leveledUp: { to: string; level: number } | null;
  duplicate: boolean;
}

interface LessonProgressContextValue {
  lessonId: string;
  signedIn: boolean;
  done: ReadonlySet<string>;
  requiredIds: readonly string[];
  /** 0-100: share of required steps done */
  pct: number;
  completed: boolean;
  /** XP reported by the server for the lesson-completion edge this session */
  lessonXpAwarded: AcademyLessonXP | null;
  /** best quiz score for this lesson (server value, updated in-session) */
  quizBest: number | null;
  setQuizBest: (pct: number) => void;
  /**
   * Surface lesson XP that a *server* call already banked (quiz submission,
   * free-response grading) so the UI can toast it and the completion panel
   * can display it. Idempotent - repeated reports of the same award are
   * ignored by the deterministic XP pipeline anyway.
   */
  reportLessonXp: (xp: AcademyLessonXP | null | undefined) => void;
  markDone: (sectionId: string) => void;
  /**
   * Update local state for a step the SERVER has already persisted (e.g. the
   * quiz section after a graded submission) - no extra write is sent.
   */
  syncLocal: (sectionId: string) => void;
  isDone: (sectionId: string) => boolean;
}

const Ctx = createContext<LessonProgressContextValue | null>(null);

export function useLessonProgress(): LessonProgressContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLessonProgress must be used inside LessonProgressProvider");
  return v;
}

export function LessonProgressProvider({
  lessonId,
  requiredIds,
  initialDone,
  signedIn,
  initialQuizBest,
  children,
}: {
  lessonId: string;
  requiredIds: string[];
  initialDone: string[];
  signedIn: boolean;
  initialQuizBest?: number | null;
  children: ReactNode;
}) {
  const [done, setDone] = useState<Set<string>>(() => new Set(initialDone));
  const [lessonXpAwarded, setLessonXpAwarded] = useState<AcademyLessonXP | null>(null);
  const [quizBest, setQuizBestState] = useState<number | null>(initialQuizBest ?? null);
  const { push } = useToast();

  const setQuizBest = useCallback((pct: number) => {
    setQuizBestState((prev) => Math.max(prev ?? 0, pct));
  }, []);

  const reportLessonXp = useCallback(
    (xp: AcademyLessonXP | null | undefined) => {
      if (!xp || xp.awarded <= 0) return;
      setLessonXpAwarded((prev) => (prev ? prev : xp));
      push({
        kind: "xp",
        title: `+${xp.awarded} XP`,
        body: "Lesson complete - banked to your account.",
      });
      if (xp.leveledUp) {
        push({ kind: "success", title: "Level up!", body: `You're now ${xp.leveledUp.to} (Level ${xp.leveledUp.level}).` });
      }
    },
    [push],
  );

  const markDone = useCallback(
    (sectionId: string) => {
      setDone((prev) => {
        if (prev.has(sectionId)) return prev;
        const next = new Set(prev);
        next.add(sectionId);
        return next;
      });
      if (!signedIn) return;
      void (async () => {
        try {
          const res = await fetch("/api/academy/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId, sectionId }),
          });
          if (!res.ok) throw new Error();
          const data = (await res.json()) as {
            lessonXp?: { awarded: number; total: number; leveledUp: { to: string; level: number } | null; duplicate: boolean } | null;
          };
          const lx = data.lessonXp;
          if (lx && lx.awarded > 0) {
            setLessonXpAwarded(lx);
            push({
              kind: "xp",
              title: `+${lx.awarded} XP`,
              body: "Lesson complete - banked to your account.",
            });
            if (lx.leveledUp) {
              push({ kind: "success", title: "Level up!", body: `You're now ${lx.leveledUp.to} (Level ${lx.leveledUp.level}).` });
            }
          }
        } catch {
          push({
            kind: "error",
            title: "Couldn't save progress",
            body: "Kept on this screen for now - we'll retry as you keep going.",
          });
        }
      })();
    },
    [lessonId, signedIn, push],
  );

  const syncLocal = useCallback((sectionId: string) => {
    setDone((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
  }, []);

  const value = useMemo<LessonProgressContextValue>(() => {
    const required = requiredIds.filter((id) => done.has(id)).length;
    return {
      lessonId,
      signedIn,
      done,
      requiredIds,
      pct: requiredIds.length > 0 ? Math.round((required / requiredIds.length) * 100) : 0,
      completed: requiredIds.length > 0 && requiredIds.every((id) => done.has(id)),
      lessonXpAwarded,
      quizBest,
      setQuizBest,
      reportLessonXp,
      markDone,
      syncLocal,
      isDone: (sectionId: string) => done.has(sectionId),
    };
  }, [lessonId, signedIn, done, requiredIds, lessonXpAwarded, quizBest, markDone, syncLocal, setQuizBest, reportLessonXp]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Compact banner shown to signed-out students near graded/interactive work. */
export function SignInToSaveNotice({ body = "Sign in to save your progress and earn XP." }: { body?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3.5 py-2.5 text-sm text-ink-dim">
      <span>{body}</span>
      <a
        href={`/login?next=${encodeURIComponent("/academy-new")}`}
        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-700 underline-offset-2 transition-colors hover:bg-amber-400/20 focus-ring dark:text-amber-300 hover:underline"
      >
        Sign in
      </a>
    </div>
  );
}
