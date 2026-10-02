/**
 * Pure, deterministic mastery + display math for the Academy.
 * Both the server (persistence) and the client (display) use these exact
 * functions so the numbers never disagree, and every rule here is
 * explainable in the UI - no arbitrary hidden weights.
 */

import type { AcademyQuestion } from "@/content/academy/types";

/**
 * The question shape sent to the browser: everything needed to render,
 * nothing that reveals the answer. Correct answers and explanations live
 * server-side and are returned only in the graded response.
 */
export type PublicAcademyQuestion =
  | { id: string; kind: "mcq" | "multi"; prompt: string; options: string[]; concept: string; difficulty: string }
  | { id: string; kind: "order"; prompt: string; items: string[]; concept: string; difficulty: string }
  | { id: string; kind: "match"; prompt: string; left: string[]; right: string[]; concept: string; difficulty: string };

export function toPublicQuestion(q: AcademyQuestion): PublicAcademyQuestion {
  switch (q.kind) {
    case "mcq":
    case "multi":
      return { id: q.id, kind: q.kind, prompt: q.prompt, options: q.options, concept: q.concept, difficulty: q.difficulty };
    case "order":
      return { id: q.id, kind: "order", prompt: q.prompt, items: q.items, concept: q.concept, difficulty: q.difficulty };
    case "match":
      return { id: q.id, kind: "match", prompt: q.prompt, left: q.left, right: q.right, concept: q.concept, difficulty: q.difficulty };
  }
}

/** One-time XP for completing a lesson (server awards via awardXP with this base). */
export const LESSON_XP = 50;

/** XP awarded the first time a student passes the module test. */
export const MODULE_TEST_XP = 150;

// Deterministic mastery buckets for a lesson (percent).
export const MASTERY_NOT_STARTED = 0;
export const MASTERY_LEARNING = 40;
export const MASTERY_PRACTICING = 55;
export const MASTERY_COMPLETED = 70;
export const MASTERY_MASTERED = 100;

export type LessonMasteryState = "not_started" | "learning" | "practicing" | "mastered";

export interface LessonMasteryInput {
  /** how many of the lesson's required steps are done */
  sectionsDone: number;
  /** total required steps in the lesson */
  requiredSections: number;
  /** lesson flipped to completed (all required steps + quiz >= 50%) */
  completed: boolean;
  /** best quiz score 0-100, or null if never attempted */
  quizBest: number | null;
  /** quiz attempts so far */
  attempts: number;
}

/**
 * Lesson mastery %, in explainable buckets:
 *  - 0   not started (no steps done, no quiz attempt)
 *  - 40  learning (some steps done, quiz not attempted)
 *  - 55  practicing (quiz attempted, lesson not yet completed)
 *  - 70  completed (every required step, quiz >= 50%)
 *  - 100 mastered (completed and best quiz score >= 80)
 */
export function lessonMasteryPct(input: LessonMasteryInput): number {
  const attempted = input.attempts > 0 || input.quizBest !== null;
  if (input.completed && (input.quizBest ?? 0) >= 80) return MASTERY_MASTERED;
  if (input.completed) return MASTERY_COMPLETED;
  if (attempted) return MASTERY_PRACTICING;
  if (input.sectionsDone > 0) return MASTERY_LEARNING;
  return MASTERY_NOT_STARTED;
}

export function lessonMasteryState(input: LessonMasteryInput): LessonMasteryState {
  const pct = lessonMasteryPct(input);
  if (pct >= MASTERY_MASTERED) return "mastered";
  if (pct >= MASTERY_PRACTICING) return "practicing";
  if (pct >= MASTERY_LEARNING) return "learning";
  return "not_started";
}

/**
 * Module mastery % = 70% from average lesson mastery + 30% from the best
 * module test score (0 if not taken). Lessons cap the module at 70% until
 * the assessment is attempted - the test is what certifies the whole.
 */
export function moduleMasteryPct(lessonPcts: number[], testBest: number | null): number {
  if (lessonPcts.length === 0) return 0;
  const avgLesson = lessonPcts.reduce((a, b) => a + b, 0) / lessonPcts.length;
  return Math.round(0.7 * avgLesson + 0.3 * (testBest ?? 0));
}

/** "1:05:15" or "50:01" style timestamp for video segments. */
export function formatTimestamp(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** "50:01–52:23" */
export function formatSegment(start: number, end: number): string {
  return `${formatTimestamp(start)}\u2013${formatTimestamp(end)}`;
}

export const MASTERY_LABELS: Record<LessonMasteryState, string> = {
  not_started: "Not started",
  learning: "Learning",
  practicing: "Practicing",
  mastered: "Mastered",
};

/** "8m 14s" - human-friendly segment/lesson duration. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
}

/** "00:48" / "02:22" - player timeline clock. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// -- Segment playlist timing (lesson-local timeline <-> source positions) --

export interface SegmentTiming {
  id: string;
  startSeconds: number; // absolute source position
  endSeconds: number;
  localStart: number; // position on the lesson timeline
  localDuration: number;
}

/**
 * Precompute the lesson-local timeline for a segment playlist. The Cognia
 * player always shows LESSON time, never the source video's full duration.
 */
export function segmentTimings(
  segments: { id: string; startSeconds: number; endSeconds: number }[],
): SegmentTiming[] {
  let cursor = 0;
  return segments.map((s) => {
    const timing: SegmentTiming = {
      id: s.id,
      startSeconds: s.startSeconds,
      endSeconds: s.endSeconds,
      localStart: cursor,
      localDuration: s.endSeconds - s.startSeconds,
    };
    cursor += timing.localDuration;
    return timing;
  });
}

/** Total lesson-local playback seconds. */
export function totalLessonSeconds(timings: SegmentTiming[]): number {
  const last = timings[timings.length - 1];
  return last ? last.localStart + last.localDuration : 0;
}

/** Map a source-video position to the lesson timeline (null if outside all segments). */
export function sourceToLocal(timings: SegmentTiming[], sourceSeconds: number): number | null {
  for (const t of timings) {
    if (sourceSeconds >= t.startSeconds && sourceSeconds < t.endSeconds) {
      return t.localStart + (sourceSeconds - t.startSeconds);
    }
  }
  return null;
}

/** Map a lesson-local position back to the source video. */
export function localToSource(
  timings: SegmentTiming[],
  localSeconds: number,
): { timing: SegmentTiming; sourceSeconds: number } | null {
  for (const t of timings) {
    if (localSeconds >= t.localStart && localSeconds < t.localStart + t.localDuration) {
      return { timing: t, sourceSeconds: t.startSeconds + (localSeconds - t.localStart) };
    }
  }
  return null;
}
