"use client";

import { ScenarioSteps, type ScenarioStep } from "./ScenarioSteps";

const OPTIONS = ["Regression", "Classification", "Unsupervised"];

const STEPS: ScenarioStep[] = [
  {
    text: "Predict a house's sale price, in dollars, from its features.",
    options: OPTIONS,
    correct: 0,
    explanation:
      "Regression: the target is a continuous numeric value that could land anywhere along a range of prices.",
  },
  {
    text: "Decide whether a card transaction is fraudulent — a yes/no verdict for each one.",
    options: OPTIONS,
    correct: 1,
    explanation:
      "Classification: the answer is one of a fixed set of categories (fraudulent / legitimate).",
  },
  {
    text: "Discover what kinds of customers exist in a retailer's unlabeled shopping data.",
    options: OPTIONS,
    correct: 2,
    explanation:
      "Unsupervised: with no labels to predict, the task is revealing structure - clustering customers by similarity.",
  },
  {
    text: "Estimate a delivery order's arrival time, in minutes.",
    options: OPTIONS,
    correct: 0,
    explanation:
      "Regression: a duration in minutes is a continuous numeric target - any value in the range is possible.",
  },
  {
    text: "Label each incoming news article as politics, sports, or technology.",
    options: OPTIONS,
    correct: 1,
    explanation:
      "Classification: the model picks one label from a fixed set of categories.",
  },
  {
    text: "Flag factory sensor readings unlike any normal pattern — no labeled failures to learn from.",
    options: OPTIONS,
    correct: 2,
    explanation:
      "Unsupervised outlier detection: without labels, the model learns what normal looks like and flags the anomalies.",
  },
];

export function TaskChooser({ onComplete }: { onComplete?: () => void }) {
  return (
    <ScenarioSteps
      ariaLabel="Choose the ML task: regression, classification, or unsupervised"
      steps={STEPS}
      onComplete={() => onComplete?.()}
    />
  );
}
