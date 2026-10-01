import type { AcademyModule } from "../types";

/**
 * Module 1 - AI & Machine Learning Foundations.
 *
 * Educational structure and teaching copy are original to Cognia Quest.
 * Each lesson is aligned to an exact segment of the external source video
 * (hosted by the original publisher on YouTube); lessons cite that segment
 * for attribution and never re-host or reproduce the video or transcript.
 */
export const MODULE_1: AcademyModule = {
  id: "module-1",
  number: 1,
  title: "AI & Machine Learning Foundations",
  subtitle:
    "Understand how machines learn, how learning problems are categorized, and how we evaluate whether a model is actually working.",
  description:
    "Eight lessons that build a working mental model of machine learning: what it is, the shapes learning problems take, how models are measured, and why models that look brilliant can still fail in the real world.",
  source: {
    videoId: "0oyDqO8PjIg",
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
      segment: {
        chapter: 1,
        chapterTitle: "Introduction",
        start: 0,
        end: 1043,
      },
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
      minutes: 15,
      segment: {
        chapter: 2,
        chapterTitle: "Machine Learning Roadmap",
        start: 1043,
        end: 1566,
      },
      summary:
        "The broad skill areas behind practical machine learning - and how they stack on top of each other, one layer at a time.",
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
      segment: {
        chapter: 3,
        chapterTitle: "ML Basics",
        start: 3001,
        end: 3143,
      },
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
      segment: {
        chapter: 3,
        chapterTitle: "ML Basics",
        start: 3143,
        end: 3282,
      },
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
      segment: {
        chapter: 3,
        chapterTitle: "ML Basics",
        start: 3282,
        end: 3702,
      },
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
      segment: {
        chapter: 3,
        chapterTitle: "ML Basics",
        start: 3702,
        end: 3907,
      },
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
      segment: {
        chapter: 4,
        chapterTitle: "Bias-Variance Trade-off",
        start: 3915,
        end: 4341,
      },
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
      minutes: 25,
      segment: {
        chapter: 5,
        chapterTitle: "Overfitting & Regularization",
        start: 4349,
        end: 6063,
      },
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

/** Quiz score (percent) a lesson must reach to count as mastered. */
export const LESSON_MASTERY_THRESHOLD = 80;

export function lessonMetaBySlug(slug: string) {
  return MODULE_1.lessons.find((l) => l.slug === slug) ?? null;
}

export function lessonMetaById(id: string) {
  return MODULE_1.lessons.find((l) => l.id === id) ?? null;
}
