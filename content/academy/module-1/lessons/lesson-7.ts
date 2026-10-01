import type { AcademyLesson } from "../../types";

export const lesson7: AcademyLesson = {
  meta: {
    id: "m1-l7",
    slug: "bias-and-variance",
    order: 7,
    title: "Bias and Variance",
    minutes: 20,
    segment: { chapter: 4, chapterTitle: "Bias-Variance Trade-off", start: 3915, end: 4341 },
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
  quizId: "quiz-m1-l7",
  intro: [
    {
      kind: "text",
      heading: "Two different ways to be wrong",
      paragraphs: [
        "When a model misses, it misses for one of two very different reasons - and the reasons need opposite cures. Understanding this pair - bias and variance - is the single most powerful diagnostic idea in this module.",
        "Here's the setup. A model is trained on one particular sample of data. That sample contains both the real underlying pattern and the random quirks of those particular examples. A model can go wrong by missing the pattern, or by chasing the quirks. Bias and variance are the names for those two failure modes.",
      ],
    },
  ],
  blocks: [
    {
      kind: "definition",
      term: "Bias",
      body: "Error that comes from the model being too simple to capture the real pattern - it misses the truth systematically, in the same direction, no matter which examples it trains on.",
    },
    {
      kind: "definition",
      term: "Variance",
      body: "Error that comes from the model being too sensitive to the particular training examples - train it on a different sample of the same phenomenon, and you'd get a noticeably different model.",
    },
    {
      kind: "text",
      heading: "Flexibility turns the dial",
      paragraphs: [
        "Model flexibility is the control that moves both. A simple, inflexible model - imagine fitting a straight line through data that actually curves - is forced to ignore subtleties. It misses the real pattern: that's high bias. But it's also steady: retrain it on a different sample and you get roughly the same line. Low variance.",
        "A very flexible model has the opposite personality. It can bend to capture genuinely curved, complicated patterns - bias falls. But that same bendiness means it also wraps itself around the random quirks of its particular training sample. Retrain on a different sample and you can get a noticeably different model: high variance.",
        "Between the extremes sits the sweet spot: enough flexibility to capture the real pattern, not so much that the model starts modeling noise. That tension - bias falling as variance rises, and vice versa - is the bias-variance trade-off.",
      ],
    },
    {
      kind: "callout",
      variant: "think",
      title: "Think about it - the dartboard",
      body: "Picture a dartboard. High bias = darts clustered tightly together, but far from the bullseye: consistent, but systematically off. High variance = darts scattered wildly around the board: on average they might center near the bullseye, but any single throw is unpredictable. Where would you rather your model's predictions land - and why?",
    },
    {
      kind: "diagram",
      id: "bias-variance-spectrum",
      caption:
        "As flexibility rises, bias falls (the model captures more of the true pattern) while variance rises (the model reacts more to the noise of its particular sample).",
    },
    {
      kind: "text",
      heading: "Reducible and irreducible error",
      paragraphs: [
        "One more distinction completes the picture. Some error is reducible: it exists because of our modeling choices, and better choices - more flexibility, or less - can shrink it. Bias and variance are both reducible.",
        "But some error is irreducible: noise built into the world itself. Two nearly identical houses can sell for different prices because the buyers were in different moods. No model, however brilliant, can predict a coin flip's outcome. Irreducible error is the floor - the best any model can do - and knowing it exists keeps expectations honest.",
      ],
    },
    {
      kind: "callout",
      variant: "tip",
      title: "The goal isn't zero error",
      body: "Chasing a perfect score usually means the model has started memorizing noise. The realistic goal: get as close to the irreducible floor as possible - and stop there.",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l7-cp1",
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
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l7-cp2",
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
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l7-cp3",
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
    },
  ],
  activity: {
    kind: "flexibility-slider",
    heading: "Activity - Model flexibility explorer",
    intro:
      "Drag the slider from a rigid model to an extremely flexible one and watch bias, variance and noise-sensitivity shift. A conceptual visualization - not an exact simulation.",
  },
  freeResponse: {
    id: "fr-m1-l7",
    prompt:
      "Explain bias and variance using an analogy of your own. Then describe what happens to each as a model becomes more flexible, and why that's called a trade-off.",
    guidance: "Aim for 3-5 sentences. Any analogy works - cooking, sports, music, driving - as long as the two failure modes come through.",
    expectedConcepts: [
      "bias",
      "variance",
      "flexib",
      "noise",
      "trade",
      "simple",
      "pattern",
    ],
    rubric: [
      "Explains bias as systematically missing the real pattern (too simple)",
      "Explains variance as over-reacting to the particular sample (too flexible)",
      "Captures the trade-off: increasing flexibility lowers bias but raises variance",
    ],
    minLength: 100,
    maxLength: 1400,
  },
  requiredSectionIds: ["m1-l7-cp1", "m1-l7-cp2", "m1-l7-cp3", "m1-l7-activity", "m1-l7-quiz", "m1-l7-freeresponse"],
};
