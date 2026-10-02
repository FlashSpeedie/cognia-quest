"use client";

import { ScenarioSteps, type ScenarioStep } from "./ScenarioSteps";

const OPTIONS = ["Recall", "Precision", "F1 score", "MAE", "RMSE"];

const STEPS: ScenarioStep[] = [
  {
    text: "You built a spam detector. Missing spam is especially costly - you want to catch as much of it as possible, even if some real mail gets flagged along the way.",
    options: OPTIONS,
    correct: 0,
    explanation:
      "Recall measures coverage of the real cases: of all the actual spam, how much did the filter catch? When misses are the expensive mistake, recall is the metric to watch.",
  },
  {
    text: "Your price model's team asks: \"On average, how many dollars off are our estimates?\" - with every dollar of error counting equally.",
    options: OPTIONS,
    correct: 3,
    explanation:
      "MAE is the average miss size in the target's own units, treating all errors proportionally - exactly the \"average miss in dollars\" question.",
  },
  {
    text: "You forecast electricity demand for a power grid. A few huge misses are far worse than many small, steady ones.",
    options: OPTIONS,
    correct: 4,
    explanation:
      "RMSE squares errors before averaging, so large misses count disproportionately hard - the right lens when being wildly wrong occasionally is the nightmare scenario.",
  },
  {
    text: "Your inbox filter is working, but the loudest complaints are about legitimate email landing in spam. When the filter says \"spam\", it should be right.",
    options: OPTIONS,
    correct: 1,
    explanation:
      "Precision measures the correctness of the flagged set: of everything flagged, how much really deserved it? Fewer false alarms = higher precision.",
  },
  {
    text: "You want one balanced number that rewards a classifier only when it's both precise and thorough - never just one of the two.",
    options: OPTIONS,
    correct: 2,
    explanation:
      "The F1 score combines precision and recall into a single number that is high only when both are high - the balance metric.",
  },
];

export function MetricDetective({ onComplete }: { onComplete?: () => void }) {
  return (
    <ScenarioSteps
      ariaLabel="Metric detective: pick the evaluation metric that fits each situation"
      steps={STEPS}
      onComplete={() => onComplete?.()}
    />
  );
}
