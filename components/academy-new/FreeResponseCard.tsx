"use client";

import { useState } from "react";
import type { FreeResponseDef } from "@/content/academy/types";
import { Button } from "@/components/ui/Button";
import { useLessonProgress, SignInToSaveNotice } from "./LessonProgressContext";

/**
 * Free response with AI rubric feedback ("What you did well" / "What could
 * be clearer" / "One idea to revisit" / "Try again"). The server always runs
 * a deterministic keyword check; Gemini, when enabled, adds richer feedback.
 * A genuine attempt marks the step done - the score here never gates XP.
 */
interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
  nextStep: string;
  aiGenerated: boolean;
}

export function FreeResponseCard({
  lessonId,
  freeResponse,
}: {
  lessonId: string;
  freeResponse: FreeResponseDef;
}) {
  const { markDone, isDone, signedIn, reportLessonXp } = useLessonProgress();
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const done = isDone(`${lessonId}-freeresponse`);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/free-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, response: text }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        feedback?: Feedback;
        error?: string;
        guest?: boolean;
        lessonXp?: { awarded: number; total: number; duplicate: boolean; leveledUp: { to: string; level: number } | null } | null;
      };
      if (!res.ok || !data.ok || !data.feedback) {
        setError(data.error ?? "We couldn't review that just now - try again in a moment.");
        return;
      }
      setFeedback(data.feedback);
      markDone(`${lessonId}-freeresponse`);
      if (!data.guest) reportLessonXp(data.lessonXp);
    } catch {
      setError("Network problem - your answer wasn't submitted. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-label="Free response question"
      className="rounded-xl border border-volt-400/30 bg-void-900 px-5 py-5 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-volt-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-volt-700 dark:text-volt-300">
          Explain it
        </span>
        <span className="text-[11px] font-medium text-ink-faint">Practice - feedback, not grades</span>
        {done && (
          <span className="ml-auto text-[11px] font-semibold text-mint-700 dark:text-mint-300">Submitted</span>
        )}
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug text-ink">{freeResponse.prompt}</p>
      <p className="mt-1.5 text-sm text-ink-faint">{freeResponse.guidance}</p>

      <label htmlFor={`fr-${lessonId}`} className="sr-only">
        Your answer
      </label>
      <textarea
        id={`fr-${lessonId}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitting}
        rows={5}
        maxLength={freeResponse.maxLength}
        placeholder="Write your answer in your own words..."
        className="mt-3 w-full resize-y rounded-xl border border-void-700 bg-void-850 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus-ring disabled:opacity-60"
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-faint">
        <span>
          {text.trim().length} / {freeResponse.maxLength} characters
          {text.trim().length < freeResponse.minLength && (
            <span className="ml-2">· aim for at least {freeResponse.minLength}</span>
          )}
        </span>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-400/50 bg-rose-400/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      <Button
        className="mt-3"
        onClick={submit}
        loading={submitting}
        disabled={text.trim().length < freeResponse.minLength}
      >
        Submit for feedback
      </Button>

      {feedback && (
        <div aria-live="polite" className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-void-700/70 bg-void-850 px-4 py-3">
            <span className="font-display text-2xl font-bold text-pulse-600">{feedback.score}</span>
            <div className="text-xs leading-relaxed text-ink-dim">
              <p className="font-semibold text-ink">Feedback score (0-100)</p>
              <p>
                {feedback.aiGenerated
                  ? "Keyword check + AI rubric review."
                  : "Keyword-based review."}
              </p>
            </div>
          </div>
          {(
            [
              ["What you did well", feedback.strengths, "mint"],
              ["What could be clearer", feedback.improvements, "amber"],
              ["One idea to revisit", feedback.missingConcepts, "pulse"],
            ] as const
          ).map(([title, items, tone]) =>
            items.length > 0 ? (
              <div
                key={title}
                className={`rounded-lg border px-4 py-3 ${
                  tone === "mint"
                    ? "border-mint-400/40 bg-mint-400/5"
                    : tone === "amber"
                      ? "border-amber-400/40 bg-amber-400/5"
                      : "border-pulse-400/40 bg-pulse-400/5"
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">{title}</p>
                <ul className="mt-1.5 space-y-1.5">
                  {items.map((s, i) => (
                    <li key={i} className="text-sm leading-relaxed text-ink-dim">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
          {feedback.nextStep && (
            <p className="rounded-lg border border-volt-400/40 bg-volt-400/5 px-4 py-3 text-sm text-ink-dim">
              <span className="font-semibold text-ink">Try this next: </span>
              {feedback.nextStep}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFeedback(null);
                setText("");
              }}
            >
              Write it again
            </Button>
            {feedback.missingConcepts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>
                Revise my answer
              </Button>
            )}
          </div>
        </div>
      )}

      {!signedIn && (
        <div className="mt-4">
          <SignInToSaveNotice body="Signed-in students keep this step saved across sessions - guests get the feedback, not the record." />
        </div>
      )}
    </section>
  );
}
