"use client";

import type { Checkpoint } from "@/content/academy/types";
import { Icon } from "@/components/ui/Icon";
import { formatClock } from "@/lib/academy";
import { CheckpointQuestion } from "./CheckpointQuestion";
import { useLessonProgress } from "./LessonProgressContext";

/**
 * Checkpoint card on the lesson sheet. Checkpoints are authored to fire at
 * exact moments during the video (the overlay pauses playback); the same
 * question is answerable here any time - the two views share state, so
 * answering in one marks it done in both.
 */
export function CheckpointCard({ checkpoint }: { checkpoint: Checkpoint }) {
  const { checkpointResults, recordCheckpoint, signedIn, isDone } = useLessonProgress();
  const result = checkpointResults[checkpoint.id];
  // Answered in-session (we know correctness) or persisted from the server
  // (we only know it was answered) - both count as done.
  const done = !!result?.answered || isDone(checkpoint.id);

  return (
    <section
      id={checkpoint.id}
      aria-label={`Checkpoint: ${checkpoint.concept}`}
      className="rounded-xl border border-volt-400/30 bg-void-900 px-5 py-5 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-volt-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-volt-700 dark:text-volt-300">
          Checkpoint
        </span>
        <span className="text-[11px] font-medium text-ink-faint">{checkpoint.concept}</span>
        <span className="font-mono text-[11px] text-ink-faint">
          at {formatClock(checkpoint.timestampSeconds)}
        </span>
        {done && (
          <span
            className={`ml-auto flex items-center gap-1 text-[11px] font-semibold ${
              result?.correct ? "text-mint-700 dark:text-mint-300" : "text-amber-700 dark:text-amber-300"
            }`}
          >
            <Icon name={result?.correct ? "check" : "brain"} size={13} aria-hidden="true" />
            {result?.correct ? "Answered correctly" : "Answered"}
          </span>
        )}
      </div>
      <div className="mt-3">
        <CheckpointQuestion checkpoint={checkpoint} onAnswered={(correct) => recordCheckpoint(checkpoint.id, correct)} />
      </div>
      {!signedIn && (
        <p className="mt-3 text-xs text-ink-faint">
          Practice is saved once you{" "}
          <a href="/login" className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300">
            sign in
          </a>
          .
        </p>
      )}
    </section>
  );
}
