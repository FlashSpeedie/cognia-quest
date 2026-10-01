"use client";

import { OrderingExercise } from "./ScenarioSteps";

const STEPS = [
  "Test the final model on the untouched test set",
  "Prepare the data (clean, gather, format examples)",
  "Split the data into training, validation and test sets",
  "Train a model on the training set",
  "Tune choices by comparing options on the validation set",
  "Evaluate: is the model good enough to deploy?",
];

// correct order: prepare, split, train, tune, test, evaluate
const CORRECT = [1, 2, 3, 4, 0, 5];

const HINTS: Record<string, string> = {
  "Prepare the data (clean, gather, format examples)": "Everything starts with usable examples.",
  "Split the data into training, validation and test sets": "Split before any learning happens, so held-out data stays untouched.",
  "Train a model on the training set": "Once the data is split, the model studies the training portion.",
  "Tune choices by comparing options on the validation set": "Development decisions go through the validation set - never the test set.",
  "Test the final model on the untouched test set": "The test set is opened exactly once, at the very end.",
  "Evaluate: is the model good enough to deploy?": "The final verdict, after the honest test score is in.",
};

export function WorkflowOrdering({ onComplete }: { onComplete?: () => void }) {
  return (
    <OrderingExercise
      ariaLabel="Put the machine learning workflow steps in the correct order"
      items={STEPS}
      correctOrder={CORRECT}
      perItemFeedback={STEPS.map((s) => HINTS[s] ?? "")}
      checkLabel="Check the workflow"
      onCorrect={() => onComplete?.()}
    />
  );
}
