"use client";

import { useState } from "react";
import type { FreeResponseDef } from "@/content/academy/types";
import { Button } from "@/components/ui/Button";
import { useLessonProgress, SignInToSaveNotice } from "./LessonProgressContext";

/**
 * The reasoning half of the lesson quiz: four written free-response
 * questions (7-10). Each is a deterministic, repo-versioned FRQ; the server
 * always runs a keyword rubric check and adds AI feedback when Gemini is
 * configured. A genuine attempt marks that FRQ's step done.
 */
interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
  nextStep: string;
  aiGenerated: boolean;
}

export function FreeResponseQuiz({
  lessonId,
  freeResponses,
}: {
  lessonId: string;
  freeResponses: FreeResponseDef[];
}) {
  const { signedIn } = useLessonProgress();
  const [index, setIndex] = useState(0);
  const fr = freeResponses[index] ?? null;

  return (
    <section
      aria-label="Written reasoning questions"
      className="rounded-xl border border-void-700/70 bg-void-900 px-5 py-5 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-volt-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-volt-700 dark:text-volt-300">
          Written reasoning
        </span>
        <span className="text-[11px] font-medium text-ink-faint">
          Questions 7–10 of the lesson quiz · feedback, not just grades
        </span>
      </div>

      {fr && (
        <>
          <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
            {freeResponses.map((f, i) => (
              <span
                key={f.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < index ? "bg-mint-500" : i === index ? "bg-volt-500" : "bg-void-700"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] font-semibold text-ink-faint">
            Question {index + 7} of 10
          </p>
          <FreeResponseItem key={fr.id} lessonId={lessonId} fr={fr} />
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-void-700/60 pt-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Previous question
            </Button>
            {index < freeResponses.length - 1 ? (
              <Button size="sm" onClick={() => setIndex((i) => i + 1)}>
                Next question
              </Button>
            ) : (
              <span className="text-xs text-ink-faint">Last question — review your feedback above.</span>
            )}
          </div>
        </>
      )}

      {!signedIn && (
        <div className="mt-5">
          <SignInToSaveNotice body="Signed-in students keep these answers saved across sessions - guests get the feedback, not the record." />
        </div>
      )}
    </section>
  );
}

function FreeResponseItem({ lessonId, fr }: { lessonId: string; fr: FreeResponseDef }) {
  const { markDone, reportLessonXp } = useLessonProgress();
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/free-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, frqId: fr.id, response: text }),
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
      markDone(fr.id);
      if (!data.guest) reportLessonXp(data.lessonXp);
    } catch {
      setError("Network problem - your answer wasn't submitted. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3">
      <p className="text-[15px] font-semibold leading-snug text-ink">{fr.prompt}</p>
      <p className="mt-1.5 text-sm text-ink-faint">{fr.guidance}</p>

      <label htmlFor={`fr-${fr.id}`} className="sr-only">
        Your answer
      </label>
      <textarea
        id={`fr-${fr.id}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitting}
        rows={5}
        maxLength={fr.maxLength}
        placeholder="Write your answer in your own words..."
        className="mt-3 w-full resize-y rounded-xl border border-void-700 bg-void-850 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus-ring disabled:opacity-60"
      />
      <div className="mt-1.5 text-[11px] text-ink-faint">
        {text.trim().length} / {fr.maxLength} characters
        {text.trim().length < fr.minLength && (
          <span className="ml-2">· aim for at least {fr.minLength}</span>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-400/50 bg-rose-400/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      {!feedback ? (
        <Button
          className="mt-3"
          onClick={submit}
          loading={submitting}
          disabled={text.trim().length < fr.minLength}
        >
          Submit for feedback
        </Button>
      ) : (
        <div aria-live="polite" className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-void-700/70 bg-void-850 px-4 py-3">
            <span className="font-display text-2xl font-bold text-pulse-600">{feedback.score}</span>
            <div className="text-xs leading-relaxed text-ink-dim">
              <p className="font-semibold text-ink">Feedback score (0-100)</p>
              <p>{feedback.aiGenerated ? "Keyword check + AI rubric review." : "Keyword-based review."}</p>
            </div>
          </div>
          {(
            [
              ["What you did well", feedback.strengths, "mint"],
              ["What to improve", feedback.improvements, "amber"],
              ["Concept to revisit", feedback.missingConcepts, "pulse"],
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
              <span className="font-semibold text-ink">Try again: </span>
              {feedback.nextStep}
            </p>
          )}
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
        </div>
      )}
    </div>
  );
}
