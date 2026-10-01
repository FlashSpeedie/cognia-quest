import type { ReferenceEntry } from "../types";
import { MODULE_1 } from "./module";
import { LESSONS } from "./lessons";

/**
 * Module 1 references. The primary source is the external video this
 * module's lessons align to; it remains hosted by the original publisher.
 * Additional sources are only listed when actually used - nothing is
 * invented here.
 */

function segmentLabel(start: number, end: number): string {
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${m}:${String(sec).padStart(2, "0")}`;
  };
  return `${fmt(start)}\u2013${fmt(end)}`;
}

/** Module-level primary source plus per-lesson segment citations. */
export function moduleReferences(): ReferenceEntry[] {
  const v = MODULE_1.source;
  const primary: ReferenceEntry = {
    id: "ref-m1-primary",
    kind: "primary",
    label: "Primary video source",
    title: v.title,
    creator: `${v.creator} - original course creator, distributed through freeCodeCamp.org`,
    platform: v.platform,
    url: v.url,
    detail: "Chapters 1-5 (00:00-1:41:03) - externally hosted by the original publisher",
  };

  const lessonRefs: ReferenceEntry[] = LESSONS.map((l) => ({
    id: `ref-${l.meta.id}`,
    kind: "primary" as const,
    label: `Lesson ${l.meta.order} video segment`,
    title: l.meta.title,
    creator: v.creator,
    platform: v.platform,
    url: v.url,
    detail: `Chapter ${l.meta.segment.chapter} - ${l.meta.segment.chapterTitle} (${segmentLabel(
      l.meta.segment.start,
      l.meta.segment.end,
    )})`,
  }));

  return [primary, ...lessonRefs];
}

/** Per-lesson reference block (shown at the bottom of each lesson). */
export function lessonReferences(lessonId: string): ReferenceEntry[] {
  const v = MODULE_1.source;
  const lesson = LESSONS.find((l) => l.meta.id === lessonId);
  if (!lesson) return moduleReferences();
  return [
    {
      id: `ref-${lesson.meta.id}`,
      kind: "primary",
      label: "Primary video source",
      title: v.title,
      creator: v.creator,
      platform: v.platform,
      url: v.url,
      detail: `Chapter ${lesson.meta.segment.chapter} - ${
        lesson.meta.segment.chapterTitle
      } (${segmentLabel(lesson.meta.segment.start, lesson.meta.segment.end)})`,
    },
  ];
}

/** Human-readable segment range like "50:01-52:23". */
export function segmentRange(start: number, end: number): string {
  return segmentLabel(start, end);
}
