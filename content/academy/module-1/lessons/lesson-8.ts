import type { AcademyLesson } from "../../types";
import { LESSON_SEGMENTS } from "../module";

export const lesson8: AcademyLesson = {
  meta: {
    id: "m1-l8",
    slug: "overfitting-and-generalization",
    order: 8,
    title: "Overfitting and Generalization",
    minutes: 30,
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
  video: { segments: LESSON_SEGMENTS["m1-l8"]! },
  sheet: {
    coreIdea: [
      "Two students prepare for an exam. The first memorizes the answer key to last year's practice exam, word for word. The second works to understand the ideas. On the practice exam, the memorizer scores 100% and looks like a genius. On the real exam - full of new questions - the memorizer collapses, and the student who understood does fine.",
      "Overfitting is that first student, in machine-learning form: a model that has learned its training examples - including their random quirks - too closely to perform well on anything new.",
    ],
    vocabulary: [
      {
        term: "Overfitting",
        body: "When a model learns the training data too closely - including noise and quirks that will never repeat - producing strong training performance but weak performance on new data.",
      },
      {
        term: "Underfitting",
        body: "When a model is too simple to capture even the real pattern - performing poorly on training data and new data alike.",
      },
      {
        term: "Noise",
        body: "Random quirks of a dataset that aren't real patterns - a house that sold high because the buyer loved the garden.",
      },
      {
        term: "Generalization",
        body: "How well a model's learned patterns transfer to new data - the only performance that matters once a model is deployed.",
      },
      {
        term: "Regularization",
        body: "A family of techniques that penalize complexity during training - a complexity tax that nudges models toward smoother behavior.",
      },
      {
        term: "Cross-validation",
        body: "Rotating which portion of the data is held out, so performance is checked across several splits instead of trusting one lucky split.",
      },
    ],
    concepts: [
      {
        title: "Noise is the bait",
        body: [
          "Why would a model learn something harmful? Because real data is noisy. Datasets contain random quirks - a house that sold high because the buyer loved the garden, an email marked spam by a tired moderator. A flexible enough model can wrap itself around every quirk, as if each one were a law of nature.",
          "The result is a model that treats random accidents of its training set as meaningful patterns. Those accidents won't repeat in new data - so the model's confident performance evaporates the moment reality hands it something it hasn't seen. Generalization - the whole goal - is exactly what gets destroyed.",
        ],
      },
      {
        title: "Reading the vital signs",
        body: [
          "The diagnostic is beautifully simple: compare training performance with test performance. A large gap - excellent on training, poor on test - is the fingerprint of overfitting. Both low is underfitting. Both reasonably strong means the model found the real pattern.",
          "Notice how this connects to Lesson 7: overfitting is the practical face of high variance - the model reacted to the noise of its particular sample. Underfitting is high bias made visible - the model was too rigid to find the pattern at all.",
        ],
        diagramId: "overfitting-curves",
      },
      {
        title: "The toolkit against overfitting",
        body: [
          "Use a simpler model. Flexibility is what lets a model wrap around noise. Reducing flexibility forces it to capture only the strongest, most repeated patterns - the ones likely to be real.",
          "Get more data. With three examples, noise is most of what a model sees; with three thousand, the true pattern repeats enough to dominate, and random quirks start canceling each other out. Harder to memorize, easier to generalize.",
          "Regularization. A catch-all term for techniques that penalize complexity during training - the model is nudged toward smoother behavior, discouraged from contorting itself around tiny quirks. Think of it as a complexity tax.",
          "Resampling and cross-validation. Instead of trusting one lucky train/test split, rotate which portion of the data is held out and check performance across several splits. This makes your estimates far more reliable - and makes it obvious when a model only performs well on one convenient split.",
          "Early stopping. Many models improve steadily and then start memorizing. Watching performance on held-out data during training lets you stop at the peak - before the model starts learning noise.",
          "Ensemble methods. Combine several different models and average their votes. Each model's quirks point in different directions - so they tend to cancel, leaving the shared real pattern standing.",
        ],
      },
      {
        title: "You now hold the complete Module 1 toolkit",
        body: [
          "How machines learn from examples, the shapes learning problems take, how performance is measured honestly, and the twin failure modes that undo careless projects. Every idea in this module supports the one habit that separates working ML from wishful ML: never trust a score measured on data the model has seen.",
        ],
      },
    ],
    example: {
      title: "The 10-second diagnostic",
      body: [
        "Model A: 70% training, 69% test. Model B: 98% training, 58% test. Model C: 90% training, 88% test.",
        "A is underfitting (both poor - too simple). B is overfitting (huge gap - memorized its sample). C is healthy (strong on unseen data with only a small gap). Generalization is about performance on new data - so C is the best model here, even though B has the highest training score.",
      ],
    },
    commonConfusion: {
      title: "\u201cHigh training accuracy means the model is good\u201d",
      body: "Training performance is practice-exam performance - the model has already seen those answers. What separates a working model from a memorizer is the test score. The single most informative comparison in this whole module is the gap between the two: a big gap means overfitting; both low means underfitting; both strong means the model actually learned.",
    },
    thinkAboutIt:
      "Which of the six anti-overfitting strategies would you reach for first if your dataset were small and impossible to grow - and which would be pointless? Why does a bigger dataset make some of the others less necessary?",
    keyTakeaways: [
      "Overfitting = memorizing the sample (noise included); underfitting = too simple for the pattern.",
      "The vital sign is the train/test gap: large gap = overfit; both low = underfit; both strong = healthy.",
      "Overfitting is high variance in practice; underfitting is high bias in practice.",
      "Cures: simpler models, more data, regularization, cross-validation, early stopping, ensembles.",
      "More data works because patterns repeat while noise doesn't.",
      "Generalization to unseen data is the goal every tool in this lesson serves.",
    ],
    sourceConnection:
      "This lesson plays the source segment 1:12:29\u20131:41:03 (Chapter 5 — Overfitting & Regularization), where LunarTech covers low training error versus high test error, noise, model complexity, and the approaches for reducing overfitting - including regularization techniques such as ridge (L2) and lasso (L1), whose conceptual purpose (penalizing complexity) this lesson teaches. Module 1's video content ends here, immediately before the source's Chapter 6 on linear regression.",
  },
  checkpoints: [
    {
      id: "m1-l8-cp1",
      segmentId: "m1-l8-s1",
      timestampSeconds: 600,
      type: "choice",
      concept: "Diagnosing overfitting",
      scenario: "A model scores 99% accuracy on its training data but only 61% on the held-out test set.",
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
    {
      id: "m1-l8-cp2",
      segmentId: "m1-l8-s1",
      timestampSeconds: 1050,
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
    {
      id: "m1-l8-cp3",
      segmentId: "m1-l8-s1",
      timestampSeconds: 1500,
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
  ],
  activity: {
    kind: "overfitting-detective",
    heading: "Optional exercise — Overfitting detective",
    intro:
      "Four model scenarios, each with training and test performance. Classify each as underfitting, a reasonable fit, or overfitting - then read the reasoning.",
  },
  quizId: "quiz-m1-l8",
  freeResponses: [
    {
      id: "fr-m1-l8-1",
      prompt:
        "In your own words, explain why a model that performs extremely well on training data can still perform poorly on new data.",
      guidance: "Aim for 3-5 sentences. The words \"noise\", \"memorize\" and \"generalize\" are good anchors.",
      expectedConcepts: ["noise", "memoriz", "generaliz", "unseen", "new data", "pattern", "overfit"],
      rubric: [
        "Explains that training performance can come from memorizing examples and their noise, not only real patterns",
        "Connects the failure to new data: learned quirks don't repeat, so performance drops",
        "Uses (or gestures at) the gap idea: strong training / weak test is the warning sign",
      ],
      minLength: 100,
      maxLength: 1400,
    },
    {
      id: "fr-m1-l8-2",
      prompt:
        "Define overfitting AND underfitting, then explain how the train/test comparison tells them apart in a single glance.",
      guidance: "Aim for 3-4 sentences. One has a gap; the other doesn't.",
      expectedConcepts: ["overfit", "underfit", "train", "test", "gap", "simple", "memoriz"],
      rubric: [
        "Defines overfitting: strong training, weak test - memorized the sample",
        "Defines underfitting: weak on both - too simple for the pattern",
        "States the diagnostic clearly: the gap (or absence of one) plus the absolute levels",
      ],
      minLength: 100,
      maxLength: 1200,
    },
    {
      id: "fr-m1-l8-3",
      prompt:
        "Explain what regularization does conceptually, and why a \"complexity tax\" during training helps a model generalize - even though it makes training scores worse.",
      guidance: "Aim for 3-4 sentences. Think about what a model gives up versus what it keeps.",
      expectedConcepts: ["regulariz", "penalt", "complex", "smooth", "noise", "generaliz", "train"],
      rubric: [
        "Explains regularization as penalizing complexity during training",
        "Connects the tax to behavior: patterns worth their cost survive; tiny quirks don't",
        "Acknowledges the trade: lower training scores, better generalization",
      ],
      minLength: 100,
      maxLength: 1200,
    },
    {
      id: "fr-m1-l8-4",
      prompt:
        "A teammate's model scores 98% on training data and 58% on test data. Recommend TWO different fixes from this lesson, explain how each works, and say what you would check to know they worked.",
      guidance: "Aim for 4-5 sentences. Fixes might include simpler models, more data, regularization, early stopping, or cross-validation.",
      expectedConcepts: ["overfit", "simpl", "regulariz", "data", "stopping", "cross", "gap", "test"],
      rubric: [
        "Recommends two genuinely different anti-overfitting fixes",
        "Explains the mechanism of each correctly",
        "Names the success check: the train/test gap shrinks with test performance improving",
      ],
      minLength: 120,
      maxLength: 1400,
    },
  ],
  requiredSectionIds: [
    "m1-l8-cp1",
    "m1-l8-cp2",
    "m1-l8-cp3",
    "m1-l8-quiz",
    "fr-m1-l8-1",
    "fr-m1-l8-2",
    "fr-m1-l8-3",
    "fr-m1-l8-4",
  ],
  optionalSectionIds: ["m1-l8-activity"],
};
