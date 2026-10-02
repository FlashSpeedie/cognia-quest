"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * "Need a hand?" - the in-lesson learning assistant. Lazy-loaded so the
 * tutor's JavaScript never touches the initial page bundle; the Gemini call
 * happens only when a question is submitted (server-side, Module 1
 * grounded). Desktop opens a right-side help panel; mobile opens a bottom
 * sheet.
 *
 * The entry point is ONE floating pill, anchored to the bottom-right on
 * every breakpoint: 24px from the edges on desktop; 16px from the right on
 * mobile, lifted above the app's bottom navigation and safe-area aware so
 * it never covers the Next button, quiz controls or checkpoint panel.
 */
const TutorChat = dynamic(() => import("./TutorChat").then((m) => m.TutorChat), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 px-5 py-6 text-sm text-ink-faint" role="status">
      <Icon name="chat" size={15} /> Opening the learning assistant...
    </div>
  ),
});

export function TutorPanel({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating pill: fixed bottom-right, always reachable while reading */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-tutor-open
          aria-label="Open the learning assistant (Need a hand?)"
          className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full bg-volt-600 px-4 py-2.5 text-sm font-semibold text-white shadow-pop transition-transform hover:scale-105 focus-ring md:bottom-6 md:right-6"
        >
          <Icon name="chat" size={15} aria-hidden="true" /> Need a hand?
        </button>
      )}

      {/* Panel: right-side helper on desktop, bottom sheet on mobile */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-void-950/50 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Lesson learning assistant"
            className="absolute inset-x-0 bottom-0 flex max-h-[85vh] animate-fade-up flex-col overflow-hidden rounded-t-2xl border border-void-700 bg-void-900 shadow-pop focus-ring md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[410px] md:rounded-none md:rounded-l-2xl"
          >
            <div className="flex items-start justify-between border-b border-void-700/60 px-5 py-4">
              <div>
                <p className="font-display text-base font-bold text-ink">Need a hand?</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Ask about the concepts in this lesson. Answers stay inside Module 1.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the learning assistant"
                className="rounded-lg p-1.5 text-ink-faint hover:bg-void-800 hover:text-ink focus-ring"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <TutorChat lessonId={lessonId} lessonTitle={lessonTitle} />
          </div>
        </div>
      )}
    </>
  );
}
