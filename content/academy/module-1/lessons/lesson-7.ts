import type { AcademyLesson } from "../../types";
import { LESSON_SEGMENTS } from "../module";

export const lesson7: AcademyLesson = {
  meta: {
    id: "m1-l7",
    slug: "bias-and-variance",
    order: 7,
    title: "Bias and Variance",
    minutes: 20,
    summary:
      "Two ways a model can be wrong: missing the real pattern (bias) or chasing the noise in one particular dataset (variance).",
    goals: [
      "Explain bias and variance in simple language",
      "Describe how model flexibility changes both",
      "Distinguish reducible from irreducible error",
      "Explain the bias-variance trade-off",
    ],
  },
  moduleId: "module-1",
  video: { segments: LESSON_SEGMENTS["m1-l7"]! },
  sheet: {
    coreIdea: [
      "When a model misses, it misses for one of two very different reasons - and the reasons need opposite cures. A model can go wrong by missing the real pattern, or by chasing the quirks of one particular dataset. Bias and variance are the names for those two failure modes.",
      "Here's the setup: a model is trained on one particular sample of data. That sample contains both the real underlying pattern and the random quirks of those particular examples. A model can go wrong by missing the pattern (bias), or by wrapping itself around the quirks (variance).",
    ],
    vocabulary: [
      {
        term: "Bias",
        body: "Error that comes from the model being too simple to capture the real pattern - it misses the truth systematically, in the same direction, no matter which examples it trains on.",
      },
      {
        term: "Variance",
        body: "Error that comes from the model being too sensitive to the particular training examples - retrain on a different sample, and you get a noticeably different model.",
      },
      {
        term: "Model flexibility",
        body: "How much a model can bend to fit data - the dial that moves bias and variance in opposite directions.",
      },
      {
        term: "Reducible error",
        body: "Error that exists because of modeling choices (bias + variance). Better choices can shrink it.",
      },
      {
        term: "Irreducible error",
        body: "Noise built into the world itself - the error floor no model can get past.",
      },
    ],
    concepts: [
      {
        title: "Flexibility turns the dial",
        body: [
          "A simple, inflexible model - imagine fitting a straight line through data that actually curves - is forced to ignore subtleties. It misses the real pattern: that's high bias. But it's also steady: retrain on a different sample and you get roughly the same line. Low variance.",
          "A very flexible model has the opposite personality. It can bend to capture genuinely curved patterns - bias falls. But that same bendiness means it also wraps itself around the random quirks of its particular training sample. Retrain on a different sample and you can get a noticeably different model: high variance.",
          "Between the extremes sits the sweet spot: enough flexibility to capture the real pattern, not so much that the model starts modeling noise. That tension - bias falling as variance rises, and vice versa - is the bias-variance trade-off.",
        ],
        diagramId: "bias-variance-spectrum",
      },
      {
        title: "Reducible and irreducible error",
        body: [
          "Some error is reducible: it exists because of our modeling choices, and better choices - more flexibility, or less - can shrink it. Bias and variance are both reducible.",
          "But some error is irreducible: noise built into the world itself. Two nearly identical houses can sell for different prices because the buyers were in different moods. No model, however brilliant, can predict a coin flip. Irreducible error is the floor - the best any model can do - and knowing it exists keeps expectations honest.",
        ],
      },
      {
        title: "The dartboard picture",
        body: [
          "Picture a dartboard. High bias = darts clustered tightly together, but far from the bullseye: consistent, but systematically off. High variance = darts scattered wildly around the board: on average they might center near the bullseye, but any single throw is unpredictable.",
          "Where would you rather your model's predictions land - and what does each pattern tell you to change?",
        ],
      },
    ],
    example: {
      title: "Diagnosing the straight line",
      body: [
        "A team fits a straight-line model to data with a strong U-shaped trend. It misses the pattern badly - and retraining on different samples barely changes anything. That's high bias with low variance: the model is too rigid for the real pattern, and steady across samples. The cure is more flexibility, not more data.",
      ],
    },
    commonConfusion: {
      title: "Bias vs. variance",
      body: "The names don't hint at their meanings, so students swap them. Anchor on the mechanism: bias is about the MODEL'S SHAPE being too simple - it misses the true pattern the same way regardless of the sample. Variance is about the MODEL'S SENSITIVITY TO THE SAMPLE - train on different examples, get a noticeably different model. If the failure is \"wrong in the same direction every time,\" think bias. If it's \"different every time you retrain,\" think variance.",
    },
    thinkAboutIt:
      "A teammate reports: \"Great news - our training error is almost zero!\" Based on this lesson, what are the two possible interpretations, and which single comparison would tell you which one you're living in?",
    keyTakeaways: [
      "Bias = too simple: the model systematically misses the real pattern.",
      "Variance = too sensitive: the model changes noticeably with a different training sample.",
      "Increasing flexibility lowers bias but raises variance - the trade-off.",
      "The sweet spot is problem-dependent: capture the pattern, not the noise.",
      "Bias and variance are reducible; noise in the world is the irreducible floor.",
    ],
    sourceConnection:
      "This lesson plays the source segment 1:05:15\u20131:12:21 (Chapter 4 - Bias-Variance Trade-off), where LunarTech explains how model flexibility drives bias, variance and the expected test error relationship.",
  },
  checkpoints: [
    {
      id: "m1-l7-cp1",
      segmentId: "m1-l7-s1",
      timestampSeconds: 140,
      type: "choice",
      concept: "Diagnosing bias",
      scenario:
        "A team fits a straight-line model to data that clearly follows a strong U-shaped curve. The line misses the pattern badly - and retraining on different samples barely changes anything.",
      prompt: "What's the best diagnosis?",
      options: [
        "High bias - the model is too simple for the real pattern",
        "High variance - the model is too sensitive to its sample",
        "Irreducible error - the world is just noisy",
        "Both high bias and high variance",
      ],
      correct: 0,
      explanation:
        "A straight line cannot follow a U-shaped curve, so the model systematically misses the true pattern - the definition of high bias. The model's steadiness across samples (barely changes) confirms variance is low here.",
    },
    {
      id: "m1-l7-cp2",
      segmentId: "m1-l7-s1",
      timestampSeconds: 260,
      type: "choice",
      concept: "Diagnosing variance",
      scenario:
        "A very flexible model fits its training data beautifully. But each time the team retrains on a fresh sample, the model's shape changes dramatically - and its performance on new data swings wildly.",
      prompt: "What's the best diagnosis?",
      options: [
        "High bias - it misses the real pattern",
        "High variance - it reacts to the noise of whichever sample it trains on",
        "Irreducible error - nothing can be done",
        "Low bias and low variance - nothing is wrong",
      ],
      correct: 1,
      explanation:
        "A model that changes dramatically depending on which particular examples it trained on is the textbook picture of high variance - it is fitting the quirks of its sample, not just the underlying pattern.",
    },
    {
      id: "m1-l7-cp3",
      segmentId: "m1-l7-s1",
      timestampSeconds: 390,
      type: "multi",
      concept: "Reducible vs irreducible error",
      prompt: "Select every source of error that a better model could reduce.",
      options: [
        "Bias from an over-simple model",
        "Variance from an over-flexible model",
        "Random noise that exists in the world itself, beyond any data",
        "Unmeasured factors that influence outcomes (e.g., a buyer's mood)",
      ],
      correct: [0, 1],
      explanation:
        "Bias and variance are reducible: they come from modeling choices, so better choices shrink them. Noise in the world and unmeasured factors are irreducible - no model can predict what was never captured in data. Irreducible error sets the floor.",
    },
  ],
  activity: {
    kind: "flexibility-slider",
    heading: "Optional exercise - Model flexibility explorer",
    intro:
      "Drag the slider from a rigid model to an extremely flexible one and watch bias, variance and noise-sensitivity shift. A conceptual visualization - not an exact simulation.",
  },
  quizId: "quiz-m1-l7",
  freeResponses: [
    {
      id: "fr-m1-l7-1",
      prompt:
        "Explain bias and variance using an analogy of your own. Then describe what happens to each as a model becomes more flexible, and why that's called a trade-off.",
      guidance:
        "Aim for 3-5 sentences. Any analogy works - cooking, sports, music, driving - as long as the two failure modes come through.",
      expectedConcepts: ["bias", "variance", "flexib", "noise", "trade", "simple", "pattern"],
      rubric: [
        "Explains bias as systematically missing the real pattern (too simple)",
        "Explains variance as over-reacting to the particular sample (too flexible)",
        "Captures the trade-off: increasing flexibility lowers bias but raises variance",
      ],
      minLength: 100,
      maxLength: 1400,
    },
    {
      id: "fr-m1-l7-2",
      prompt:
        "Explain reducible vs. irreducible error in your own words, and give one example of each for a house-price model.",
      guidance: "Aim for 2-4 sentences. One kind of error can shrink; the other is the floor.",
      expectedConcepts: ["reducible", "irreducible", "noise", "bias", "variance", "floor", "unmeasur"],
      rubric: [
        "Correctly assigns bias/variance to the reducible category",
        "Gives a concrete irreducible example (buyer mood, unrecorded factors, pure randomness)",
        "Explains the floor concept - no model can go below it",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l7-3",
      prompt:
        "A model scores 55% accuracy on training data and 54% on test data, while the best teams on the same problem reach 95%. Diagnose the failure mode and prescribe a cure.",
      guidance: "Aim for 2-3 sentences. Look at both the gap and the absolute level.",
      expectedConcepts: ["bias", "underfit", "simple", "flexib", "low variance", "train"],
      rubric: [
        "Identifies high bias / underfitting (both scores low, tiny gap)",
        "Prescribes more flexibility or a richer model",
        "Justifies the diagnosis using the train/test comparison",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l7-4",
      prompt:
        "Why is \"zero training error\" not a goal worth chasing? Explain what a model with zero training error has probably learned, and what that costs it on new data.",
      guidance: "Aim for 2-3 sentences. What does a model memorize when it fits perfectly?",
      expectedConcepts: ["noise", "memoriz", "variance", "generaliz", "overfit", "sample"],
      rubric: [
        "Explains that zero training error means fitting noise/quirks, not just the pattern",
        "Connects to high variance / poor generalization on new data",
        "States the honest goal: approach the irreducible floor, not zero",
      ],
      minLength: 80,
      maxLength: 1000,
    },
  ],
  requiredSectionIds: [
    "m1-l7-cp1",
    "m1-l7-cp2",
    "m1-l7-cp3",
    "m1-l7-sheet",
    "m1-l7-refs",
    "m1-l7-quiz",
    "fr-m1-l7-1",
    "fr-m1-l7-2",
    "fr-m1-l7-3",
    "fr-m1-l7-4",
  ],
  optionalSectionIds: ["m1-l7-activity"],
};
