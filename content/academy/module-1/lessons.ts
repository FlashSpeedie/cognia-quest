import type { AcademyLesson } from "../types";
import { lesson1 } from "./lessons/lesson-1";
import { lesson2 } from "./lessons/lesson-2";
import { lesson3 } from "./lessons/lesson-3";
import { lesson4 } from "./lessons/lesson-4";
import { lesson5 } from "./lessons/lesson-5";
import { lesson6 } from "./lessons/lesson-6";
import { lesson7 } from "./lessons/lesson-7";
import { lesson8 } from "./lessons/lesson-8";

/** All Module 1 lessons, in teaching order. Server-side content only. */
export const LESSONS: AcademyLesson[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
  lesson8,
];

export function lessonBySlug(slug: string): AcademyLesson | null {
  return LESSONS.find((l) => l.meta.slug === slug) ?? null;
}

export function lessonById(id: string): AcademyLesson | null {
  return LESSONS.find((l) => l.meta.id === id) ?? null;
}

/** Flat checkpoint list for a lesson, in video order (used by the player + progress service). */
export function checkpointsOf(lesson: AcademyLesson) {
  return [...lesson.checkpoints].sort((a, b) => a.timestampSeconds - b.timestampSeconds);
}

/**
 * Every section id the progress service accepts as a markable step:
 * the required completion steps plus optional enrichment interactions.
 */
export function markableStepIds(lesson: AcademyLesson): string[] {
  return [...lesson.requiredSectionIds, ...lesson.optionalSectionIds];
}
