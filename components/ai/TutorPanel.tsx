"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface Turn {
  q: string;
  a: string;
}

/**
 * "Ask the tutor" - optional live-AI help about the current lesson.
 * When the AI assistant isn't configured on the server the panel says so honestly
 * instead of faking an answer.
 */
export function TutorPanel({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function ask() {
    const q = question.trim();
    if (q.length < 4) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, question: q }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok) {
        setStatus(data.error ?? "The tutor is unavailable right now.");
      } else if (data.answer) {
        setTurns((t) => [...t, { q, a: data.answer! }]);
        setQuestion("");
      }
    } catch {
      setStatus("Network error - the tutor couldn't be reached.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="mt-6 p-5">
      <div className="flex items-center gap-2">
        <Icon name="spark" size={16} className="text-volt-700 dark:text-volt-300" />
        <h2 className="font-display text-base font-bold text-ink">Ask the tutor</h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">about “{lessonTitle}”</span>
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        Live answers from the AI learning assistant when enabled on this server. It never marks work or changes scores.
      </p>

      {turns.map((t, i) => (
        <div key={i} className="mt-4 space-y-2">
          <p className="rounded-xl border border-void-700 bg-void-900/60 px-3 py-2 text-sm text-pulse-200">{t.q}</p>
          <p className="whitespace-pre-wrap rounded-xl border border-volt-400/25 bg-volt-400/5 px-3 py-2 text-sm leading-relaxed text-ink">
            {t.a}
          </p>
        </div>
      ))}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <label htmlFor="tutor-q" className="sr-only">
          Ask a question about this lesson
        </label>
        <input
          id="tutor-q"
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 600))}
          placeholder="e.g. Why does more data sometimes make the model worse?"
          className="min-w-0 flex-1 rounded-xl border border-void-700 bg-void-900 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus-ring"
          maxLength={600}
        />
        <Button type="submit" size="sm" loading={loading} disabled={question.trim().length < 4}>
          Ask
        </Button>
      </form>
      {status && (
        <p role="alert" className="mt-3 text-sm text-amber-600 dark:text-amber-300">
          {status}
        </p>
      )}
    </GlassCard>
  );
}
