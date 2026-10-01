import type { AcademyLesson } from "../../types";

export const lesson8: AcademyLesson = {
  meta: {
    id: "m1-l8",
    slug: "overfitting-and-generalization",
    order: 8,
    title: "Overfitting and Generalization",
    minutes: 25,
    segment: { chapter: 5, chapterTitle: "Overfitting & Regularization", start: 4349, end: 6063 },
    summary:
      "The most common way real ML projects fail: a model that aces its practice questions and flunks the real exam.",
    goals: [
      "Define overfitting and underfitting",
      "Use the training/test gap to diagnose a model",
      "Explain why generalization is the real goal",
      "List practical strategies for reducing overfitting",
    ],
  },
  moduleId: "module-1",
  quizId: "quiz-m1-l8",
  intro: [
    {
      kind: "text",
      heading: "The study-guide trap",
      paragraphs: [
        "Two students prepare for an exam. The first memorizes the answer key to last year's practice exam, word for word. The second works to understand the ideas. On the practice exam, the memorizer scores 100% and looks like a genius. On the real exam - full of new questions - the memorizer collapses, and the student who understood does fine.",
        "Overfitting is that first student, in machine-learning form: a model that has learned its training examples - including their random quirks - too closely to perform well on anything new.",
      ],
    },
  ],
  blocks: [
    {
      kind: "definition",
      term: "Overfitting",
      body: "When a model learns the training data too closely - including noise and quirks that will never repeat - producing strong training performance but weak performance on new data.",
    },
    {
      kind: "definition",
      term: "Underfitting",
      body: "When a model is too simple to capture even the real pattern - performing poorly on training data and new data alike.",
    },
    {
      kind: "text",
      heading: "Noise is the bait",
      paragraphs: [
        "Why would a model learn something harmful? Because real data is noisy. Datasets contain random quirks - a house that sold high because the buyer loved the garden, an email marked spam by a tired moderator. A flexible enough model can wrap itself around every quirk, as if each one were a law of nature.",
        "The result is a model that treats random accidents of its training set as meaningful patterns. Those accidents won't repeat in new data - so the model's confident performance evaporates the moment reality hands it something it hasn't seen. Generalization - the whole goal of machine learning - is exactly what gets destroyed.",
      ],
    },
    {
      kind: "diagram",
      id: "overfitting-curves",
      caption:
        "As model complexity grows, training performance keeps climbing - but new-data performance peaks and then falls as the model starts memorizing noise. The widening gap is the fingerprint of overfitting.",
    },
    {
      kind: "text",
      heading: "Reading the vital signs",
      paragraphs: [
        "The diagnostic is beautifully simple: compare training performance with test performance. A large gap - excellent on training, poor on test - is the fingerprint of overfitting. Both low is underfitting. Both reasonably strong means the model found the real pattern.",
        "Notice how this connects to the previous lesson: overfitting is the practical face of high variance - the model reacted to the noise of its particular sample. Underfitting is high bias made visible - the model was too rigid to find the pattern at all.",
      ],
    },
    {
      kind: "callout",
      variant: "tip",
      title: "The 10-second diagnostic",
      body: "Training great, test poor: overfitting - the model memorized. Both poor: underfitting - the model missed the pattern. Both good: healthy - the model learned something real.",
    },
    {
      kind: "text",
      heading: "The toolkit against overfitting",
      paragraphs: [
        "Practitioners have a well-stocked toolkit, and the ideas are intuitive once you see overfitting as \"memorizing the sample\":",
        "Use a simpler model. Flexibility is what lets a model wrap around noise. Reducing flexibility forces it to capture only the strongest, most repeated patterns - the ones likely to be real.",
        "Get more data. With three examples, noise is most of what a model sees; with three thousand, the true pattern repeats enough to dominate, and random quirks start canceling each other out. Harder to memorize, easier to generalize.",
        "Regularization. A catch-all term for techniques that penalize complexity during training - the model is nudged toward smoother behavior, discouraged from contorting itself around tiny quirks. Think of it as a complexity tax.",
        "Resampling and cross-validation. Instead of trusting one lucky train/test split, rotate which portion of the data is held out and check performance across several splits. This makes your estimates far more reliable - and makes it obvious when a model only performs well on one convenient split.",
        "Early stopping. Many models improve steadily and then start memorizing. Watching performance on held-out data during training lets you stop at the peak - before the model starts learning noise.",
        "Ensemble methods. Combine several different models and average their votes. Each model's quirks point in different directions - so they tend to cancel, leaving the shared real pattern standing.",
      ],
    },
    {
      kind: "callout",
      variant: "think",
      title: "Think about it",
      body: "Which of the six strategies would you reach for first if your dataset were small and impossible to grow - and which would be pointless? Why does a bigger dataset make some of the others less necessary?",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l8-cp1",
        type: "choice",
        concept: "Diagnosing overfitting",
        scenario:
          "A model scores 99% accuracy on its training data but only 61% on the held-out test set.",
        prompt: "What's the best diagnosis?",
        options: [
          "Underfitting - the model is too simple",
          "Overfitting - the model memorized its training data, including noise",
          "Healthy - 61% is a fine result",
          "The test set was too small to matter",
        ],
        correct: 1,
        explanation:
          "The huge training/test gap is the classic overfitting signature: strong performance on data it was allowed to study, weak performance on data it never saw. The model learned quirks of its sample that don't generalize.",
      },
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l8-cp2",
        type: "multi",
        concept: "Anti-overfitting strategies",
        prompt: "Select every action that can genuinely help reduce overfitting.",
        options: [
          "Simplifying the model (less flexibility)",
          "Collecting more training data",
          "Adding a regularization penalty during training",
          "Making the model even more flexible",
          "Stopping training early, when held-out performance peaks",
          "Removing the test set to reduce clutter",
        ],
        correct: [0, 1, 2, 4],
        explanation:
          "Simpler models, more data, regularization and early stopping all reduce overfitting - each one makes memorizing noise harder or less rewarding. More flexibility makes overfitting worse, and deleting the test set just hides the evidence.",
      },
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l8-cp3",
        type: "choice",
        concept: "Why more data helps",
        prompt: "Why does more training data usually make overfitting harder?",
        options: [
          "Large datasets delete noise automatically",
          "With more examples, true patterns repeat and dominate while random quirks tend to cancel out",
          "Bigger data makes models automatically simpler",
          "It doesn't - data size has no effect on overfitting",
        ],
        correct: 1,
        explanation:
          "The real pattern shows up in example after example; random noise doesn't repeat. With enough data the pattern dominates, and a model that memorizes finds memorizing far more expensive - while one that finds the true structure is rewarded.",
      },
    },
    {
      kind: "text",
      heading: "Looking ahead",
      paragraphs: [
        "You now hold the complete conceptual toolkit of Module 1: how machines learn from examples, the shapes problems take, how performance is measured honestly, and the twin failure modes that undo careless projects.",
        "In later modules this foundation becomes practice: training real models on real data, starting with regression - the ideas of bias, variance, splits and metrics will be your constant companions there. The concepts don't change; you'll just finally get your hands on them.",
      ],
    },
  ],
  activity: {
    kind: "overfitting-detective",
    heading: "Activity - Overfitting detective",
    intro:
      "Four model scenarios, each with training and test performance. Classify each as underfitting, a reasonable fit, or overfitting - then read the reasoning.",
  },
  freeResponse: {
    id: "fr-m1-l8",
    prompt:
      "In your own words, explain why a model that performs extremely well on training data can still perform poorly on new data.",
    guidance: "Aim for 3-5 sentences. The words \"noise\", \"memorize\" and \"generalize\" are good anchors.",
    expectedConcepts: [
      "noise",
      "memoriz",
      "generaliz",
      "unseen",
      "new data",
      "pattern",
      "overfit",
    ],
    rubric: [
      "Explains that training performance can come from memorizing examples and their noise, not only real patterns",
      "Connects the failure to new data: learned quirks don't repeat, so performance drops",
      "Uses (or gestures at) the gap idea: strong training / weak test is the warning sign",
    ],
    minLength: 100,
    maxLength: 1400,
  },
  requiredSectionIds: ["m1-l8-cp1", "m1-l8-cp2", "m1-l8-cp3", "m1-l8-activity", "m1-l8-quiz", "m1-l8-freeresponse"],
};
