"use client";

import { useState } from "react";
import type { Checkpoint } from "@/content/academy/types";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup, OrderGroup, MatchGroup } from "./QuestionControls";

/**
 * The checkpoint interaction itself: prompt, answer controls, and the
 * why-feedback. Shared by two mount points so they always behave the same:
 *  - the in-video pause overlay (fired when playback reaches the checkpoint)
 *  - the checkpoint cards on the lesson sheet (answerable any time)
 * Answers are reported through onAnswered(correct).
 */
export function CheckpointQuestion({
  checkpoint,
  onAnswered,
  showScenario = true,
}: {
  checkpoint: Checkpoint;
  onAnswered: (correct: boolean) => void;
  showScenario?: boolean;
}) {
  const [choice, setChoice] = useState<number[]>([]);
  const [order, setOrder] = useState<number[] | null>(null);
  const [picks, setPicks] = useState<number[] | null>(null);
  const [answered, setAnswered] = useState(false);
  const [right, setRight] = useState(false);

  const isReady = (() => {
    switch (checkpoint.type) {
      case "choice":
      case "multi":
        return choice.length > 0;
      case "order":
        return true; // an arrangement always exists; the student engages by moving
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
          (order ?? checkpoint.items.map((_, i) => i)).length === checkpoint.correctOrder.length &&
          (order ?? checkpoint.items.map((_, i) => i)).every((v, i) => v === checkpoint.correctOrder[i]);
        break;
      case "match":
        correct =
          (picks ?? []).length === checkpoint.correct.length &&
          (picks ?? []).every((v, i) => v === checkpoint.correct[i]);
        break;
    }
    setRight(correct);
    setAnswered(true);
    onAnswered(correct);
  }

  return (
    <div>
      {showScenario && checkpoint.scenario && (
        <p className="rounded-lg border border-void-700/70 bg-void-850 px-4 py-3 text-sm italic leading-relaxed text-ink-dim">
          {checkpoint.scenario}
        </p>
      )}
      <p className="text-[15px] font-semibold leading-snug text-ink">{checkpoint.prompt}</p>

      {checkpoint.type === "choice" && (
        <ChoiceGroup
          label={checkpoint.prompt}
          options={checkpoint.options}
          selected={choice}
          onSelect={(v) => {
            if (answered) return;
            setChoice(v);
          }}
          disabled={answered}
          reveal={answered ? { correct: [checkpoint.correct] } : null}
        />
      )}
      {checkpoint.type === "multi" && (
        <ChoiceGroup
          label={checkpoint.prompt}
          options={checkpoint.options}
          selected={choice}
          onSelect={(v) => {
            if (answered) return;
            setChoice(v);
          }}
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
            if (answered) return;
            setOrder(next);
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
            if (answered) return;
            setPicks((prev) => {
              const base = prev ?? checkpoint.left.map(() => -1);
              const next = [...base];
              next[li] = ri;
              return next;
            });
          }}
          disabled={answered}
          revealCorrect={answered ? checkpoint.correct : null}
        />
      )}

      {!answered ? (
        <Button onClick={submit} disabled={!isReady} size="sm" className="mt-4">
          Check my answer
        </Button>
      ) : (
        <div className="mt-4">
          <div
            className={`rounded-lg border p-4 text-sm leading-relaxed ${
              right ? "border-mint-400/40 bg-mint-400/10" : "border-amber-400/40 bg-amber-400/10"
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
        </div>
      )}
    </div>
  );
}
