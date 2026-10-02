import type { AcademyLesson } from "../../types";
import { LESSON_SEGMENTS } from "../module";

export const lesson6: AcademyLesson = {
  meta: {
    id: "m1-l6",
    slug: "training-validation-and-testing",
    order: 6,
    title: "Training, Validation, and Testing",
    minutes: 15,
    summary:
      "A model graded on the questions it memorized will always look smart. Data splits exist to keep us honest.",
    goals: [
      "Explain the purpose of the training, validation and test sets",
      "Put the ML workflow steps in the correct order",
      "Explain what generalization to unseen data means",
    ],
  },
  moduleId: "module-1",
  video: { segments: LESSON_SEGMENTS["m1-l6"]! },
  sheet: {
    coreIdea: [
      "Imagine studying for an exam by reading the answer key - then being graded on those same questions. You'd score perfectly, and it would mean nothing about whether you understood the material.",
      "A model evaluated on the same data it trained on is in exactly that position. It gets to see the answers while learning. Any score measured there measures memory, not skill. The fix is simple in principle: hold data out - and grade the model only on examples it has never seen.",
    ],
    vocabulary: [
      {
        term: "Training set",
        body: "The examples the model learns from - the only data it is allowed to study while fitting its patterns.",
      },
      {
        term: "Validation set",
        body: "Examples held back from training, used during development to compare options and tune choices - which model type, which settings, how long to train.",
      },
      {
        term: "Test set",
        body: "A final, untouched set of examples used exactly once at the end: the honest exam that estimates how the model will behave on new data.",
      },
      {
        term: "Generalization",
        body: "How well a model's learned patterns hold up on data it has never seen - the only performance that matters in the real world.",
      },
      {
        term: "Hyperparameter tuning",
        body: "The development step of adjusting a model's settings by comparing options against the validation set.",
      },
    ],
    concepts: [
      {
        title: "The workflow, step by step",
        body: [
          "Prepare the data: clean it, gather examples, and split off the validation and test sets before any learning happens - so held-out data stays untouched.",
          "Train a model on the training set, then validate and tune: compare options, adjust settings, always judged on the validation set.",
          "Finally, evaluate once on the untouched test set - the honest verdict - and decide whether the model is good enough to deploy. Everything above serves one purpose: generalization to data the model has never seen.",
        ],
        diagramId: "ml-workflow-pipeline",
      },
      {
        title: "Why three sets instead of one",
        body: [
          "You might wonder: if the point is unseen data, why not just split into train and test? Because development is full of decisions. Which algorithm? How flexible should the model be? When to stop training?",
          "Every time you tweak a choice based on a score, you're leaking information from the data used to compute that score. The validation set absorbs that leakage. It's the scratch paper - you consult it freely while developing. Then, when you've made your final choices, the test set delivers the verdict. Because the test set influenced no decisions along the way, its score is an honest estimate of real-world performance.",
        ],
      },
      {
        title: "The test set is spent when you use it",
        body: [
          "The moment you change a model decision because the test score disappointed you, the test set has leaked into your choices - and its next score is no longer a clean estimate. Teams guard test sets like exam answer keys: opened once, at the end, and never again.",
        ],
      },
    ],
    example: {
      title: "Choosing a winner on the test set",
      body: [
        "A student tries 50 different models and submits whichever happened to score best on the test set. The reported score looks great.",
        "But the test set has become a tuning tool - with 50 attempts, one was bound to get lucky. The score is inflated: it no longer estimates unseen-data performance. The honest workflow: compare the 50 options on the validation set, choose one, then open the test set exactly once.",
      ],
    },
    commonConfusion: {
      title: "Validation set vs. test set",
      body: "Both are held back from training - so students merge them. Keep the purposes separate. The validation set is a development tool: you may consult it as often as you like while comparing options and tuning settings. The test set is a one-shot final exam: opened once, after all decisions are locked in. Validation answers \"which model should I build?\"; test answers \"how good is the one I built?\"",
    },
    thinkAboutIt:
      "Would you trust a driver who had only ever practiced on one route, and was graded on that same route? What does that intuition say about grading a model on its own training data?",
    keyTakeaways: [
      "A model's score on its own training data measures memory, not skill.",
      "Train on the training set; tune against the validation set; test exactly once.",
      "Every decision made from a score leaks information from the data behind it.",
      "The test set is opened once, at the end - using it to pick a model inflates the estimate.",
      "Generalization to unseen data is the whole goal; held-out splits are how we estimate it honestly.",
    ],
    sourceConnection:
      "This lesson plays the source segment 1:01:42\u20131:05:07 (Chapter 3 — ML Basics), where LunarTech walks through the model-training workflow: preparing data, splitting into training/validation/test sets, training, hyperparameter tuning, final testing and evaluation.",
  },
  checkpoints: [
    {
      id: "m1-l6-cp1",
      segmentId: "m1-l6-s1",
      timestampSeconds: 90,
      type: "order",
      concept: "The ML workflow",
      prompt: "Put the machine learning workflow in the correct order.",
      items: [
        "Evaluate the final model on the test set",
        "Prepare the data (clean, gather examples)",
        "Tune choices by comparing options on the validation set",
        "Split the data into training, validation and test sets",
        "Train a model on the training set",
      ],
      correctOrder: [1, 3, 4, 2, 0],
      explanation:
        "Prepare first, then split before any learning happens (so the held-out sets stay untouched). Training comes next, then validation for tuning, and the test set is opened last for the final honest evaluation.",
    },
    {
      id: "m1-l6-cp2",
      segmentId: "m1-l6-s1",
      timestampSeconds: 150,
      type: "choice",
      concept: "Why hold out a test set",
      prompt: "What is the core reason to evaluate on data the model has never seen?",
      options: [
        "It makes the score higher",
        "It measures memory instead of skill",
        "It estimates how the model will perform on truly new data",
        "It speeds up training",
      ],
      correct: 2,
      explanation:
        "A test set exists to estimate real-world performance. Training-data scores measure memory; only unseen data measures whether the learned patterns generalize - which is the whole point.",
    },
    {
      id: "m1-l6-cp3",
      segmentId: "m1-l6-s1",
      timestampSeconds: 195,
      type: "choice",
      concept: "Test-set leakage",
      scenario:
        "A student keeps trying model after model, checking each one's test score, and submits whichever happened to score best on it.",
      prompt: "What's wrong with this process?",
      options: [
        "Nothing - it's exactly what validation is for",
        "The test set has become a tuning tool; its score is now an inflated, optimistic estimate",
        "The training set was too small",
        "Testing multiple models is not allowed in machine learning",
      ],
      correct: 1,
      explanation:
        "Trying many models is normal - but on the validation set, not the test set. Once you pick the winner by its test score, the test set has influenced your decision, and its score no longer estimates unseen-data performance. The reported number is inflated.",
    },
  ],
  activity: {
    kind: "workflow-ordering",
    heading: "Optional exercise — Order the ML workflow",
    intro: "The six steps of the workflow are shuffled. Restore the correct order using the move buttons or your keyboard.",
  },
  quizId: "quiz-m1-l6",
  freeResponses: [
    {
      id: "fr-m1-l6-1",
      prompt:
        "Why does a model need a test set it has never seen? Explain what could go wrong if a team skipped it and reported the training score instead.",
      guidance: "Aim for 2-4 sentences. The words \"memorize\" and \"honest\" may help.",
      expectedConcepts: ["unseen", "new data", "memorize", "honest", "generalize", "inflated", "overestimate"],
      rubric: [
        "Explains that training-data scores measure memorization, not generalization",
        "Describes the risk: an inflated estimate that doesn't hold up on new data",
        "Connects the test set to an honest estimate of real-world performance",
      ],
      minLength: 80,
      maxLength: 1200,
    },
    {
      id: "fr-m1-l6-2",
      prompt:
        "Explain the difference between the validation set and the test set - and why development needs both instead of just one held-out set.",
      guidance: "Aim for 2-4 sentences. One is a scratch pad; the other is a sealed exam.",
      expectedConcepts: ["validation", "test", "tune", "final", "leak", "honest", "once"],
      rubric: [
        "Describes validation as the development/tuning set consulted freely",
        "Describes test as the one-shot final exam",
        "Explains the leakage argument: decisions made from a score drain that data's honesty",
      ],
      minLength: 100,
      maxLength: 1200,
    },
    {
      id: "fr-m1-l6-3",
      prompt:
        "A teammate proposes saving time by tuning on the test set since it's \"the most realistic data.\" Write the two-sentence reply that stops them.",
      guidance: "Aim for exactly 2-3 sentences. What breaks the moment the test set guides a decision?",
      expectedConcepts: ["test", "leak", "tune", "validation", "honest", "inflat"],
      rubric: [
        "Identifies the consequence: the test score stops being an honest estimate",
        "Redirects tuning to the validation set",
        "Keeps it short and persuasive, not technical",
      ],
      minLength: 60,
      maxLength: 600,
    },
    {
      id: "fr-m1-l6-4",
      prompt:
        "In your own words, explain \"generalization\" and why it - not training performance - is the goal of the whole train/validate/test pipeline.",
      guidance: "Aim for 2-3 sentences. Where do deployed models actually live?",
      expectedConcepts: ["generaliz", "unseen", "new", "future", "real world", "goal"],
      rubric: [
        "Defines generalization as performing well on never-seen data",
        "Notes that deployed models live entirely on new data",
        "Ties the pipeline's purpose back to estimating that honestly",
      ],
      minLength: 80,
      maxLength: 1000,
    },
  ],
  requiredSectionIds: [
    "m1-l6-cp1",
    "m1-l6-cp2",
    "m1-l6-cp3",
    "m1-l6-quiz",
    "fr-m1-l6-1",
    "fr-m1-l6-2",
    "fr-m1-l6-3",
    "fr-m1-l6-4",
  ],
  optionalSectionIds: ["m1-l6-activity"],
};
