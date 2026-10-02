import type { AcademyLesson } from "../../types";
import { LESSON_SEGMENTS } from "../module";

export const lesson4: AcademyLesson = {
  meta: {
    id: "m1-l4",
    slug: "regression-vs-classification",
    order: 4,
    title: "Regression vs. Classification",
    minutes: 15,
    summary:
      "Supervised learning splits into two flavors: predicting a number (regression) or predicting a category (classification).",
    goals: [
      "Distinguish continuous outputs from categorical outputs",
      "Explain regression and classification in your own words",
      "Map real-world problems to the right prediction type",
    ],
  },
  moduleId: "module-1",
  video: { segments: LESSON_SEGMENTS["m1-l4"]! },
  sheet: {
    coreIdea: [
      "Once you know a problem is supervised - there are labeled examples to learn from - a second question immediately follows: what kind of answer does the model produce? A number, or a category?",
      "That single distinction splits supervised learning into its two great flavors: regression and classification. Get it right, and everything downstream - the algorithm you reach for, the metric you judge with - follows naturally.",
    ],
    vocabulary: [
      {
        term: "Regression",
        body: "Supervised learning where the target is a continuous numeric value - a price, a temperature, a duration. The model's answer is a number that could fall anywhere along a range.",
      },
      {
        term: "Classification",
        body: "Supervised learning where the target is a category - spam or not spam, cat or dog, which letter of the alphabet. The model's answer is a label from a fixed set of possibilities.",
      },
      {
        term: "Continuous value",
        body: "A quantity that can take any value along a range - $312,000, 22.5 minutes, 84 megawatt-hours.",
      },
      {
        term: "The 10-second test",
        body: "\"Is the answer a number that could take many values, or a name from a fixed set of categories?\" Number on a range - regression. Category from a list - classification.",
      },
    ],
    concepts: [
      {
        title: "A dollar amount or a verdict?",
        body: [
          "Predicting a house's sale price is regression. The answer is a dollar amount, and any value along a continuous range is possible: $312,000, $312,001.50, $418,750. The same is true for predicting tomorrow's temperature, a commute time in minutes, or next quarter's demand for a product.",
          "Detecting whether an email is spam is classification. There is no \"sort of spam, 62% spam\" as the final answer - the outcome is one of a fixed set of labels. Is this transaction fraudulent? Will this customer cancel their subscription? Which animal is in this photo - cat, dog, or rabbit? All classification: the model's job is to pick the right bucket.",
        ],
        diagramId: "regression-vs-classification",
      },
      {
        title: "The same data, two different questions",
        body: [
          "Here's the subtle part: the same underlying problem can often be framed either way, and the framing changes everything. A weather model could predict tomorrow's exact high temperature - regression - or simply forecast \"hot\", \"warm\", or \"cold\" - classification. A loan model could predict the probability a customer repays (a number between 0 and 1) or render a final verdict: approve or deny.",
          "Neither framing is wrong. But each requires different tools and is judged by different metrics - which is exactly why Lesson 5 teaches separate metric families.",
        ],
      },
    ],
    example: {
      title: "One delivery app, two framings",
      body: [
        "Product wants to show customers an arrival window like \"28-34 minutes\": a continuous duration - regression.",
        "Support wants to flag orders as \"on time\" or \"late\": one of two fixed categories - classification.",
        "Same underlying data, two valid framings - and the framing decides the tools and the evaluation.",
      ],
    },
    commonConfusion: {
      title: "Regression vs. classification",
      body: "The mix-up usually sounds like: \"a risk score from 0 to 100 must be classification because it buckets people.\" Check the output, not the purpose. Any answer that lands anywhere on a numeric range - a price, minutes, a score - is regression. Only when the answer must be one of a fixed set of named buckets is it classification. You can always convert a regression output into buckets afterwards; you can't recover the exact number from the buckets.",
    },
    thinkAboutIt:
      "A hospital wants to predict patient risk. Version A outputs a risk score from 0 to 100. Version B outputs only \"high risk\" or \"low risk\". Which is regression and which is classification - and what might the hospital gain or lose by choosing one framing over the other?",
    keyTakeaways: [
      "Regression predicts a continuous numeric value; classification picks one label from a fixed set.",
      "The 10-second test: number on a range, or category from a list?",
      "The same problem can often be framed either way - and the framing changes the tools and metrics.",
      "House prices, temperatures and durations are regression; spam verdicts and diagnoses are classification.",
    ],
    sourceConnection:
      "This lesson plays the source segment 52:23\u201354:42 (Chapter 3 — ML Basics), where LunarTech separates regression (continuous outputs like house-price prediction) from classification (categorical outputs like spam/not-spam).",
  },
  checkpoints: [
    {
      id: "m1-l4-cp1",
      segmentId: "m1-l4-s1",
      timestampSeconds: 45,
      type: "choice",
      concept: "Regression",
      scenario:
        "A power company trains a model on years of hourly records - weather, calendar, past demand - to predict tomorrow's total electricity demand in megawatt-hours.",
      prompt: "Which type of supervised task is this?",
      options: [
        "Classification - the answer is a category",
        "Regression - the answer is a continuous number",
        "Clustering - the data is unlabeled",
        "Outlier detection - unusual days matter most",
      ],
      correct: 1,
      explanation:
        "The model's output is a quantity (megawatt-hours) that can take any value in a range - a continuous numeric target. That makes it regression. The training data is labeled (actual demand is known for past hours), so it is supervised.",
    },
    {
      id: "m1-l4-cp2",
      segmentId: "m1-l4-s1",
      timestampSeconds: 95,
      type: "choice",
      concept: "Classification",
      scenario:
        "A lab trains a model on cell images that specialists have already diagnosed, so it can output \"benign\" or \"malignant\" for new images.",
      prompt: "Which type of supervised task is this?",
      options: [
        "Regression - it produces a diagnosis",
        "Classification - it picks from a fixed set of categories",
        "Clustering - images have no labels",
        "Regression - images are numeric data",
      ],
      correct: 1,
      explanation:
        "The output is one of two fixed labels - benign or malignant - chosen from a predefined set. Labeled training examples (specialist diagnoses) make it supervised; the categorical target makes it classification.",
    },
    {
      id: "m1-l4-cp3",
      segmentId: "m1-l4-s1",
      timestampSeconds: 128,
      type: "choice",
      concept: "Choosing the right framing",
      scenario:
        "A food-delivery app is designing a model. Product wants it to show customers an arrival window like \"28-34 minutes\". Support wants it to flag orders as \"on time\" or \"late\".",
      prompt: "Which combination is correct?",
      options: [
        "Both are classification - times are categories",
        "Both are regression - times are numbers",
        "The arrival window is regression; the on-time flag is classification",
        "The arrival window is classification; the on-time flag is regression",
      ],
      correct: 2,
      explanation:
        "Predicting a duration in minutes is a continuous numeric target - regression. \"On time or late\" reduces the answer to one of two fixed categories - classification. Same underlying data, two valid framings.",
    },
  ],
  activity: {
    kind: "task-chooser",
    heading: "Optional exercise — Choose the ML task",
    intro:
      "Six scenarios. For each, decide whether the right task is regression, classification, or unsupervised learning - then read the reasoning.",
  },
  quizId: "quiz-m1-l4",
  freeResponses: [
    {
      id: "fr-m1-l4-1",
      prompt:
        "A classmate says: \"Regression and classification are basically the same thing.\" Explain the key difference, and give one original example of each.",
      guidance: "Aim for 2-4 sentences. The words \"continuous\" and \"category\" are worth using.",
      expectedConcepts: ["continuous", "number", "category", "class", "label", "regression", "classification"],
      rubric: [
        "States the distinction clearly: regression predicts a continuous numeric value; classification predicts a category from a fixed set",
        "Gives a correct original regression example",
        "Gives a correct original classification example",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l4-2",
      prompt:
        "Apply the 10-second test to these three problems and say which are regression and which are classification, with a one-line reason each: (a) predicting a bus's arrival time in minutes, (b) deciding if a photo shows a cat, a dog, or a rabbit, (c) estimating how many tickets a movie will sell on opening weekend.",
      guidance: "Aim for 3-4 sentences. Ask: number on a range, or name from a list?",
      expectedConcepts: ["regression", "classification", "number", "category", "continuous", "label"],
      rubric: [
        "Correctly identifies (a) as regression - a continuous duration",
        "Correctly identifies (b) as classification - a fixed set of animal labels",
        "Correctly identifies (c) as regression - a count along a range",
      ],
      minLength: 100,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l4-3",
      prompt:
        "Explain why predicting tomorrow's exact temperature and forecasting \"hot / warm / cold\" are different machine learning tasks even though they use the same weather data. What changes for the model?",
      guidance: "Aim for 2-3 sentences. Think about the output type and what the model has to produce.",
      expectedConcepts: ["regression", "classification", "framing", "continuous", "category", "tools"],
      rubric: [
        "Identifies exact temperature as regression and the bucket forecast as classification",
        "Explains that the output type changes (number vs. fixed labels)",
        "Notes the downstream effect: different tools or metrics",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l4-4",
      prompt:
        "Invent a real-world problem that could reasonably be framed as EITHER regression or classification. Describe both framings and say which one you would choose for a first version, and why.",
      guidance: "Aim for 3-4 sentences. Any domain works - sports, cooking, school, gaming.",
      expectedConcepts: ["regression", "classification", "framing", "number", "category", "decision"],
      rubric: [
        "Presents a plausible problem with both framings",
        "Regression framing predicts a continuous value; classification framing predicts fixed categories",
        "Gives a reasoned choice for the first version",
      ],
      minLength: 100,
      maxLength: 1200,
    },
  ],
  requiredSectionIds: [
    "m1-l4-cp1",
    "m1-l4-cp2",
    "m1-l4-cp3",
    "m1-l4-quiz",
    "fr-m1-l4-1",
    "fr-m1-l4-2",
    "fr-m1-l4-3",
    "fr-m1-l4-4",
  ],
  optionalSectionIds: ["m1-l4-activity"],
};
