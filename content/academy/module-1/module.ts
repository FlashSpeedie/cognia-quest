import type { AcademyModule, VideoSegment } from "../types";

/**
 * Module 1 - AI & Machine Learning Foundations.
 *
 * Educational structure and teaching copy are original to Cognia Quest.
 * Each lesson plays one or more exact segments of the external source video
 * (hosted by the original publisher on YouTube); lessons cite those segments
 * for attribution and never re-host or reproduce the video or transcript.
 */

const VID = "0oyDqO8PjIg";

function seg(
  id: string,
  startSeconds: number,
  endSeconds: number,
  chapter: string,
  label: string,
): VideoSegment {
  return { id, videoId: VID, startSeconds, endSeconds, chapter, label };
}

/** Lesson 1 starts at the conceptual material (09:09), skipping the intro/sales portion. */
const L1_SEGMENTS = [
  seg("m1-l1-s1", 549, 1043, "Machine Learning Roadmap", "What is Machine Learning?"),
];

/** Lesson 2 walks the five foundational skill areas as a segment playlist. */
const L2_SEGMENTS = [
  seg("m1-l2-s1", 1043, 1335, "Machine Learning Roadmap", "Mathematics foundation"),
  seg("m1-l2-s2", 1335, 1566, "Machine Learning Roadmap", "Statistics foundation"),
  seg("m1-l2-s3", 1566, 1833, "Machine Learning Roadmap", "Machine learning fundamentals"),
  seg("m1-l2-s4", 1833, 2082, "Machine Learning Roadmap", "Python foundation"),
  seg("m1-l2-s5", 2082, 2187, "Machine Learning Roadmap", "Introductory NLP"),
];

const L3_SEGMENTS = [
  seg("m1-l3-s1", 3001, 3143, "ML Basics", "Supervised vs. Unsupervised Learning"),
];

const L4_SEGMENTS = [
  seg("m1-l4-s1", 3143, 3282, "ML Basics", "Regression vs. Classification"),
];

const L5_SEGMENTS = [
  seg("m1-l5-s1", 3282, 3702, "ML Basics", "Evaluating Model Performance"),
];

const L6_SEGMENTS = [
  seg("m1-l6-s1", 3702, 3907, "ML Basics", "Training, Validation & Testing"),
];

const L7_SEGMENTS = [
  seg("m1-l7-s1", 3915, 4341, "Bias-Variance Trade-off", "Bias & Variance"),
];

/** Final Module 1 video segment: stops before Chapter 6 (Linear Regression, 1:41:12). */
const L8_SEGMENTS = [
  seg("m1-l8-s1", 4349, 6063, "Overfitting & Regularization", "Overfitting & Generalization"),
];

export const LESSON_SEGMENTS: Record<string, VideoSegment[]> = {
  "m1-l1": L1_SEGMENTS,
  "m1-l2": L2_SEGMENTS,
  "m1-l3": L3_SEGMENTS,
  "m1-l4": L4_SEGMENTS,
  "m1-l5": L5_SEGMENTS,
  "m1-l6": L6_SEGMENTS,
  "m1-l7": L7_SEGMENTS,
  "m1-l8": L8_SEGMENTS,
};

/** Total lesson-local playback seconds for a lesson's segment playlist. */
export function lessonVideoSeconds(lessonId: string): number {
  return (LESSON_SEGMENTS[lessonId] ?? []).reduce(
    (sum, s) => sum + (s.endSeconds - s.startSeconds),
    0,
  );
}

export const MODULE_1: AcademyModule = {
  id: "module-1",
  number: 1,
  title: "AI & Machine Learning Foundations",
  subtitle:
    "Understand how machines learn, how learning problems are categorized, and how we evaluate whether a model is actually working.",
  description:
    "Eight lessons that build a working mental model of machine learning: what it is, the shapes learning problems take, how models are measured, and why models that look brilliant can still fail in the real world.",
  source: {
    videoId: VID,
    title: "AI Foundations Course – Python, Machine Learning, Deep Learning, Data Science",
    creator: "LunarTech",
    platform: "YouTube",
    url: "https://www.youtube.com/watch?v=0oyDqO8PjIg",
  },
  lessons: [
    {
      id: "m1-l1",
      slug: "welcome-to-machine-learning",
      order: 1,
      title: "Welcome to Machine Learning",
      minutes: 20,
      summary:
        "What machine learning actually is, how it differs from classic rule-based AI, and where it quietly shows up in everyday products.",
      goals: [
        "Explain what machine learning is in simple language",
        "Distinguish AI from machine learning at a foundational level",
        "Recognize common real-world ML applications across industries",
      ],
    },
    {
      id: "m1-l2",
      slug: "the-ml-roadmap",
      order: 2,
      title: "The Machine Learning Roadmap",
      minutes: 30,
      summary:
        "The broad skill areas behind practical machine learning - mathematics, statistics, ML, Python and introductory NLP - and how they stack on top of each other.",
      goals: [
        "Name the skill areas that make up practical machine learning",
        "Explain the learning stack from data to applications",
        "Describe what natural language processing means at an introductory level",
      ],
    },
    {
      id: "m1-l3",
      slug: "supervised-vs-unsupervised",
      order: 3,
      title: "Supervised vs. Unsupervised Learning",
      minutes: 20,
      summary:
        "The first big fork in the road: learning with an answer key (supervised) versus finding hidden structure without one (unsupervised).",
      goals: [
        "Explain the difference between labeled and unlabeled data",
        "Define features and the target variable",
        "Explain supervised and unsupervised learning",
        "Recognize clustering and outlier detection as unsupervised tasks",
      ],
    },
    {
      id: "m1-l4",
      slug: "regression-vs-classification",
      order: 4,
      title: "Regression vs. Classification",
      minutes: 15,
      summary:
        "Supervised learning splits into two flavors: predicting a number (regression) or predicting a category (classification).",
      goals: [
        "Distinguish continuous outputs from categorical outputs",
        "Explain regression and classification in your own words",
        "Map real-world problems to the right prediction type",
      ],
    },
    {
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
    {
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
    {
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
    {
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
  ],
};

/** Mastery threshold (percent) for passing the Module 1 assessment. */
export const MODULE_TEST_PASS_THRESHOLD = 80;

/**
 * Quiz score (percent) a lesson must reach to count as passed. Defined in
 * lib/academy (client-safe) so section unlocking and server grading can
 * never drift apart.
 */
export { LESSON_MASTERY_THRESHOLD } from "../../../lib/academy";

export function lessonMetaBySlug(slug: string) {
  return MODULE_1.lessons.find((l) => l.slug === slug) ?? null;
}

export function lessonMetaById(id: string) {
  return MODULE_1.lessons.find((l) => l.id === id) ?? null;
}

export const MODULE_1_SOURCE_VIDEO_TITLE = "AI Foundations Course – Python, Machine Learning, Deep Learning, Data Science";
