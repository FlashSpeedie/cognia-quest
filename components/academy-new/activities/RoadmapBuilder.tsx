"use client";

import { OrderingExercise } from "./ScenarioSteps";

const LAYERS = ["Applications", "Evaluation", "Data", "Machine learning", "Statistics & mathematics"];
// correct bottom-to-top: Data, Statistics & mathematics, Machine learning, Evaluation, Applications
const CORRECT = [2, 4, 3, 1, 0];

const HINTS: Record<string, string> = {
  Data: "The raw material - everything else depends on it, so it comes first.",
  "Statistics & mathematics": "The tools for reasoning about data - right above the data itself.",
  "Machine learning": "The algorithms that find the patterns, once you can reason about the data.",
  Evaluation: "The honesty layer - only after a model exists can you ask if it works.",
  Applications: "Models meeting real people - the top of the stack.",
};

export function RoadmapBuilder({ onComplete }: { onComplete?: () => void }) {
  return (
    <OrderingExercise
      ariaLabel="Build the machine learning stack from the bottom layer to the top"
      items={LAYERS}
      correctOrder={CORRECT}
      perItemFeedback={LAYERS.map((l) => HINTS[l] ?? "")}
      checkLabel="Check the stack"
      onCorrect={() => onComplete?.()}
    />
  );
}
