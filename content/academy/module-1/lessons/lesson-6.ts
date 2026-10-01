import type { AcademyLesson } from "../../types";

export const lesson6: AcademyLesson = {
  meta: {
    id: "m1-l6",
    slug: "training-validation-and-testing",
    order: 6,
    title: "Training, Validation, and Testing",
    minutes: 15,
    segment: { chapter: 3, chapterTitle: "ML Basics", start: 3702, end: 3907 },
    summary:
      "A model graded on the questions it memorized will always look smart. Data splits exist to keep us honest.",
    goals: [
      "Explain the purpose of the training, validation and test sets",
      "Put the ML workflow steps in the correct order",
      "Explain what generalization to unseen data means",
    ],
  },
  moduleId: "module-1",
  quizId: "quiz-m1-l6",
  intro: [
    {
      kind: "text",
      heading: "The student who memorized the answer key",
      paragraphs: [
        "Imagine studying for an exam by reading the answer key - then being graded on those same questions. You'd score perfectly, and it would mean nothing about whether you understood the material.",
        "A model evaluated on the same data it trained on is in exactly that position. It gets to see the answers while learning. Any score measured there measures memory, not skill. The fix is simple in principle: hold data out - and grade the model only on examples it has never seen.",
      ],
    },
  ],
  blocks: [
    {
      kind: "definition",
      term: "Training set",
      body: "The examples the model learns from - the only data it is allowed to study while fitting its patterns.",
    },
    {
      kind: "definition",
      term: "Validation set",
      body: "Examples held back from training, used during development to compare options and tune choices - which model type, which settings, how long to train.",
    },
    {
      kind: "definition",
      term: "Test set",
      body: "A final, untouched set of examples used exactly once at the end: the honest exam that estimates how the model will behave on new data.",
    },
    {
      kind: "text",
      heading: "Why three sets instead of one?",
      paragraphs: [
        "You might wonder: if the point is unseen data, why not just split into train and test? Because development is full of decisions. Which algorithm? How flexible should the model be? When to stop training? Every time you tweak a choice based on a score, you're leaking information from the data used to compute that score.",
        "The validation set absorbs that leakage. It's the scratch paper - you consult it freely while developing, comparing options and tuning settings. Then, when you've made your final choices, the test set delivers the verdict. Because the test set influenced no decisions along the way, its score is an honest estimate of real-world performance.",
      ],
    },
    {
      kind: "diagram",
      id: "ml-workflow-pipeline",
      caption:
        "The workflow: prepare and split the data, train on the training set, tune using the validation set, then take the test exactly once. Generalization to unseen data is the goal the whole pipeline serves.",
    },
    {
      kind: "text",
      heading: "Generalization - the real goal",
      paragraphs: [
        "Everything above serves one purpose: generalization, the ability of a model's learned patterns to hold up on data it has never seen. That's the only performance that matters, because deployed models live entirely on new data - new emails, new transactions, new patients, new houses.",
        "The test score matters precisely because it's the closest honest rehearsal for that future. A model that scores 94% on held-out data is (with proper care) a model you can expect to be right about 94% of the time on genuinely new cases. A model that scores 100% on training data tells you nothing at all.",
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The test set is spent when you use it",
      body: "The moment you change a model decision because the test score disappointed you, the test set has leaked into your choices - and its next score is no longer a clean estimate. Teams guard test sets like exam answer keys: opened once, at the end, and never again.",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l6-cp1",
        type: "order",
        concept: "The ML workflow",
        prompt: "Put the machine learning workflow in the correct order.",
        items: [
          "Evaluate the final model on the test set",
          "Prepare the data (clean, format, gather examples)",
          "Tune choices by comparing options on the validation set",
          "Split the data into training, validation and test sets",
          "Train a model on the training set",
        ],
        correctOrder: [1, 3, 4, 2, 0],
        explanation:
          "Prepare first, then split before any learning happens (so the held-out sets stay untouched). Training comes next, then validation for tuning, and the test set is opened last for the final honest evaluation.",
      },
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l6-cp2",
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
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l6-cp3",
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
    },
  ],
  activity: {
    kind: "workflow-ordering",
    heading: "Activity - Order the ML workflow",
    intro:
      "The six steps of the workflow are shuffled. Restore the correct order using the move buttons or your keyboard.",
  },
  freeResponse: {
    id: "fr-m1-l6",
    prompt:
      "Why does a model need a test set it has never seen? Explain what could go wrong if a team skipped it and reported the training score instead.",
    guidance: "Aim for 2-4 sentences. The words \"memorize\" and \"honest\" may help.",
    expectedConcepts: [
      "unseen",
      "new data",
      "memorize",
      "honest",
      "generalize",
      "inflated",
      "overestimate",
    ],
    rubric: [
      "Explains that training-data scores measure memorization, not generalization",
      "Describes the risk: an inflated estimate that doesn't hold up on new data",
      "Connects the test set to an honest estimate of real-world performance",
    ],
    minLength: 80,
    maxLength: 1200,
  },
  requiredSectionIds: ["m1-l6-cp1", "m1-l6-cp2", "m1-l6-cp3", "m1-l6-activity", "m1-l6-quiz", "m1-l6-freeresponse"],
};
