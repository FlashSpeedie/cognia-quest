import type { AcademyLesson } from "../../types";
import { LESSON_SEGMENTS } from "../module";

export const lesson5: AcademyLesson = {
  meta: {
    id: "m1-l5",
    slug: "how-do-we-know-a-model-is-working",
    order: 5,
    title: "How Do We Know a Model Is Working?",
    minutes: 25,
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
  video: { segments: LESSON_SEGMENTS["m1-l5"]! },
  sheet: {
    coreIdea: [
      "Two people looking at the same model can honestly disagree about whether it \"works\" - unless there's a number everyone trusts. Evaluation metrics are that number: standard measures that turn a model's performance into something comparable, communicable and honest.",
      "There is no single best metric, because different mistakes cost different amounts in different situations. The skill is knowing which question each metric answers - and matching it to the mistake you most need to avoid.",
    ],
    vocabulary: [
      {
        term: "Accuracy",
        body: "The share of predictions that were simply correct. Intuitive - but misleading when one category dominates the data.",
      },
      {
        term: "Precision",
        body: "Of everything the model flagged, how much really deserved flagging? High precision means few false alarms.",
      },
      {
        term: "Recall",
        body: "Of all the real cases, how many did the model catch? High recall means few misses.",
      },
      {
        term: "F1 score",
        body: "One number that combines precision and recall - high only when both are high.",
      },
      {
        term: "MAE (mean absolute error)",
        body: "The average miss size, in the target's own units, with every unit of error counting equally.",
      },
      {
        term: "RMSE (root mean squared error)",
        body: "The typical miss size in the target's units - but large misses count disproportionately hard, because errors are squared before averaging.",
      },
    ],
    concepts: [
      {
        title: "Regression metrics — measuring the size of a miss",
        body: [
          "For regression, judging is simple in principle: compare each prediction with the true value. The difference - predicted minus actual - is the error for that example. A prediction of $310,000 against a real price of $300,000 misses by $10,000. Metrics exist because \"look at all the misses\" doesn't scale - we need one number that summarizes the whole pattern.",
          "MAE takes every miss, ignores its direction, and averages the sizes: \"on average, how far off are we?\" Because it's an average of plain distances, MAE is in the same units as the target - an MAE of $8,000 means the model's typical price estimate is off by about eight thousand dollars. Every dollar of error counts equally.",
          "RMSE is the most widely used alternative. It squares each miss before averaging (which makes sign irrelevant, and makes large misses count disproportionately more), then takes the square root to return to the target's units. RMSE answers: \"what's my typical miss size - with big misses punished extra hard?\" Its sibling MSE skips the square root, so it's no longer in the target's units - convenient for training math, less useful as a headline number. The same goes for the residual sum of squares (RSS), the raw total of squared misses: a useful building block in fitting models, but it grows just because a dataset grows.",
        ],
      },
      {
        title: "Classification metrics — counting kinds of right and wrong",
        body: [
          "Accuracy is the metric most people know: the share of predictions that were simply correct. It's intuitive, and for balanced problems it's fine. But accuracy hides a dangerous trap.",
          "Suppose 99% of email is legitimate. A \"model\" that just labels everything \"not spam\" - never reading a single message - scores 99% accuracy while catching exactly zero spam. When one category dominates the data, accuracy can look brilliant while the model is useless. The way out is to count the kinds of right and wrong separately.",
          "Precision asks: of everything the model flagged as spam, what fraction really was spam? High precision means few false alarms - when the model says spam, you can believe it. Recall asks: of all the spam that actually arrived, what fraction did the model catch? High recall means few misses. These two pull against each other: flag aggressively and recall rises while precision falls; flag cautiously and precision rises while recall falls. The F1 score balances them in a single number that is high only when both are high.",
        ],
        diagramId: "metric-dashboard",
      },
      {
        title: "Unsupervised metrics — judging structure without an answer key",
        body: [
          "How do you grade a model when there was never a correct answer? For clustering, quality metrics take two angles. Homogeneity asks: does each group contain only one kind of thing? Completeness asks: is each kind of thing fully inside one group? The silhouette score takes a different approach: it measures how snugly each example fits its own group compared to the nearest other group - rewarding clusters that are tight inside and well separated from each other. Higher is better.",
          "Don't worry about memorizing formulas - what matters is the idea: even without labels, we can still ask principled questions about whether discovered structure is meaningful.",
        ],
      },
    ],
    example: {
      title: "Reading a price model's scorecard",
      body: [
        "A real-estate team's model reports an MAE of $9,000 and an RMSE of $21,000.",
        "The average estimate is off by about nine thousand dollars - but the typical miss with big misses punished extra hard is $21,000. RMSE towering over MAE means the errors are uneven: most predictions land close, but a few go dramatically astray. Whether that's tolerable depends on what a huge miss costs.",
      ],
    },
    commonConfusion: {
      title: "Precision vs. recall",
      body: "Both involve spam - so students constantly swap them. Anchor on which SET the metric measures. Precision looks at the flagged column: of the messages the model called spam, how many really were? Recall looks at the true spam row: of all the real spam, how much got caught? If you're worried about false alarms, think precision. If you're worried about misses, think recall.",
    },
    thinkAboutIt:
      "A security team is building an alert system for dangerous network intrusions. False alarms cost an analyst a minute; a missed intrusion could be catastrophic. Which metric should they watch - precision or recall - and why?",
    keyTakeaways: [
      "Metrics turn \"it seems to work\" into a number others can trust and compare.",
      "Regression: MAE is the average miss in the target's units; RMSE punishes large misses extra hard.",
      "RMSE much larger than MAE means a few predictions are dramatically off.",
      "Accuracy is a trap on imbalanced data - a do-nothing model can score 99%.",
      "Precision = correctness of the flagged set; recall = coverage of the real cases; F1 requires both.",
      "Choose the metric that matches what a mistake costs.",
    ],
    sourceConnection:
      "This lesson plays the source segment 54:42\u20131:01:42 (Chapter 3 — ML Basics), where LunarTech walks through the evaluation metrics for regression (RSS, MSE, RMSE, MAE), classification (accuracy, precision, recall, F1) and unsupervised models (homogeneity, silhouette score, completeness).",
  },
  checkpoints: [
    {
      id: "m1-l5-cp1",
      segmentId: "m1-l5-s1",
      timestampSeconds: 150,
      type: "choice",
      concept: "Regression metrics",
      scenario: "A real-estate team's price model has an MAE of $9,000 and an RMSE of $21,000.",
      prompt: "What does that gap most likely indicate?",
      options: [
        "The model is unusually consistent",
        "A few predictions are dramatically wrong, dragging the miss-punishing metric up",
        "MAE is always larger than RMSE",
        "The model is overfitting the training data",
      ],
      correct: 1,
      explanation:
        "RMSE punishes large misses extra hard. When RMSE towers over MAE, the errors aren't evenly distributed - a handful of very large misses are being amplified. Most predictions land close (low MAE), but a few go badly astray.",
    },
    {
      id: "m1-l5-cp2",
      segmentId: "m1-l5-s1",
      timestampSeconds: 260,
      type: "choice",
      concept: "Precision",
      prompt:
        "\"Of the 100 emails my filter moved to the spam folder, 91 were actually spam.\" Which metric is being described?",
      options: ["Recall", "Accuracy", "Precision", "F1 score"],
      correct: 2,
      explanation:
        "Precision is about the flagged set: of everything the model called spam, how much really was? 91 of 100 flagged gives precision of 91%. The other 9 are false alarms - real mail wrongly accused.",
    },
    {
      id: "m1-l5-cp3",
      segmentId: "m1-l5-s1",
      timestampSeconds: 320,
      type: "choice",
      concept: "Recall",
      prompt:
        "\"Yesterday 200 spam emails arrived; the filter caught 150 of them.\" Which metric is being described?",
      options: ["Recall", "Precision", "Accuracy", "MAE"],
      correct: 0,
      explanation:
        "Recall is about coverage of the true cases: of all the real spam, how much did the model catch? 150 of 200 is a recall of 75%. The 50 that slipped through are the misses - and whether that's tolerable depends on what a miss costs.",
    },
    {
      id: "m1-l5-cp4",
      segmentId: "m1-l5-s1",
      timestampSeconds: 395,
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
  ],
  activity: {
    kind: "metric-detective",
    heading: "Optional exercise — Metric detective",
    intro: "Five cases, each with a hidden need. Read the situation, pick the metric that fits, and find out why.",
  },
  quizId: "quiz-m1-l5",
  freeResponses: [
    {
      id: "fr-m1-l5-1",
      prompt:
        "Explain precision and recall using the spam-filter example, then describe one situation where you'd prioritize precision and one where you'd prioritize recall.",
      guidance: "Aim for 3-5 sentences. \"Flagged\" and \"caught\" are the two directions to contrast.",
      expectedConcepts: ["precision", "recall", "flagged", "caught", "false alarm", "missed", "spam", "cost"],
      rubric: [
        "Explains precision as correctness of the flagged set (few false alarms)",
        "Explains recall as coverage of the true cases (few misses)",
        "Chooses situations whose costs genuinely match the chosen metric",
      ],
      minLength: 100,
      maxLength: 1400,
    },
    {
      id: "fr-m1-l5-2",
      prompt:
        "A friend asks why their model's MAE of $500 doesn't tell the whole story about its errors. Explain what MAE does tell them, and what extra insight RMSE adds.",
      guidance: "Aim for 2-3 sentences. Think about what squaring the errors does to big misses.",
      expectedConcepts: ["mae", "rmse", "average", "units", "large", "squar", "miss"],
      rubric: [
        "Explains MAE as the average miss size in the target's units",
        "Explains that RMSE punishes large misses disproportionately",
        "Notes that comparing the two reveals whether errors are uneven",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l5-3",
      prompt:
        "A factory's defect rate is 0.5%. A manager celebrates a new model that is 99.5% accurate at quality control. Explain why that celebration is premature and which numbers you would ask for instead.",
      guidance: "Aim for 2-4 sentences. What does a do-nothing model score on imbalanced data?",
      expectedConcepts: ["imbalan", "accuracy", "recall", "precision", "trap", "defect"],
      rubric: [
        "Identifies the class-imbalance trap: a do-nothing model also scores 99.5%",
        "Asks for precision and/or recall on the defect class instead",
        "Explains what those metrics would reveal (caught defects, false alarms)",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l5-4",
      prompt:
        "You are advising a hospital building a screening tool. A missed disease case is dangerous; a false alarm only costs a follow-up test. Which metric do you tell the team to prioritize, and how would you explain that choice to a non-technical stakeholder?",
      guidance: "Aim for 3-4 sentences. Translate the metric into plain, human stakes.",
      expectedConcepts: ["recall", "miss", "catch", "cost", "precision", "trade"],
      rubric: [
        "Chooses recall and justifies it via the cost of misses",
        "Explains the trade-off in plain language a stakeholder would follow",
        "Acknowledges the acceptable price (more false alarms) honestly",
      ],
      minLength: 100,
      maxLength: 1200,
    },
  ],
  requiredSectionIds: [
    "m1-l5-cp1",
    "m1-l5-cp2",
    "m1-l5-cp3",
    "m1-l5-cp4",
    "m1-l5-quiz",
    "fr-m1-l5-1",
    "fr-m1-l5-2",
    "fr-m1-l5-3",
    "fr-m1-l5-4",
  ],
  optionalSectionIds: ["m1-l5-activity"],
};
