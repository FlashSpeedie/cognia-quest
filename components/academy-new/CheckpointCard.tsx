"use client";

import { useState } from "react";
import type { Checkpoint } from "@/content/academy/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ChoiceGroup, OrderGroup, MatchGroup } from "./QuestionControls";
import { useLessonProgress } from "./LessonProgressContext";

/**
 * Checkpoints - ungraded practice woven through the explanation.
 * The answer is never displayed up front: the student commits to a choice,
 * then gets feedback that explains WHY, and the step counts as done.
 * Retrying is always allowed - practice shouldn't punish.
 */
export function CheckpointCard({ checkpoint }: { checkpoint: Checkpoint }) {
  const { markDone, isDone, signedIn } = useLessonProgress();
  const [choice, setChoice] = useState<number[]>([]);
  const [order, setOrder] = useState<number[] | null>(null);
  const [picks, setPicks] = useState<number[] | null>(null);
  const [answered, setAnswered] = useState(false);
  const [right, setRight] = useState(false);

  const done = isDone(checkpoint.id);

  const isReady = (() => {
    switch (checkpoint.type) {
      case "choice":
      case "multi":
        return choice.length > 0;
      case "order":
        return order !== null; // an arrangement always exists; engagement = any move? require at least looking
      case "match":
        return (picks ?? checkpoint.left.map(() => -1)).every((p) => p >= 0);
    }
  })();

  function submit() {
    let correct = false;
    switch (checkpoint.type) {
      case "choice":
        correct = choice[0] === checkpoint.correct;
        break;
      case "multi":
        correct =
          choice.length === checkpoint.correct.length &&
          checkpoint.correct.every((c) => choice.includes(c));
        break;
      case "order":
        correct =
          (order ?? []).length === checkpoint.correctOrder.length &&
          (order ?? []).every((v, i) => v === checkpoint.correctOrder[i]);
        break;
      case "match":
        correct =
          (picks ?? []).length === checkpoint.correct.length &&
          (picks ?? []).every((v, i) => v === checkpoint.correct[i]);
        break;
    }
    setRight(correct);
    setAnswered(true);
    markDone(checkpoint.id);
  }

  function reset() {
    setAnswered(false);
    setChoice([]);
    setOrder(null);
    setPicks(null);
  }

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
        {done && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-mint-700 dark:text-mint-300">
            <Icon name="check" size={13} aria-hidden="true" /> Done
          </span>
        )}
      </div>

      {checkpoint.scenario && (
        <p className="mt-3 rounded-lg border border-void-700/70 bg-void-850 px-4 py-3 text-sm italic leading-relaxed text-ink-dim">
          {checkpoint.scenario}
        </p>
      )}
      <p className="mt-3 text-[15px] font-semibold leading-snug text-ink">{checkpoint.prompt}</p>

      {checkpoint.type === "choice" && (
        <ChoiceGroup
          label={checkpoint.prompt}
          options={checkpoint.options}
          selected={choice}
          onSelect={setChoice}
          disabled={answered}
          reveal={answered ? { correct: [checkpoint.correct] } : null}
        />
      )}
      {checkpoint.type === "multi" && (
        <ChoiceGroup
          label={checkpoint.prompt}
          options={checkpoint.options}
          selected={choice}
          onSelect={setChoice}
          multi
          disabled={answered}
          reveal={answered ? { correct: checkpoint.correct } : null}
        />
      )}
      {checkpoint.type === "order" && (
        <OrderGroup
          label={checkpoint.prompt}
          items={checkpoint.items}
          arrangement={order ?? checkpoint.items.map((_, i) => i)}
          onArrange={(next) => {
            setOrder(next);
            if (answered) setAnswered(false);
          }}
          disabled={answered}
          revealCorrect={answered ? checkpoint.correctOrder : null}
        />
      )}
      {checkpoint.type === "match" && (
        <MatchGroup
          label={checkpoint.prompt}
          left={checkpoint.left}
          right={checkpoint.right}
          picks={picks ?? checkpoint.left.map(() => -1)}
          onPick={(li, ri) => {
            setPicks((prev) => {
              const base = prev ?? checkpoint.left.map(() => -1);
              const next = [...base];
              next[li] = ri;
              return next;
            });
            if (answered) setAnswered(false);
          }}
          disabled={answered}
          revealCorrect={answered ? checkpoint.correct : null}
        />
      )}

      {!answered ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={!isReady} size="sm">
            Check my answer
          </Button>
          {!signedIn && (
            <span className="text-xs text-ink-faint">
              Practice is saved once you <a href="/login" className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300">sign in</a>.
            </span>
          )}
        </div>
      ) : (
        <div aria-live="polite" className="mt-4">
          <div
            className={`rounded-lg border p-4 text-sm leading-relaxed ${
              right
                ? "border-mint-400/40 bg-mint-400/10"
                : "border-amber-400/40 bg-amber-400/10"
            }`}
          >
            <p
              className={`font-bold ${
                right ? "text-mint-700 dark:text-mint-300" : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {right ? "Exactly right." : "Not quite."}
            </p>
            <p className="mt-1 text-ink-dim">{checkpoint.explanation}</p>
          </div>
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={reset}>
              Try again
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
