"use client";

import { ScenarioSteps, type ScenarioStep } from "./ScenarioSteps";

const STEPS: ScenarioStep[] = [
  {
    text: "An email service quietly moves a message into the spam folder before you ever see it.",
    sub: "Email",
    options: ["Detection & safety", "Recommendations", "Prediction (forecasting)", "Language (NLP)"],
    correct: 0,
    explanation:
      "The model learned from labeled examples of spam vs. real mail to detect unwanted messages and keep your inbox safe. Classification for filtering = detection.",
  },
  {
    text: "A shopping app shows a \"You might also like\" row under the item you're viewing.",
    sub: "Retail",
    options: ["Detection & safety", "Recommendations", "Prediction (forecasting)", "Language (NLP)"],
    correct: 1,
    explanation:
      "Classic recommendation system: the model learned from examples of what people viewed and bought together to predict what you're likely to want next.",
  },
  {
    text: "A city transit authority estimates next week's ridership so it can plan schedules.",
    sub: "Transportation",
    options: ["Detection & safety", "Recommendations", "Prediction (forecasting)", "Language (NLP)"],
    correct: 2,
    explanation:
      "This is forecasting: a regression model learned from historical ridership (plus calendar and weather patterns) to predict a future numeric quantity.",
  },
  {
    text: "A phone turns your spoken words into text messages as you talk.",
    sub: "Assistants",
    options: ["Detection & safety", "Recommendations", "Prediction (forecasting)", "Language (NLP)"],
    correct: 3,
    explanation:
      "Speech-to-text is natural language processing - machine learning applied to human language, in this case converting audio into words.",
  },
  {
    text: "A bank texts \"Was this really you?\" seconds after an unusual purchase abroad.",
    sub: "Finance",
    options: ["Detection & safety", "Recommendations", "Prediction (forecasting)", "Language (NLP)"],
    correct: 0,
    explanation:
      "Fraud detection: a model learned patterns of normal vs. suspicious spending and flagged this transaction as an anomaly worth a human's attention.",
  },
  {
    text: "A music app builds a weekly mixtape of artists you've never heard yet somehow like.",
    sub: "Entertainment",
    options: ["Detection & safety", "Recommendations", "Prediction (forecasting)", "Language (NLP)"],
    correct: 1,
    explanation:
      "Another recommendation system - it learned your taste from listening examples (and listeners similar to you) to predict what you'll enjoy.",
  },
];

export function ApplicationsSpotter({ onComplete }: { onComplete?: () => void }) {
  return (
    <ScenarioSteps
      ariaLabel="Spot the machine learning: match each product to the application category"
      steps={STEPS}
      onComplete={() => onComplete?.()}
    />
  );
}
