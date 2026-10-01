"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * "Ask about this lesson" - lazy-loaded so the tutor's JavaScript never
 * touches the initial page bundle. The chat itself calls the grounded
 * Module 1 tutor API (server-side Gemini, knowledge-base retrieval).
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

  return (
    <section aria-label="Lesson learning assistant" className="mt-10">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-4 rounded-xl border border-volt-400/40 bg-void-900 px-5 py-4 text-left shadow-card transition-colors hover:border-volt-400/70 focus-ring"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-volt-400/15 text-volt-600 dark:text-volt-300"
          >
            <Icon name="chat" size={20} />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-bold text-ink">Ask about this lesson</span>
            <span className="mt-0.5 block truncate text-sm text-ink-dim">
              Get help using the concepts covered in this module.
            </span>
          </span>
          <Icon name="arrow-right" size={16} className="ml-auto shrink-0 text-ink-faint" aria-hidden="true" />
        </button>
      ) : (
        <div className="rounded-xl border border-volt-400/40 bg-void-900 shadow-card">
          <div className="flex items-center justify-between border-b border-void-700/60 px-5 py-3.5">
            <div>
              <p className="font-display text-sm font-bold text-ink">Ask about this lesson</p>
              <p className="text-xs text-ink-faint">Grounded in Module 1: {lessonTitle}</p>
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
      )}
    </section>
  );
}
