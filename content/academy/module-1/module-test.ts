import type { AcademyQuiz } from "../types";

/**
 * Module 1 mastery assessment - a full-module exam, not a lesson quiz.
 * Deterministic, repo-versioned, server-graded. Passing threshold lives in
 * module.ts (MODULE_TEST_PASS_THRESHOLD).
 */
export const MODULE_TEST: AcademyQuiz = {
  id: "m1-module-test",
  title: "Module 1 test - AI & Machine Learning Foundations",
  lessonId: null,
  questions: [
    // ── Foundations (Lessons 1-2) ────────────────────────────────────────
    {
      id: "t-m1-1",
      kind: "mcq",
      concept: "What machine learning is",
      difficulty: "easy",
      chapter: 1,
      prompt: "The defining trait of machine learning is that systems...",
      options: [
        "Follow rules programmers wrote for every case",
        "Improve at a task by finding patterns in examples (data)",
        "Store answers to every possible input",
        "Require a human operator at runtime",
      ],
      correct: 1,
      explanation:
        "Machine learning is defined by learning from examples. The pattern discovered becomes the model, which can then handle cases it never saw.",
    },
    {
      id: "t-m1-2",
      kind: "mcq",
      concept: "AI vs machine learning",
      difficulty: "easy",
      chapter: 1,
      prompt: "Which statement is correct?",
      options: [
        "All AI systems use machine learning",
        "All machine learning is AI, but not all AI uses machine learning",
        "AI and ML are unrelated fields",
        "Machine learning is a subset of statistics with no AI role",
      ],
      correct: 1,
      explanation:
        "AI is the broad goal; ML is one approach to it. Rule-based systems are AI without learning, so the first option fails; every learning system, though, counts as AI.",
    },
    {
      id: "t-m1-3",
      kind: "multi",
      concept: "Real-world ML applications",
      difficulty: "easy",
      chapter: 1,
      prompt: "Select all of the following that are genuine, common applications of machine learning.",
      options: [
        "Recommending videos based on viewing history",
        "Flagging card transactions that don't match a customer's usual spending",
        "Computing a spreadsheet column sum with a fixed formula",
        "Transcribing spoken words into text",
      ],
      correct: [0, 1, 3],
      explanation:
        "Recommendations, fraud flags and speech transcription all learn patterns from examples. A fixed formula computes a defined result - no learning, no ML.",
    },
    {
      id: "t-m1-4",
      kind: "mcq",
      concept: "The learning stack",
      difficulty: "conceptual",
      chapter: 2,
      prompt: "In the machine learning stack, what sits directly above data?",
      options: [
        "Applications",
        "Evaluation",
        "Statistics & mathematics",
        "Python",
      ],
      correct: 2,
      explanation:
        "The stack runs: data -> statistics & mathematics -> machine learning -> evaluation -> applications. Statistics is what makes it possible to reason meaningfully about the raw examples.",
    },
    {
      id: "t-m1-5",
      kind: "mcq",
      concept: "Data quality",
      difficulty: "reasoning",
      chapter: 2,
      prompt:
        "A project keeps swapping algorithms but results stay poor. The data turns out to be riddled with errors. What does the stack tell you?",
        options: [
          "They should keep trying more exotic algorithms",
          "The bottom layer sets the ceiling - fix the data before anything above it can shine",
          "Evaluation is the layer at fault",
          "The stack layers are independent, so the link is coincidence",
        ],
      correct: 1,
      explanation:
        "Problems flow down the stack: data quality caps everything built on it. No algorithm choice can fully recover from corrupted examples.",
    },

    // ── Supervised vs unsupervised (Lesson 3) ────────────────────────────
    {
      id: "t-m1-6",
      kind: "mcq",
      concept: "Labeled data",
      difficulty: "easy",
      chapter: 3,
      prompt: "Which dataset is labeled?",
      options: [
        "A pile of photos with no annotations",
        "Transactions with no fraud information attached",
        "Emails each marked \"spam\" or \"not spam\" by real users",
        "Sensor readings with no context",
      ],
      correct: 2,
      explanation:
        "Labeled data carries the correct answer - the target - attached to each example. Human-marked emails qualify; the others are unlabeled raw examples.",
    },
    {
      id: "t-m1-7",
      kind: "mcq",
      concept: "Features and target",
      difficulty: "conceptual",
      chapter: 3,
      prompt:
        "In a model predicting a student's final grade from study hours, attendance and past scores, what is the target?",
      options: [
        "Study hours",
        "The final grade",
        "Attendance",
        "Past scores",
      ],
      correct: 1,
      explanation:
        "The features are the inputs (study hours, attendance, past scores); the target is the answer the model predicts - the final grade.",
    },
    {
      id: "t-m1-8",
      kind: "mcq",
      concept: "Clustering",
      difficulty: "conceptual",
      chapter: 3,
      prompt:
        "A music app discovers five natural listener groups in its data without anyone defining groups in advance. This is...",
      options: [
        "Supervised classification",
        "Unsupervised clustering",
        "Regression",
        "Outlier detection",
      ],
      correct: 1,
      explanation:
        "Groups that emerge from unlabeled data - with no predefined categories - are clusters, the classic unsupervised task.",
    },
    {
      id: "t-m1-9",
      kind: "mcq",
      concept: "Supervised vs unsupervised",
      difficulty: "application",
      chapter: 3,
      prompt:
        "A hospital has thousands of X-rays, each with a doctor-confirmed diagnosis, and wants to predict diagnoses for new scans. Which family and task?",
      options: [
        "Supervised - classification",
        "Supervised - regression",
        "Unsupervised - clustering",
        "Unsupervised - outlier detection",
      ],
      correct: 0,
      explanation:
        "The doctor-confirmed diagnoses are labels (supervision), and the output is a category from a fixed set - supervised classification.",
    },

    // ── Regression vs classification (Lesson 4) ─────────────────────────
    {
      id: "t-m1-10",
      kind: "mcq",
      concept: "Regression vs classification",
      difficulty: "easy",
      chapter: 3,
      prompt: "Predicting a commute time in minutes is which type of task?",
      options: [
        "Classification - time is a category",
        "Regression - minutes form a continuous numeric range",
        "Clustering - commutes group together",
        "Outlier detection",
      ],
      correct: 1,
      explanation:
        "A duration in minutes can take any value along a range - a continuous numeric target, so regression.",
    },
    {
      id: "t-m1-11",
      kind: "match",
      concept: "Mapping problems to tasks",
      difficulty: "application",
      chapter: 3,
      prompt: "Match each problem to the ML task that fits it best.",
      left: [
        "Predicting a house's sale price in dollars",
        "Deciding if a message is spam or not spam",
        "Discovering segments among unlabeled shoppers",
        "Flagging machine readings unlike any normal pattern",
      ],
      right: [
        "Regression (continuous value)",
        "Classification (fixed categories)",
        "Clustering (unlabeled structure)",
        "Outlier detection (unlabeled anomalies)",
      ],
      correct: [0, 1, 2, 3],
      explanation:
        "A dollar price is continuous - regression. Spam vs. not-spam is a fixed category set - classification. Shopper segments without labels are clustering; readings unlike any normal pattern are outliers.",
    },

    // ── Metrics (Lesson 5) ───────────────────────────────────────────────
    {
      id: "t-m1-12",
      kind: "mcq",
      concept: "Metric interpretation",
      difficulty: "conceptual",
      chapter: 3,
      prompt:
        "A model flags 80 messages as spam; 64 really are spam. Of the 100 spam messages that arrived, it caught 80. Which pairing is correct?",
      options: [
        "Precision 80%, recall 80%",
        "Precision 64%, recall 80%",
        "Precision 80%, recall 64%",
        "Precision 64%, recall 64%",
      ],
      correct: 0,
      explanation:
        "Precision = of the flagged set, how much was right: 64/80 = 80%. Recall = of all real cases, how much was caught: 80/100 = 80%. Both directions land at 80% here.",
    },
    {
      id: "t-m1-13",
      kind: "mcq",
      concept: "Choosing metrics by cost",
      difficulty: "application",
      chapter: 3,
      prompt:
        "For a disease-screening tool, a missed positive case is dangerous, while a false alarm only costs a follow-up test. Which metric should be prioritized?",
      options: [
        "Precision",
        "Recall",
        "Accuracy",
        "RMSE",
      ],
      correct: 1,
      explanation:
        "When misses are the expensive mistake, recall is the metric: it measures how many real cases were caught. False alarms are the acceptable price.",
    },
    {
      id: "t-m1-14",
      kind: "mcq",
      concept: "Accuracy trap",
      difficulty: "reasoning",
      chapter: 3,
      prompt:
        "A factory's defect rate is 0.5%. A model that predicts \"no defect\" every time scores 99.5% accuracy. Why is the team wrong to celebrate?",
      options: [
        "99.5% is not a high number",
        "On imbalanced data, accuracy hides the failure - the model catches zero defects, which precision/recall on the defect class would expose",
        "Accuracy only works for regression",
        "The model should have used the silhouette score",
      ],
      correct: 1,
      explanation:
        "This is the class-imbalance trap: the dominant class carries the score while the rare class - the one that matters - is entirely missed. Metrics that split kinds of errors (precision, recall) reveal the truth.",
    },

    // ── Data splits (Lesson 6) ──────────────────────────────────────────
    {
      id: "t-m1-15",
      kind: "mcq",
      concept: "Validation set",
      difficulty: "conceptual",
      chapter: 3,
      prompt: "The validation set exists to...",
      options: [
        "Serve as the final honest exam",
        "Absorb the information leakage of development decisions - comparing and tuning while the test set stays sealed",
        "Provide extra training examples",
        "Make the model smaller",
      ],
      correct: 1,
      explanation:
        "Development is full of choices, and every choice leaks information. The validation set is the scratch paper; the test set stays sealed for exactly one final evaluation.",
    },
    {
      id: "t-m1-16",
      kind: "order",
      concept: "The ML workflow",
      difficulty: "application",
      chapter: 3,
      prompt: "Order these steps of the machine learning workflow.",
      items: [
        "Evaluate once on the untouched test set",
        "Prepare the data and split off validation/test sets",
        "Train the model on the training set",
        "Tune choices using the validation set",
      ],
      correct: [1, 2, 3, 0],
      explanation:
        "Prepare and split first, train second, tune against the validation set third, and open the test set exactly once for the final evaluation.",
    },

    // ── Bias & variance (Lesson 7) ───────────────────────────────────────
    {
      id: "t-m1-17",
      kind: "mcq",
      concept: "Bias",
      difficulty: "conceptual",
      chapter: 4,
      prompt: "Which situation is the clearest picture of high bias?",
      options: [
        "A model that changes completely with each new training sample",
        "An over-simple model that systematically misses the true pattern and barely varies across samples",
        "A model with excellent training and test scores",
        "A dataset with random noise",
      ],
      correct: 1,
      explanation:
        "High bias = consistent but wrong: the model misses the pattern in the same way regardless of sample. Changing completely with each sample is the high-variance picture.",
    },
    {
      id: "t-m1-18",
      kind: "mcq",
      concept: "Bias-variance trade-off",
      difficulty: "reasoning",
      chapter: 4,
      prompt: "Why is bias vs variance called a trade-off?",
      options: [
        "Because both can be eliminated with enough data",
        "Because increasing flexibility lowers bias while raising variance - you sacrifice one to improve the other",
        "Because teams trade models with each other",
        "Because both metrics use the same scale",
      ],
      correct: 1,
      explanation:
        "Flexibility moves the two in opposite directions: more of it lets the model capture the real pattern (bias down) but also chase sample noise (variance up). The sweet spot balances the two.",
    },

    // ── Overfitting & generalization (Lesson 8) ─────────────────────────
    {
      id: "t-m1-19",
      kind: "multi",
      concept: "Anti-overfitting strategies",
      difficulty: "conceptual",
      chapter: 5,
      prompt: "Select every action that helps fight overfitting.",
      options: [
        "Making the model simpler (less flexibility)",
        "Gathering more training data",
        "Using regularization to penalize complexity",
        "Checking multiple train/test splits (cross-validation) for reliable estimates",
        "Making the model dramatically more flexible",
      ],
      correct: [0, 1, 2, 3],
      explanation:
        "Simplicity, more data, regularization and cross-validation all attack memorization or its deceptive appearance. More flexibility feeds the disease instead of curing it.",
    },
    {
      id: "t-m1-20",
      kind: "mcq",
      concept: "Diagnosing scenarios",
      difficulty: "reasoning",
      chapter: 5,
      prompt:
        "Model A: 70% training, 69% test. Model B: 98% training, 58% test. Model C: 90% training, 88% test. Which model generalizes best?",
      options: [
        "Model A - the smallest gap",
        "Model B - the highest training score",
        "Model C - strong on unseen data with only a small gap",
        "Impossible to tell from these numbers",
      ],
      correct: 2,
      explanation:
        "Generalization is about performance on unseen data. Model C delivers the best test performance with a small gap - healthy learning. Model B's huge gap is overfitting; Model A's tiny gap comes with weak scores everywhere (underfitting).",
    },
  ],
};
