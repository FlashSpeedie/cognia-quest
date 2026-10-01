import type { AcademyLesson } from "../../types";

export const lesson4: AcademyLesson = {
  meta: {
    id: "m1-l4",
    slug: "regression-vs-classification",
    order: 4,
    title: "Regression vs. Classification",
    minutes: 15,
    segment: { chapter: 3, chapterTitle: "ML Basics", start: 3143, end: 3282 },
    summary:
      "Supervised learning splits into two flavors: predicting a number (regression) or predicting a category (classification).",
    goals: [
      "Distinguish continuous outputs from categorical outputs",
      "Explain regression and classification in your own words",
      "Map real-world problems to the right prediction type",
    ],
  },
  moduleId: "module-1",
  quizId: "quiz-m1-l4",
  intro: [
    {
      kind: "text",
      heading: "Two kinds of predictions",
      paragraphs: [
        "Once you know a problem is supervised - there are labeled examples to learn from - a second question immediately follows: what kind of answer does the model produce? A number, or a category?",
        "That single distinction splits supervised learning into its two great flavors: regression and classification. Get it right, and everything downstream - the algorithm you reach for, the metric you judge with - follows naturally.",
      ],
    },
  ],
  blocks: [
    {
      kind: "definition",
      term: "Regression",
      body: "Supervised learning where the target is a continuous numeric value - a price, a temperature, a duration. The model's answer is a number that could fall anywhere along a range.",
    },
    {
      kind: "definition",
      term: "Classification",
      body: "Supervised learning where the target is a category - spam or not spam, cat or dog, which letter of the alphabet. The model's answer is a label from a fixed set of possibilities.",
    },
    {
      kind: "text",
      heading: "A dollar amount or a verdict?",
      paragraphs: [
        "Predicting a house's sale price is regression. The answer is a dollar amount, and any value along a continuous range is possible: $312,000, $312,001.50, $418,750 - the model lands somewhere on the number line. The same is true for predicting tomorrow's temperature, a commute time in minutes, or next quarter's demand for a product.",
        "Detecting whether an email is spam is classification. There is no \"sort of spam, 62% spam\" as the final answer - the outcome is one of a fixed set of labels. Is this transaction fraudulent? Will this customer cancel their subscription? Which animal is in this photo - cat, dog, or rabbit? All classification: the model's job is to pick the right bucket.",
      ],
    },
    {
      kind: "diagram",
      id: "regression-vs-classification",
      caption:
        "Regression predicts a point on a continuous range. Classification picks one bucket from a fixed set.",
    },
    {
      kind: "callout",
      variant: "tip",
      title: "The 10-second test",
      body: "Ask: \"Is the answer a number that could take many values, or a name from a fixed set of categories?\" Number on a range - regression. Category from a list - classification.",
    },
    {
      kind: "text",
      heading: "The same data, two different questions",
      paragraphs: [
        "Here's the subtle part: the same underlying problem can often be framed either way, and the framing changes everything. A weather model could predict tomorrow's exact high temperature - regression - or simply forecast \"hot\", \"warm\", or \"cold\" - classification. A loan model could predict the probability a customer repays (a number between 0 and 1) or render a final verdict: approve or deny.",
        "Neither framing is wrong. But each requires different tools and is judged by different metrics - which is exactly why you'll learn separate metric families in the next lesson.",
      ],
    },
    {
      kind: "callout",
      variant: "think",
      title: "Think about it",
      body: "A hospital wants to predict patient risk. Version A outputs a risk score from 0 to 100. Version B outputs only \"high risk\" or \"low risk\". Which is regression and which is classification - and what might the hospital gain or lose by choosing one framing over the other?",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l4-cp1",
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
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l4-cp2",
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
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l4-cp3",
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
    },
  ],
  activity: {
    kind: "task-chooser",
    heading: "Activity - Choose the ML task",
    intro:
      "Six scenarios. For each, decide whether the right task is regression, classification, or unsupervised learning - then read the reasoning.",
  },
  freeResponse: {
    id: "fr-m1-l4",
    prompt:
      "A classmate says: \"Regression and classification are basically the same thing.\" Explain the key difference, and give one original example of each.",
    guidance: "Aim for 2-4 sentences. The words \"continuous\" and \"category\" are worth using.",
    expectedConcepts: [
      "continuous",
      "number",
      "category",
      "class",
      "label",
      "regression",
      "classification",
    ],
    rubric: [
      "States the distinction clearly: regression predicts a continuous numeric value; classification predicts a category from a fixed set",
      "Gives a correct original regression example",
      "Gives a correct original classification example",
    ],
    minLength: 80,
    maxLength: 1200,
  },
  requiredSectionIds: ["m1-l4-cp1", "m1-l4-cp2", "m1-l4-cp3", "m1-l4-activity", "m1-l4-quiz", "m1-l4-freeresponse"],
};
