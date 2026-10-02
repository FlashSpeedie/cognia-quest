"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLessonProgress } from "./LessonProgressContext";

/**
 * The consistent Academy (New) section footer:
 *
 *   [← Back]                       [Next →]
 *
 * - Next marks a read-through section (Lesson Sheet, References) done on the
 *   server BEFORE navigating, so the next render already sees the persisted
 *   step and its lock state is correct.
 * - The Video section's Next is gated on every checkpoint being answered
 *   (the in-video pause-and-think moments), with an honest progress hint.
 */
export function SectionNav({
  backHref,
  backLabel,
  nextHref,
  nextLabel,
  markDoneSectionId,
  gateIds,
  gateHint,
}: {
  backHref: string | null;
  backLabel?: string | null;
  nextHref: string | null;
  nextLabel: string | null;
  /** server-persisted step to record before navigating (sheet/refs sections) */
  markDoneSectionId?: string | null;
  /** steps that must ALL be done before Next unlocks (video section) */
  gateIds?: string[] | null;
  /** helper text shown while the gate is not satisfied */
  gateHint?: string | null;
}) {
  const { markDone, isDone } = useLessonProgress();
  const [navigating, setNavigating] = useState(false);

  const gatesDone = (gateIds ?? []).every((id) => isDone(id));
  const gateTotal = gateIds?.length ?? 0;
  const gateAnswered = (gateIds ?? []).filter((id) => isDone(id)).length;

  async function goNext(e: React.MouseEvent) {
    e.preventDefault();
    if (!nextHref || navigating) return;
    if (gateIds && gateIds.length > 0 && !gatesDone) return;
    setNavigating(true);
    if (markDoneSectionId) await markDone(markDoneSectionId);
    window.location.assign(nextHref);
  }

  return (
    <nav
      aria-label="Section navigation"
      data-section-nav
      className="mt-10 flex items-center justify-between gap-4 border-t border-void-700/60 pt-5"
    >
      {backHref ? (
        <a
          href={backHref}
          aria-label={backLabel ? `Back to ${backLabel}` : "Back"}
          className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-4 py-2.5 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
        >
          <Icon name="arrow-left" size={15} aria-hidden="true" /> Back
        </a>
      ) : (
        <span aria-hidden="true" />
      )}

      <div className="flex min-w-0 flex-col items-end gap-1.5">
        {nextHref && (gatesDone || gateIds == null || gateIds.length === 0) ? (
          <a
            href={nextHref}
            onClick={goNext}
            aria-label={`Next section: ${nextLabel ?? "next"}`}
            data-next-section={nextLabel ?? undefined}
            className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
          >
            Next
            <span className="hidden font-normal opacity-80 sm:inline">: {nextLabel}</span>
            <Icon name="arrow-right" size={15} aria-hidden="true" />
          </a>
        ) : null}
        {nextHref && !gatesDone && gateIds != null && gateIds.length > 0 && (
          <button
            type="button"
            disabled
            aria-disabled="true"
            data-gated-next
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-void-700 px-4 py-2.5 text-sm font-semibold text-ink-faint"
          >
            Next
            <span className="hidden font-normal opacity-80 sm:inline">: {nextLabel}</span>
            <Icon name="arrow-right" size={15} aria-hidden="true" />
          </button>
        )}
        {gateIds != null && gateIds.length > 0 && !gatesDone && (
          <p className="max-w-56 text-right text-[11px] leading-relaxed text-ink-faint" role="status">
            {gateHint ?? "Complete this section to continue."} ({gateAnswered} of {gateTotal})
          </p>
        )}
        {navigating && (
          <p className="text-[11px] text-ink-faint" role="status">
            Saving your progress…
          </p>
        )}
      </div>
    </nav>
  );
}
