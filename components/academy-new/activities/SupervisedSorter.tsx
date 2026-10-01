"use client";

import { ScenarioSteps, type ScenarioStep } from "./ScenarioSteps";

const STEPS: ScenarioStep[] = [
  {
    text: "A spam filter is trained on 100,000 emails that real users already marked as \"spam\" or \"not spam\".",
    sub: "Spam detection",
    options: ["Supervised", "Unsupervised"],
    correct: 0,
    explanation:
      "Supervised: the training examples carry known target labels (spam / not spam) produced by humans. The model learns the mapping from each email's features to that label.",
  },
  {
    text: "A model studies past home sales - size, age, location - each with the final price the house actually sold for.",
    sub: "House prices",
    options: ["Supervised", "Unsupervised"],
    correct: 0,
    explanation:
      "Supervised: every example includes the correct answer (the sale price) as its target. The model learns how the features relate to that price.",
  },
  {
    text: "A retailer asks a model to organize its customers into natural groups - nobody has defined what the groups should be.",
    sub: "Customer segments",
    options: ["Supervised", "Unsupervised"],
    correct: 1,
    explanation:
      "Unsupervised clustering: there are no labels to learn from, so the model's job is to reveal structure - groups of similar customers - directly from the data.",
  },
  {
    text: "A store wants its thousands of products grouped so similar ones sit together online - no category list exists yet.",
    sub: "Product grouping",
    options: ["Supervised", "Unsupervised"],
    correct: 1,
    explanation:
      "Unsupervised clustering again: the groups emerge from similarity in the data rather than from any predefined answer key.",
  },
  {
    text: "A bank wants suspicious transactions flagged. It has millions of transactions but no confirmed list of which ones were fraud.",
    sub: "Anomaly detection",
    options: ["Supervised", "Unsupervised"],
    correct: 1,
    explanation:
      "Unsupervised outlier detection: with no fraud labels, the model learns what \"normal\" looks like and flags transactions unlike any learned normal pattern.",
  },
];

export function SupervisedSorter({ onComplete }: { onComplete?: () => void }) {
  return (
    <ScenarioSteps
      ariaLabel="Supervised or unsupervised? Decide for each of five situations"
      steps={STEPS}
      onComplete={() => onComplete?.()}
    />
  );
}
