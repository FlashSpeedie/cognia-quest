"use client";

import { useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * The grounded Module 1 tutor chat. Calls POST /api/academy/tutor, which:
 * - runs Gemini server-side (key + prompts never reach the browser)
 * - retrieves only relevant Module 1 knowledge chunks per question
 * - refuses to answer active graded assessment questions
 * - returns the answer plus lesson source references, rendered here as
 *   clickable links that open the lesson at the exact source segment (?t=).
 */

interface TutorSource {
  lessonId: string;
  chapter: number;
  start: number;
  end: number;
}

interface Turn {
  role: "student" | "tutor";
  text: string;
  sources?: TutorSource[];
  segmentLabel?: string | null;
  failed?: boolean;
}

const MAX_QUESTION = 600;

const SUGGESTIONS = [
  "Explain this simply",
  "Give me an example",
  "What's the difference?",
  "Help me review",
];

export function TutorChat({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);
    setTurns((t) => [...t, { role: "student", text: trimmed }]);
    setQuestion("");
    try {
      const res = await fetch("/api/academy/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: "module-1", lessonId, question: trimmed }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        answer?: string;
        sources?: TutorSource[];
        segmentLabel?: string | null;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.answer) {
        setTurns((t) => [
          ...t,
          {
            role: "tutor",
            failed: true,
            text: data.error ?? "Your question could not be answered right now. Please try again.",
          },
        ]);
      } else {
        setTurns((t) => [
          ...t,
          { role: "tutor", text: data.answer!, sources: data.sources ?? [], segmentLabel: data.segmentLabel ?? null },
        ]);
      }
    } catch {
      setTurns((t) => [
        ...t,
        { role: "tutor", failed: true, text: "Network problem - please try again." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(question);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {turns.length === 0 && (
        <div className="px-5 pt-4">
          <p className="text-sm text-ink-dim">
            Ask anything about this lesson: {lessonTitle}. The tutor only uses what Module 1 teaches.
          </p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-ink-faint">Try asking</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => void ask(s)}
                className="rounded-full border border-void-700 bg-void-850 px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-volt-400/60 hover:text-ink focus-ring disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4"
        aria-live="polite"
      >
        {turns.map((t, i) =>
          t.role === "student" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-xl rounded-br-sm bg-pulse-600 px-4 py-2.5 text-sm text-white shadow-card">
                {t.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div
                className={`max-w-[92%] rounded-xl rounded-bl-sm border px-4 py-3 text-sm leading-relaxed shadow-card ${
                  t.failed ? "border-amber-400/40 bg-amber-400/10 text-ink-dim" : "border-void-700/70 bg-void-850 text-ink-dim"
                }`}
              >
                {t.text}
                {t.sources && t.sources.length > 0 && (
                  <div className="mt-3 border-t border-void-700/60 pt-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                      Related lesson
                    </p>
                    <ul className="mt-1 space-y-1.5">
                      {t.sources.slice(0, 2).map((s) => (
                        <li key={`${s.lessonId}-${s.start}`}>
                          <a
                            href={`/academy-new/module/1/lesson/${LESSON_SLUGS[s.lessonId] ?? ""}?t=${s.start}`}
                            className="text-xs font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300"
                          >
                            {LESSON_TITLES[s.lessonId] ?? s.lessonId}
                          </a>
                          <span className="ml-1.5 font-mono text-[11px] text-ink-faint">
                            · source {formatSeg(s.start)}–{formatSeg(s.end)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ),
        )}
        {loading && (
          <p className="flex items-center gap-2 text-sm text-ink-faint" role="status">
            <Icon name="brain" size={15} aria-hidden="true" /> Thinking through the lesson material...
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-void-700/60 px-5 py-3.5">
        {error && (
          <p role="alert" className="mb-2 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="tutor-question" className="sr-only">
            Your question about {lessonTitle}
          </label>
          <textarea
            id="tutor-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask(question);
              }
            }}
            rows={2}
            placeholder="Ask anything about this lesson..."
            className="min-h-11 flex-1 resize-none rounded-lg border border-void-700 bg-void-850 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-ring"
          />
          <button
            type="submit"
            disabled={loading || question.trim().length < 4}
            aria-label="Send question"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-volt-600 text-white transition-colors hover:bg-volt-700 focus-ring disabled:opacity-40"
          >
            <Icon name="arrow-right" size={17} />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-ink-faint">
          Answers stay inside Module 1, and the tutor never shares graded quiz or test answers.
        </p>
      </form>
    </div>
  );
}

function formatSeg(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Lightweight display data for source links (kept in sync with the module).
const LESSON_SLUGS: Record<string, string> = {
  "m1-l1": "welcome-to-machine-learning",
  "m1-l2": "the-ml-roadmap",
  "m1-l3": "supervised-vs-unsupervised",
  "m1-l4": "regression-vs-classification",
  "m1-l5": "how-do-we-know-a-model-is-working",
  "m1-l6": "training-validation-and-testing",
  "m1-l7": "bias-and-variance",
  "m1-l8": "overfitting-and-generalization",
};

const LESSON_TITLES: Record<string, string> = {
  "m1-l1": "Lesson 1 - Welcome to Machine Learning",
  "m1-l2": "Lesson 2 - The Machine Learning Roadmap",
  "m1-l3": "Lesson 3 - Supervised vs. Unsupervised Learning",
  "m1-l4": "Lesson 4 - Regression vs. Classification",
  "m1-l5": "Lesson 5 - How Do We Know a Model Is Working?",
  "m1-l6": "Lesson 6 - Training, Validation, and Testing",
  "m1-l7": "Lesson 7 - Bias and Variance",
  "m1-l8": "Lesson 8 - Overfitting and Generalization",
};
