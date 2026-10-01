import type { AcademyLesson } from "../../types";

export const lesson5: AcademyLesson = {
  meta: {
    id: "m1-l5",
    slug: "how-do-we-know-a-model-is-working",
    order: 5,
    title: "How Do We Know a Model Is Working?",
    minutes: 25,
    segment: { chapter: 3, chapterTitle: "ML Basics", start: 3282, end: 3702 },
    summary:
      "Metrics are the scoreboard. Learn what accuracy, precision, recall, F1, RMSE, MAE and clustering scores are actually asking.",
    goals: [
      "Explain what an evaluation metric is for",
      "Interpret accuracy, precision, recall and F1 for classification",
      "Interpret MSE, RMSE and MAE for regression",
      "Recognize quality measures used for clustering",
      "Choose a metric based on what a mistake costs",
    ],
  },
  moduleId: "module-1",
  quizId: "quiz-m1-l5",
  intro: [
    {
      kind: "text",
      heading: "A number that tells the truth",
      paragraphs: [
        "Two people looking at the same model can honestly disagree about whether it \"works\" - unless there's a number everyone trusts. Evaluation metrics are that number: standard measures that turn a model's performance into something comparable, communicable and honest.",
        "There is no single best metric, because different mistakes cost different amounts in different situations. The skill is knowing which question each metric answers - and matching it to the mistake you most need to avoid.",
      ],
    },
  ],
  blocks: [
    {
      kind: "text",
      heading: "Regression metrics - measuring the size of a miss",
      paragraphs: [
        "For regression, judging is simple in principle: compare each prediction with the true value. The difference - predicted minus actual - is the error for that example. A prediction of $310,000 against a real price of $300,000 misses by $10,000. Metrics exist because \"look at all the misses\" doesn't scale - we need one number that summarizes the whole pattern of misses.",
        "Mean absolute error (MAE) takes every miss, ignores its direction, and averages the sizes: \"on average, how far off are we?\" Because it's an average of plain distances, MAE is in the same units as the target - an MAE of $8,000 means the model's typical price estimate is off by about eight thousand dollars. Every dollar of error counts equally.",
        "Root mean squared error (RMSE) is the most widely used alternative. It squares each miss before averaging (which does two things: makes sign irrelevant, and makes large misses count disproportionately more), then takes the square root to return to the target's units. RMSE answers: \"what's my typical miss size - with big misses punished extra hard?\" If being wildly wrong occasionally is far worse than being moderately wrong often - like a power grid that must never be caught flat-footed - RMSE keeps your eyes on exactly that risk.",
        "Its sibling, mean squared error (MSE), skips the square root - so it's not in the target's units anymore, which makes it harder to read as a \"miss size\" but very convenient for training algorithms. The same goes for the residual sum of squares (RSS), the raw total of squared misses - useful as a building block in the mathematics of fitting models, less useful as a headline number, since it grows just because your dataset grows.",
      ],
    },
    {
      kind: "callout",
      variant: "tip",
      title: "Lower is better - and units matter",
      body: "For all of these error metrics, lower is better: they measure how far off you are. MAE reads directly as \"average miss in real units\"; RMSE also reads in real units, but amplifies large misses. If RMSE is much larger than MAE, your errors are uneven - a few predictions are dramatically off.",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l5-cp1",
        type: "choice",
        concept: "Regression metrics",
        scenario:
          "A real-estate team's price model has an MAE of $9,000 and an RMSE of $21,000.",
        prompt: "What does that gap most likely indicate?",
        options: [
          "The model is unusually consistent",
          "A few predictions are dramatically wrong, dragging the miss-punishing metric up",
          "MAE is always larger than RMSE",
          "The model is overfitting the training data",
        ],
        correct: 1,
        explanation:
          "RMSE punishes large misses extra hard. When RMSE towers over MAE, it means the errors aren't evenly distributed - a handful of very large misses are being amplified. Most predictions land close (low MAE), but a few go badly astray.",
      },
    },
    {
      kind: "text",
      heading: "Classification metrics - counting kinds of right and wrong",
      paragraphs: [
        "Classification introduces the metric most people know: accuracy - the share of predictions that were simply correct. It's intuitive, and for balanced problems it's fine. But accuracy hides a dangerous trap.",
        "Suppose 99% of email is legitimate. A \"model\" that just labels everything \"not spam\" - never reading a single message - scores 99% accuracy while catching exactly zero spam. When one category dominates the data, accuracy can look brilliant while the model is useless. This is called the class imbalance trap, and the way out is to count the kinds of right and wrong separately.",
        "Precision asks: of everything the model flagged as spam, what fraction really was spam? High precision means few false alarms - when the model says spam, you can believe it. Recall asks: of all the spam that actually arrived, what fraction did the model catch? High recall means few misses - real spam rarely slips through.",
        "These two pull against each other: flag aggressively and recall rises while precision falls (more real mail wrongly accused); flag cautiously and precision rises while recall falls (more spam sneaks past). The F1 score balances them in a single number by combining both - high only when both are high.",
      ],
    },
    {
      kind: "diagram",
      id: "metric-dashboard",
      caption:
        "The spam filter's four possible outcomes. Precision worries about the flagged column; recall worries about the actual-spam row; accuracy counts the diagonal.",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l5-cp2",
        type: "choice",
        concept: "Precision",
        prompt:
          "\"Of the 100 emails my filter moved to the spam folder, 91 were actually spam.\" Which metric is being described?",
        options: ["Recall", "Accuracy", "Precision", "F1 score"],
        correct: 2,
        explanation:
          "Precision is about the flagged set: of everything the model called spam, how much really was? 91 of 100 flagged gives precision of 91%. The other 9 are false alarms - real mail wrongly accused.",
      },
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l5-cp3",
        type: "choice",
        concept: "Recall",
        prompt:
          "\"Yesterday 200 spam emails arrived; the filter caught 150 of them.\" Which metric is being described?",
        options: ["Recall", "Precision", "Accuracy", "MAE"],
        correct: 0,
        explanation:
          "Recall is about the true spam set: of all the real spam, how much did the model catch? 150 of 200 is a recall of 75%. The 50 that slipped through are the misses - and whether that's tolerable depends on what a miss costs.",
      },
    },
    {
      kind: "text",
      heading: "Unsupervised metrics - judging structure without an answer key",
      paragraphs: [
        "How do you grade a model when there was never a correct answer? For clustering, quality metrics take two angles. Homogeneity asks: does each group contain only one kind of thing? Completeness asks: is each kind of thing fully inside one group? A perfect clustering is both - every group pure, and every kind gathered whole. The silhouette score takes a different approach: it measures how snugly each example fits its own group compared to the nearest other group - rewarding clusters that are tight inside and well separated from each other. Higher is better.",
        "Don't worry about memorizing formulas - these will rarely be your day-one tools. What matters is the idea: even without labels, we can still ask principled questions about whether discovered structure is meaningful.",
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The metric is a choice, not a fact",
      body: "A model can look great on one metric and fail on another. Whenever someone quotes a score, the honest follow-up question is: which mistakes does this metric count, and which does it ignore?",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l5-cp4",
        type: "choice",
        concept: "Choosing metrics by cost",
        scenario:
          "A security team is building an alert system for dangerous network intrusions. False alarms are just annoying - an analyst spends a minute dismissing them. A missed intrusion could be catastrophic.",
        prompt: "Which metric should the team most want to maximize?",
        options: [
          "Precision - never cry wolf",
          "Recall - catch as many true intrusions as possible",
          "Accuracy - get the overall percentage high",
          "RMSE - minimize miss size",
        ],
        correct: 1,
        explanation:
          "When a miss is far more costly than a false alarm, recall is the metric to watch: it measures how many real intrusions were caught. The cost of extra false alarms is a minute of an analyst's time; the cost of a miss could be everything. (RMSE doesn't even apply - this is a classification problem.)",
      },
    },
  ],
  activity: {
    kind: "metric-detective",
    heading: "Activity - Metric detective",
    intro:
      "Five cases, each with a hidden need. Read the situation, pick the metric that fits, and find out why.",
  },
  freeResponse: {
    id: "fr-m1-l5",
    prompt:
      "Explain precision and recall using the spam-filter example, then describe one situation where you'd prioritize precision and one where you'd prioritize recall.",
    guidance:
      "Aim for 3-5 sentences. \"Flagged\" and \"caught\" are the two directions to contrast.",
    expectedConcepts: [
      "precision",
      "recall",
      "flagged",
      "caught",
      "false alarm",
      "missed",
      "spam",
      "cost",
    ],
    rubric: [
      "Explains precision as correctness of the flagged set (few false alarms)",
      "Explains recall as coverage of the true cases (few misses)",
      "Chooses situations whose costs genuinely match the chosen metric",
    ],
    minLength: 100,
    maxLength: 1400,
  },
  requiredSectionIds: ["m1-l5-cp1", "m1-l5-cp2", "m1-l5-cp3", "m1-l5-cp4", "m1-l5-activity", "m1-l5-quiz", "m1-l5-freeresponse"],
};
