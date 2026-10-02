import type { AcademyQuiz } from "../types";

/**
 * Deterministic, repo-versioned lesson quizzes for Module 1.
 * Never generated at runtime; graded server-side only.
 * Every question is answerable from its lesson's own material.
 */
export const LESSON_QUIZZES: AcademyQuiz[] = [
  // ── Lesson 1 - Welcome to Machine Learning ─────────────────────────────
  {
    id: "quiz-m1-l1",
    title: "Lesson 1 quiz - Welcome to Machine Learning",
    lessonId: "m1-l1",
    questions: [
      {
        id: "q-m1-l1-1",
        kind: "mcq",
        concept: "What machine learning is",
        difficulty: "easy",
        chapter: 1,
        prompt: "What is the key difference between traditional programming and machine learning?",
        options: [
          "Machine learning runs faster on the same hardware",
          "Traditional programming feeds rules and data in to get answers; machine learning feeds data and answers in to produce the rules",
          "Machine learning never requires any data",
          "There is no real difference - the terms are synonyms",
        ],
        correct: 1,
        explanation:
          "In traditional programming, humans write the rules. In machine learning, the system infers the rules (the model) from labeled or structured examples - data and answers in, rules out.",
      },
      {
        id: "q-m1-l1-2",
        kind: "mcq",
        concept: "AI vs machine learning",
        difficulty: "conceptual",
        chapter: 1,
        prompt: "Which statement about AI and machine learning is accurate?",
        options: [
          "AI and machine learning are two names for the same thing",
          "Machine learning is the broader field; AI is a technique inside it",
          "AI is the broader goal; machine learning is one approach for achieving it",
          "Machine learning replaced AI entirely in the 2010s",
        ],
        correct: 2,
        explanation:
          "Artificial intelligence is the broad goal - machines doing things that would require intelligence. Machine learning - learning behavior from data - is one powerful way to get there. Rule-based systems are AI without ML.",
      },
      {
        id: "q-m1-l1-3",
        kind: "mcq",
        concept: "AI vs machine learning",
        difficulty: "conceptual",
        chapter: 1,
        prompt:
          "A classic chess engine dominates grandmasters using evaluation rules that human experts hand-crafted over decades. In the terms of this lesson, the engine is...",
        options: [
          "AI and machine learning",
          "AI, but not machine learning",
          "Machine learning, but not AI",
          "Neither AI nor machine learning",
        ],
        correct: 1,
        explanation:
          "Hand-written rules engineered by experts make it artificial intelligence - but it did not learn from examples, so it is not machine learning. All ML is AI; not all AI is ML.",
      },
      {
        id: "q-m1-l1-4",
        kind: "multi",
        concept: "Real-world ML applications",
        difficulty: "application",
        chapter: 1,
        prompt: "Select every product that plausibly relies on machine learning.",
        options: [
          "A card network flagging unusual transactions for review",
          "A streaming service building \"because you watched\" rows",
          "A basic four-function calculator app",
          "A photo app grouping pictures by the people in them",
        ],
        correct: [0, 1, 3],
        explanation:
          "Fraud flags, recommendations and face-based grouping all involve pattern recognition over examples. A calculator computes fixed, hand-defined operations - no learning involved.",
      },
      {
        id: "q-m1-l1-5",
        kind: "mcq",
        concept: "Why ML fits messy problems",
        difficulty: "reasoning",
        chapter: 1,
        prompt:
          "Why does machine learning often fit problems like fraud detection better than hand-written rules?",
        options: [
          "Learned models are always more accurate than rules",
          "Fraudsters constantly invent new tricks; a learned model generalizes from many examples rather than waiting for humans to write new rules for every case",
          "Machine learning removes the need for any data",
          "Hand-written rules cannot express conditions at all",
        ],
        correct: 1,
        explanation:
          "The real world keeps producing situations nobody anticipated in a rulebook. A model trained on many examples generalizes to new cases - though note the word \"often\": learned models can still be wrong, which is why evaluation (Lesson 5) matters.",
      },
      {
        id: "q-m1-l1-6",
        kind: "mcq",
        concept: "Real-world ML applications",
        difficulty: "application",
        chapter: 1,
        prompt:
          "A streaming service studies what its users watch, how long they watch, and what they skip - then fills each home page with \"Because you watched...\" rows. Which application is this?",
        options: [
          "Fraud detection",
          "Recommendation system",
          "Autonomous driving",
          "Medical diagnosis",
        ],
        correct: 1,
        explanation:
          "This is a recommendation system: a model learned from examples of viewing behavior to predict what each person will enjoy next. The same learn-preferences-and-predict pattern powers music, shopping and social feeds.",
      },
    ],
  },

  // ── Lesson 2 - The Machine Learning Roadmap ───────────────────────────
  {
    id: "quiz-m1-l2",
    title: "Lesson 2 quiz - The Machine Learning Roadmap",
    lessonId: "m1-l2",
    questions: [
      {
        id: "q-m1-l2-1",
        kind: "mcq",
        concept: "The learning stack",
        difficulty: "easy",
        chapter: 2,
        prompt: "Which layer sits at the bottom of the machine learning stack?",
        options: ["Evaluation", "Applications", "Data", "Python"],
        correct: 2,
        explanation:
          "Data is the raw material - machine learning means learning from examples, so the examples come first and set the ceiling for everything above them.",
      },
      {
        id: "q-m1-l2-2",
        kind: "mcq",
        concept: "Statistics in the stack",
        difficulty: "conceptual",
        chapter: 2,
        prompt: "What does the statistics & mathematics layer contribute to the stack?",
        options: [
          "The programming language used to ship products",
          "The tools for summarizing data and reasoning about uncertainty and relationships",
          "The rules that make models fair",
          "A replacement for evaluation",
        ],
        correct: 1,
        explanation:
          "Statistics gives you ways to say meaningful things about data: averages, spread, relationships, uncertainty. It's how you understand what data can support before models are built on it.",
      },
      {
        id: "q-m1-l2-3",
        kind: "mcq",
        concept: "NLP",
        difficulty: "conceptual",
        chapter: 2,
        prompt: "Natural language processing (NLP) is best described as...",
        options: [
          "Machine learning applied to human language - tasks like translation, transcription and chat",
          "A programming language for robots",
          "The study of how humans learn grammar",
          "A database technology for storing text",
        ],
        correct: 0,
        explanation:
          "NLP is machine learning applied to text and speech: translation, sentiment analysis, transcription, assistants. Language is messy - words change meaning with context - which is what makes it its own branch.",
      },
      {
        id: "q-m1-l2-4",
        kind: "mcq",
        concept: "Data quality",
        difficulty: "application",
        chapter: 2,
        prompt:
          "A team trains a recommendation model on shopping data in which a third of the examples were accidentally mislabeled. The model performs poorly. What should they fix first?",
        options: [
          "The algorithm - switch to a more flexible model immediately",
          "The evaluation metric - they are probably measuring wrong",
          "The data - problems at the bottom of the stack set a ceiling no higher layer can fully fix",
          "The user interface",
        ],
        correct: 2,
        explanation:
          "Everything above the data layer inherits its flaws. No algorithm or metric can fully recover information that was corrupted before it arrived - fix the data first, then rebuild.",
      },
      {
        id: "q-m1-l2-5",
        kind: "order",
        concept: "The learning stack",
        difficulty: "application",
        chapter: 2,
        prompt: "Order the layers of the machine learning stack from bottom (first) to top (last).",
        items: ["Machine learning", "Data", "Applications", "Statistics & mathematics", "Evaluation"],
        correct: [1, 3, 0, 4, 2],
        explanation:
          "Data is the foundation; statistics and mathematics give tools for reasoning about it; machine learning finds the patterns; evaluation checks whether they're real; applications deliver results to users.",
      },
      {
        id: "q-m1-l2-6",
        kind: "mcq",
        concept: "Why the stack order matters",
        difficulty: "reasoning",
        chapter: 2,
        prompt:
          "Why do practitioners say problems in an ML project \"trace back down the stack\"?",
        options: [
          "Because upper layers are always less important",
          "Because each layer depends on the ones below it - a weak lower layer limits everything built on top",
          "Because applications are the least valuable part",
          "Because the stack is just a historical order of invention",
        ],
        correct: 1,
        explanation:
          "The stack is a dependency chain: modeling depends on data, evaluation depends on modeling, products depend on evaluation. When results disappoint, the cause is often a layer below where the symptom appears.",
      },
    ],
  },

  // ── Lesson 3 - Supervised vs. Unsupervised Learning ────────────────────
  {
    id: "quiz-m1-l3",
    title: "Lesson 3 quiz - Supervised vs. Unsupervised Learning",
    lessonId: "m1-l3",
    questions: [
      {
        id: "q-m1-l3-1",
        kind: "mcq",
        concept: "Labeled data",
        difficulty: "easy",
        chapter: 3,
        prompt: "What makes a dataset \"labeled\"?",
        options: [
          "It has descriptive column names",
          "Each example carries the correct answer - the target - attached to it",
          "It was checked by a lawyer",
          "It contains only numbers",
        ],
        correct: 1,
        explanation:
          "Labeled data comes with an answer key: each example is paired with the correct target - a price, a category, a diagnosis - that the model learns to predict.",
      },
      {
        id: "q-m1-l3-2",
        kind: "mcq",
        concept: "Features and target",
        difficulty: "conceptual",
        chapter: 3,
        prompt:
          "In a house-price model, the inputs are size, age, number of bedrooms and distance to downtown; the output is the sale price. Which terms are correct?",
        options: [
          "Size, age, bedrooms and distance are features; price is the target",
          "Size, age, bedrooms and distance are targets; price is a feature",
          "Everything is a feature; there is no target",
          "Everything is a label",
        ],
        correct: 0,
        explanation:
          "Features are the input attributes the model sees; the target (also called the dependent variable) is the answer it is being trained to predict.",
      },
      {
        id: "q-m1-l3-3",
        kind: "mcq",
        concept: "Clustering",
        difficulty: "conceptual",
        chapter: 3,
        prompt: "Why is clustering an unsupervised task?",
        options: [
          "Because it always uses images",
          "Because it groups examples by similarity without any predefined labels to learn from",
          "Because no computer can supervise it",
          "Because clusters are always wrong",
        ],
        correct: 1,
        explanation:
          "Clustering reveals structure - groups of similar examples - directly from unlabeled data. There is no target answer key; the groups emerge from the data itself.",
      },
      {
        id: "q-m1-l3-4",
        kind: "mcq",
        concept: "Outlier detection",
        difficulty: "application",
        chapter: 3,
        prompt:
          "A bank has millions of transactions but no list of confirmed fraud cases. It wants suspicious transactions flagged. Which approach fits best?",
        options: [
          "Supervised classification - fraud labels are implied",
          "Unsupervised outlier detection - flag transactions unlike any learned normal pattern",
          "Regression - fraud is a number",
          "Clustering - frauds always form their own cluster",
        ],
        correct: 1,
        explanation:
          "With no labels there is nothing to supervise from, so an unsupervised approach fits: learn what \"normal\" looks like and flag the anomalies. If labels existed (verified fraud cases), supervised classification would become possible.",
      },
      {
        id: "q-m1-l3-5",
        kind: "match",
        concept: "Classifying tasks",
        difficulty: "application",
        chapter: 3,
        prompt: "Match each task to the learning family it belongs to.",
        left: [
          "Spam detection trained on human-labeled emails",
          "Grouping shoppers by similar behavior, no predefined groups",
          "Predicting house prices from past sales",
          "Flagging unusual network traffic without labeled attacks",
        ],
        right: [
          "Supervised (classification)",
          "Supervised (regression)",
          "Unsupervised (clustering)",
          "Unsupervised (outlier detection)",
        ],
        correct: [0, 2, 1, 3],
        explanation:
          "Spam detection has labels and a category output - supervised classification. Shopper grouping reveals structure without labels - clustering. House prices are labeled numeric targets - regression. Unusual traffic with no attack labels is outlier detection.",
      },
      {
        id: "q-m1-l3-6",
        kind: "mcq",
        concept: "Choosing between families",
        difficulty: "reasoning",
        chapter: 3,
        prompt: "Why do teams sometimes choose unsupervised methods even when labels would help?",
        options: [
          "Unsupervised models are always more accurate",
          "Labels usually require human effort to produce, so for unlabeled data, finding structure without them is the practical option",
          "Unsupervised learning doesn't need data",
          "Supervised learning has been discontinued",
        ],
        correct: 1,
        explanation:
          "The answer key is expensive: a real human (or reality itself, after the fact) usually has to produce it. When labels don't exist yet, unsupervised structure-finding - clustering, anomaly detection - is the practical first move.",
      },
    ],
  },

  // ── Lesson 4 - Regression vs. Classification ────────────────────────────
  {
    id: "quiz-m1-l4",
    title: "Lesson 4 quiz - Regression vs. Classification",
    lessonId: "m1-l4",
    questions: [
      {
        id: "q-m1-l4-1",
        kind: "mcq",
        concept: "Regression",
        difficulty: "easy",
        chapter: 3,
        prompt: "A regression model's output is...",
        options: [
          "A category from a fixed set",
          "A continuous numeric value, like a price or a temperature",
          "A group of similar examples",
          "A rule written by a programmer",
        ],
        correct: 1,
        explanation:
          "Regression predicts a continuous numeric target - a value that could land anywhere along a range: $312,000, 22.5 minutes, 84 megawatt-hours.",
      },
      {
        id: "q-m1-l4-2",
        kind: "mcq",
        concept: "Classification",
        difficulty: "easy",
        chapter: 3,
        prompt: "A classification model's output is...",
        options: [
          "A continuous numeric value",
          "One label chosen from a fixed set of categories",
          "A measure of cluster tightness",
          "A copy of the training data",
        ],
        correct: 1,
        explanation:
          "Classification picks a bucket: spam or not spam, benign or malignant, cat/dog/rabbit. The set of possible answers is fixed in advance.",
      },
      {
        id: "q-m1-l4-3",
        kind: "mcq",
        concept: "Regression vs classification",
        difficulty: "conceptual",
        chapter: 3,
        prompt: "Why is house-price prediction a regression problem?",
        options: [
          "Because houses are expensive",
          "Because the target is a continuous numeric value - the price - that can take any value in a range",
          "Because there are no examples to learn from",
          "Because price is a category",
        ],
        correct: 1,
        explanation:
          "The target - sale price - is a number along a continuous range, and any value is possible. A continuous numeric target is the defining feature of regression.",
      },
      {
        id: "q-m1-l4-4",
        kind: "mcq",
        concept: "Choosing the task type",
        difficulty: "application",
        chapter: 3,
        prompt:
          "A weather service wants to predict tomorrow's exact high temperature in degrees. Which task type is this?",
        options: [
          "Regression - the answer is a continuous number",
          "Classification - weather comes in categories",
          "Clustering - days group naturally",
          "Outlier detection - unusual days matter",
        ],
        correct: 0,
        explanation:
          "A temperature in degrees can take any value along a range - continuous numeric output, so regression. (Framing it as \"hot/warm/cold\" buckets instead would make it classification - see the next question.)",
      },
      {
        id: "q-m1-l4-5",
        kind: "match",
        concept: "Choosing the task type",
        difficulty: "application",
        chapter: 3,
        prompt: "Match each scenario to the ML task that fits it best.",
        left: [
          "Estimating a delivery order's arrival time in minutes",
          "Deciding whether an email is spam or not spam",
          "Discovering customer groups from unlabeled purchase data",
        ],
        right: [
          "Classification",
          "Regression",
          "Unsupervised (clustering)",
        ],
        correct: [1, 0, 2],
        explanation:
          "Arrival time is a continuous number - regression. Spam vs. not-spam is a fixed set of categories - classification. Customer groups from unlabeled data is unsupervised clustering.",
      },
      {
        id: "q-m1-l4-6",
        kind: "mcq",
        concept: "Framing changes the task",
        difficulty: "reasoning",
        chapter: 3,
        prompt:
          "A team reworks its temperature model so that instead of predicting exact degrees, it predicts \"hot\", \"warm\", or \"cold\". What changed?",
        options: [
          "Nothing - the task type is the same",
          "The task changed from regression (continuous output) to classification (categorical output)",
          "The task changed from supervised to unsupervised",
          "The task became outlier detection",
        ],
        correct: 1,
        explanation:
          "The same real-world question can often be framed either way. Exact degrees is a continuous target - regression. A bucket from a fixed set is a categorical target - classification. The framing changes the tools and metrics you need.",
      },
    ],
  },

  // ── Lesson 5 - How Do We Know a Model Is Working? ───────────────────────
  {
    id: "quiz-m1-l5",
    title: "Lesson 5 quiz - Evaluation metrics",
    lessonId: "m1-l5",
    questions: [
      {
        id: "q-m1-l5-2",
        kind: "mcq",
        concept: "Regression metrics",
        difficulty: "conceptual",
        chapter: 3,
        prompt:
          "A price model reports an MAE of $8,000. What does that number tell you, in plain language?",
        options: [
          "The model's predictions miss by about $8,000 on average",
          "The model costs $8,000 per month to run",
          "Eight thousand predictions were correct",
          "The model's best prediction was $8,000",
        ],
        correct: 0,
        explanation:
          "MAE is the average miss size, in the target's own units: on average, the model's price estimates are about $8,000 away from the true price.",
      },
      {
        id: "q-m1-l5-3",
        kind: "mcq",
        concept: "Regression metrics",
        difficulty: "conceptual",
        chapter: 3,
        prompt: "How does RMSE treat errors differently from MAE?",
        options: [
          "RMSE ignores all errors above a threshold",
          "RMSE punishes large misses extra hard, because errors are squared before averaging",
          "RMSE counts only negative errors",
          "RMSE treats every dollar of error exactly equally",
        ],
        correct: 1,
        explanation:
          "Squaring makes big misses disproportionately expensive. That's why RMSE much larger than MAE is a telltale sign of a few dramatically wrong predictions - and why power-grid-style problems, where huge misses are worst, watch RMSE.",
      },
      {
        id: "q-m1-l5-4",
        kind: "mcq",
        concept: "Precision",
        difficulty: "conceptual",
        chapter: 3,
        prompt: "Precision answers which question?",
        options: [
          "Of everything the model flagged, how much really deserved flagging?",
          "Of all the real cases, how many did the model catch?",
          "What fraction of all predictions were correct?",
          "How tight are the clusters?",
        ],
        correct: 0,
        explanation:
          "Precision is about the flagged set: when the model says \"spam\", how often is it right? High precision = few false alarms. (Catching the real cases is recall; the overall fraction is accuracy.)",
      },
      {
        id: "q-m1-l5-5",
        kind: "mcq",
        concept: "Recall",
        difficulty: "conceptual",
        chapter: 3,
        prompt: "Recall answers which question?",
        options: [
          "Of everything the model flagged, how much really deserved flagging?",
          "Of all the real cases, how many did the model catch?",
          "How far off are the model's numeric predictions?",
          "How separated are the clusters?",
        ],
        correct: 1,
        explanation:
          "Recall is about coverage of the true cases: of all the actual spam, how much was caught? High recall = few misses. (The flagged-set question is precision.)",
      },
      {
        id: "q-m1-l5-6",
        kind: "mcq",
        concept: "Accuracy trap",
        difficulty: "application",
        chapter: 3,
        prompt:
          "99% of an inbox's email is legitimate. A \"model\" that labels every single message \"not spam\" scores 99% accuracy. What's the honest evaluation?",
        options: [
          "The model is excellent - 99% is a strong score",
          "Accuracy is misleading on imbalanced data: the model catches zero spam, so precision and recall for spam are the metrics that matter",
          "The model has a 1% RMSE",
          "Accuracy should be replaced by silhouette score",
        ],
        correct: 1,
        explanation:
          "This is the class-imbalance trap. When one category dominates, raw accuracy hides failure. On the spam class this model has 0% recall - it never flags anything - and precision is undefined. You must count kinds of right and wrong separately.",
      },
      {
        id: "q-m1-l5-7",
        kind: "mcq",
        concept: "Unsupervised metrics",
        difficulty: "reasoning",
        chapter: 3,
        prompt:
          "A team uses clustering to segment customers and wants a quality measure of the discovered groups - how snug and well-separated they are. Which metric fits?",
        options: [
          "The silhouette score",
          "Precision",
          "MAE",
          "Accuracy",
        ],
        correct: 0,
        explanation:
          "The silhouette score measures how well each example fits its own cluster versus the nearest other cluster - rewarding clusters that are tight inside and separated from each other. Precision, MAE and accuracy all require known answers, which clustering lacks by definition.",
      },
    ],
  },

  // ── Lesson 6 - Training, Validation, and Testing ───────────────────────
  {
    id: "quiz-m1-l6",
    title: "Lesson 6 quiz - Data splits",
    lessonId: "m1-l6",
    questions: [
      {
        id: "q-m1-l6-1",
        kind: "mcq",
        concept: "Training set",
        difficulty: "easy",
        chapter: 3,
        prompt: "What is the training set used for?",
        options: [
          "Delivering the final grade",
          "The examples the model studies while learning its patterns",
          "Comparing model options during development",
          "Reporting to regulators",
        ],
        correct: 1,
        explanation:
          "The training set is the model's study material - the only examples it may learn from. Comparing options happens on the validation set; the final grade comes from the test set.",
      },
      {
        id: "q-m1-l6-2",
        kind: "mcq",
        concept: "Validation set",
        difficulty: "conceptual",
        chapter: 3,
        prompt: "Why does development need a separate validation set - why not tune on the test set directly?",
        options: [
          "Validation sets are required by law",
          "Every tuning decision leaks information; the validation set absorbs that leakage so the test set stays untouched for one honest final evaluation",
          "Validation sets train faster",
          "The test set is only for unsupervised models",
        ],
        correct: 1,
        explanation:
          "Each time you tweak a choice based on a score, the data behind that score influences your model. Let the validation set absorb all that; then the test set - opened once, at the end - still estimates unseen-data performance honestly.",
      },
      {
        id: "q-m1-l6-3",
        kind: "mcq",
        concept: "Why not evaluate on training data",
        difficulty: "conceptual",
        chapter: 3,
        prompt: "Why is a model's score on its own training data not meaningful evidence?",
        options: [
          "Training scores are always zero",
          "The model was allowed to see those answers while learning - the score measures memory, not skill",
          "Training data is always unlabeled",
          "Computers can't score themselves",
        ],
        correct: 1,
        explanation:
          "It's the student who memorized the answer key being graded on those same questions: perfect scores are possible with zero understanding. Only unseen data measures generalization.",
      },
      {
        id: "q-m1-l6-4",
        kind: "mcq",
        concept: "Test-set leakage",
        difficulty: "application",
        chapter: 3,
        prompt:
          "A student tries 50 models and submits whichever got the best test-set score. What should the team conclude about that test score?",
        options: [
          "It's a fair estimate - trying many models is best practice",
          "It's inflated: the test set influenced the final choice, so it no longer estimates unseen-data performance",
          "It's too low - more attempts always lower the score",
          "Nothing - test scores are unrelated to model choices",
        ],
        correct: 1,
        explanation:
          "Selecting the winner by its test score leaks the test set into your decisions. The honest workflow: compare options on the validation set, choose, then open the test set exactly once.",
      },
      {
        id: "q-m1-l6-5",
        kind: "order",
        concept: "The ML workflow",
        difficulty: "application",
        chapter: 3,
        prompt: "Put these workflow steps in the correct order.",
        items: [
          "Judge the final model on the test set",
          "Fit the model on the training set",
          "Split the data into training, validation and test sets",
          "Tune choices by comparing options on the validation set",
        ],
        correct: [2, 1, 3, 0],
        explanation:
          "Split before any learning so held-out data stays untouched; train on the training set; tune using the validation set; only then open the test set for the final, honest judgment.",
      },
      {
        id: "q-m1-l6-6",
        kind: "mcq",
        concept: "Generalization",
        difficulty: "reasoning",
        chapter: 3,
        prompt: "In machine learning, \"generalization\" refers to...",
        options: [
          "Making the model run on many computers",
          "How well a model's learned patterns hold up on data it has never seen",
          "Writing the model in a general-purpose language",
          "Simplifying the model's documentation",
        ],
        correct: 1,
        explanation:
          "Deployed models live entirely on new data - new emails, new transactions, new houses. Generalization is the whole goal, and held-out test data exists precisely to estimate it honestly.",
      },
    ],
  },

  // ── Lesson 7 - Bias and Variance ────────────────────────────────────────
  {
    id: "quiz-m1-l7",
    title: "Lesson 7 quiz - Bias and variance",
    lessonId: "m1-l7",
    questions: [
      {
        id: "q-m1-l7-1",
        kind: "mcq",
        concept: "Bias",
        difficulty: "easy",
        chapter: 4,
        prompt: "High bias means a model...",
        options: [
          "Is too sensitive to its particular training sample",
          "Systematically misses the real pattern - typically because it is too simple",
          "Changes dramatically when retrained on new data",
          "Has zero training error",
        ],
        correct: 1,
        explanation:
          "Bias is error from oversimplification: the model misses the true pattern in the same direction no matter which sample it trains on - like a straight line forced through curved data.",
      },
      {
        id: "q-m1-l7-2",
        kind: "mcq",
        concept: "Variance",
        difficulty: "easy",
        chapter: 4,
        prompt: "High variance means a model...",
        options: [
          "Is systematically wrong in the same direction",
          "Changes noticeably depending on which particular training examples it happened to see",
          "Can never be trained",
          "Has reached the irreducible-error floor",
        ],
        correct: 1,
        explanation:
          "Variance is error from over-sensitivity: retrain on a different sample of the same phenomenon and you get a noticeably different model - the signature of a model that chases its sample's quirks.",
      },
      {
        id: "q-m1-l7-3",
        kind: "mcq",
        concept: "Flexibility vs bias",
        difficulty: "conceptual",
        chapter: 4,
        prompt: "As a model becomes more flexible, what happens to bias?",
        options: [
          "It rises - flexible models miss more",
          "It falls - flexibility lets the model capture more of the true pattern",
          "It stays constant",
          "It becomes irreducible",
        ],
        correct: 1,
        explanation:
          "Flexibility is what lets a model bend to real curves and subtleties: bias falls. The cost is on the other axis - variance rises.",
      },
      {
        id: "q-m1-l7-4",
        kind: "mcq",
        concept: "Flexibility vs variance",
        difficulty: "conceptual",
        chapter: 4,
        prompt: "As a model becomes more flexible, what happens to variance?",
        options: [
          "It falls - flexible models are steadier",
          "It rises - the same bendiness that captures patterns also wraps around sample noise",
          "It stays constant",
          "It becomes bias instead",
        ],
        correct: 1,
        explanation:
          "The flip side of flexibility: a model that can fit anything will also fit the random quirks of its particular sample, so different samples produce noticeably different models.",
      },
      {
        id: "q-m1-l7-5",
        kind: "mcq",
        concept: "Diagnosing bias",
        difficulty: "application",
        chapter: 4,
        prompt:
          "A straight-line model is fit to data with a strong U-shaped trend. It misses the pattern badly, and retraining on different samples barely changes it. What is happening?",
        options: [
          "High variance - the model overreacts to noise",
          "High bias - the model is too rigid for the real pattern, and low variance confirms it is steady",
          "Irreducible error has reached 100%",
          "The data needs more labels",
        ],
        correct: 1,
        explanation:
          "A line cannot follow a U-shape, so the model misses the pattern systematically - high bias. Its near-identical behavior across samples shows variance is low. The cure is more flexibility.",
      },
      {
        id: "q-m1-l7-6",
        kind: "mcq",
        concept: "Irreducible error",
        difficulty: "reasoning",
        chapter: 4,
        prompt: "Why can't irreducible error be eliminated by any model?",
        options: [
          "Because models are always too simple",
          "Because it lives in the world itself - noise and unmeasured factors that no data can capture",
          "Because evaluation metrics can't measure it",
          "Because it only affects unsupervised learning",
        ],
        correct: 1,
        explanation:
          "Some error is baked into reality: a buyer's mood, a coin flip, factors no dataset recorded. No model can predict what was never knowable. Irreducible error is the floor every model should aim to approach - and stop at.",
      },
    ],
  },

  // ── Lesson 8 - Overfitting and Generalization ──────────────────────────
  {
    id: "quiz-m1-l8",
    title: "Lesson 8 quiz - Overfitting and generalization",
    lessonId: "m1-l8",
    questions: [
      {
        id: "q-m1-l8-1",
        kind: "mcq",
        concept: "Overfitting",
        difficulty: "easy",
        chapter: 5,
        prompt: "Overfitting is when a model...",
        options: [
          "Is too simple to capture the real pattern",
          "Learns its training data too closely - including noise - and performs much worse on new data",
          "Scores poorly on training and test data alike",
          "Refuses to train",
        ],
        correct: 1,
        explanation:
          "Overfitting is the memorizer: training performance looks excellent, but the learned quirks don't repeat in new data, so real performance collapses. (Too simple, poor everywhere, is underfitting.)",
      },
      {
        id: "q-m1-l8-2",
        kind: "mcq",
        concept: "Underfitting",
        difficulty: "easy",
        chapter: 5,
        prompt: "Underfitting is when a model...",
        options: [
          "Performs poorly on training data and new data alike - too simple for the real pattern",
          "Performs perfectly on training data only",
          "Has too much training data",
          "Is evaluated too often",
        ],
        correct: 0,
        explanation:
          "Underfitting is high bias made visible: the model is too rigid to capture the pattern even in the data it studied, so it disappoints everywhere.",
      },
      {
        id: "q-m1-l8-3",
        kind: "mcq",
        concept: "Reading the training/test gap",
        difficulty: "conceptual",
        chapter: 5,
        prompt: "What combination is the classic fingerprint of overfitting?",
        options: [
          "Low training performance and low test performance",
          "Strong performance on training data paired with a large drop on test data",
          "Identical performance on training and test data",
          "Strong test performance with weak training performance",
        ],
        correct: 1,
        explanation:
          "The gap is the evidence: excellent on what it was allowed to study, much worse on what it never saw means the model learned things that don't generalize - sample quirks, not just the pattern.",
      },
      {
        id: "q-m1-l8-4",
        kind: "multi",
        concept: "Anti-overfitting strategies",
        difficulty: "conceptual",
        chapter: 5,
        prompt: "Select every strategy that can help reduce overfitting.",
        options: [
          "Using a simpler, less flexible model",
          "Collecting more training data",
          "Adding a regularization penalty during training",
          "Using early stopping when held-out performance peaks",
          "Training much longer on the same data with the same model",
        ],
        correct: [0, 1, 2, 3],
        explanation:
          "Simplicity, more data, regularization and early stopping all make memorizing noise harder or less rewarding. Training longer on the same data just gives the model more opportunity to memorize.",
      },
      {
        id: "q-m1-l8-6",
        kind: "mcq",
        concept: "Regularization",
        difficulty: "conceptual",
        chapter: 5,
        prompt: "Conceptually, what does regularization do?",
        options: [
          "Deletes noisy examples from the training set",
          "Penalizes complexity during training - nudging the model toward smoother behavior that ignores tiny quirks",
          "Stops training the moment the test set is opened",
          "Combines several models into one vote",
        ],
        correct: 1,
        explanation:
          "Regularization is a complexity tax: training rewards good predictions, but penalizes excessive contortion, so the model keeps only patterns strong enough to be worth their cost. (Deleting examples isn't it - and the model averaging answer describes ensembles.)",
      },
      {
        id: "q-m1-l8-7",
        kind: "mcq",
        concept: "Why more data helps",
        difficulty: "reasoning",
        chapter: 5,
        prompt: "Why does collecting more training data usually reduce overfitting?",
        options: [
          "Large datasets are automatically noise-free",
          "With more examples, true patterns repeat and dominate while random quirks - which don't repeat - tend to cancel out",
          "More data makes all models simpler by law",
          "It doesn't - only regularization ever helps",
        ],
        correct: 1,
        explanation:
          "A quirk of one example doesn't generalize; the real pattern shows up again and again across thousands of examples. More data makes memorizing noise expensive and learning the pattern rewarding.",
      },
    ],
  },
];

export function quizById(id: string): AcademyQuiz | null {
  return LESSON_QUIZZES.find((q) => q.id === id) ?? null;
}
