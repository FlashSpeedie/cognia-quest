import type { ReferenceEntry } from "../types";
import { MODULE_1 } from "./module";
import { LESSONS } from "./lessons";

/**
 * Module 1 references. The primary source is the external video this
 * module's lessons align to; it remains hosted by the original publisher.
 * Additional sources are only listed when actually used - nothing is
 * invented here.
 */

function fmt(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

/** Human-readable range like "50:01–52:23". */
export function segmentRange(start: number, end: number): string {
  return `${fmt(start)}\u2013${fmt(end)}`;
}

/** Module-level primary source plus every lesson's segment citations. */
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
    detail: "Chapters 1-5 - externally hosted by the original publisher",
  };

  const lessonRefs: ReferenceEntry[] = LESSONS.flatMap((l) =>
    l.video.segments.map((seg, i) => ({
      id: `ref-${seg.id}`,
      kind: "primary" as const,
      label:
        l.video.segments.length > 1
          ? `Lesson ${l.meta.order} video segment ${i + 1} of ${l.video.segments.length}`
          : `Lesson ${l.meta.order} video segment`,
      title: `${seg.label} (${l.meta.title})`,
      creator: v.creator,
      platform: v.platform,
      url: v.url,
      detail: `${seg.chapter} (${segmentRange(seg.startSeconds, seg.endSeconds)})`,
    })),
  );

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
      detail:
        lesson.video.segments.length === 1
          ? `${lesson.video.segments[0]!.chapter} - ${lesson.video.segments[0]!.label} (${segmentRange(
              lesson.video.segments[0]!.startSeconds,
              lesson.video.segments[0]!.endSeconds,
            )})`
          : lesson.video.segments
              .map(
                (s, i) =>
                  `Segment ${i + 1}: ${s.label} (${s.chapter}, ${segmentRange(s.startSeconds, s.endSeconds)})`,
              )
              .join(" · "),
    },
  ];
}
