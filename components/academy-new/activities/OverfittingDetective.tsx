"use client";

import { ScenarioSteps, type ScenarioStep } from "./ScenarioSteps";

const OPTIONS = ["Underfitting", "Reasonable fit", "Overfitting"];

const STEPS: ScenarioStep[] = [
  {
    text: "Training accuracy: 55%. Test accuracy: 54%. Other teams on the same task reach 95%.",
    sub: "Model A",
    options: OPTIONS,
    correct: 0,
    explanation:
      "Underfitting: there's barely any gap, but both scores are poor - the model is too simple to capture even the real pattern. It hasn't memorized anything; it never learned enough in the first place.",
  },
  {
    text: "Training accuracy: 92%. Test accuracy: 88%.",
    sub: "Model B",
    options: OPTIONS,
    correct: 1,
    explanation:
      "A reasonable fit: strong performance on unseen data with only a small gap between training and test. This is what a healthy model looks like.",
  },
  {
    text: "Training accuracy: 99%. Test accuracy: 61%.",
    sub: "Model C",
    options: OPTIONS,
    correct: 2,
    explanation:
      "Overfitting: near-perfect on the data it studied, weak on data it never saw. That 38-point gap is the classic fingerprint of a model that memorized its sample - noise included.",
  },
  {
    text: "Training accuracy: 68%. Test accuracy: 67%. The best models on this task consistently reach 93%+.",
    sub: "Model D",
    options: OPTIONS,
    correct: 0,
    explanation:
      "Underfitting again - the gap is tiny, which means the model is steady... but both scores sit far below what the task supports. Too rigid to find the pattern: high bias made visible.",
  },
];

export function OverfittingDetective({ onComplete }: { onComplete?: () => void }) {
  return (
    <ScenarioSteps
      ariaLabel="Overfitting detective: classify each model scenario"
      steps={STEPS}
      onComplete={() => onComplete?.()}
    />
  );
}
