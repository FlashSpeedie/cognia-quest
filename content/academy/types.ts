/**
 * Content model for the Academy learning experience.
 *
 * All files under content/academy/ are server-side source material:
 * lesson pages and API routes read them on the server and pass plain
 * serializable data to client components. Client components must use
 * `import type` only - never import content values at runtime, so the
 * educational corpus never lands in the browser bundle.
 */

// ── Source video ──────────────────────────────────────────────────────────
export interface SourceVideo {
  /** YouTube video id - the video stays hosted by the original publisher. */
  videoId: string;
  title: string;
  creator: string;
  platform: "YouTube";
  url: string;
}

/** The exact slice of the source video a lesson is built from. */
export interface LessonSegment {
  chapter: number;
  chapterTitle: string;
  start: number; // seconds from video start
  end: number; // seconds from video start
}

// ── Module & lesson metadata ──────────────────────────────────────────────
export interface AcademyLessonMeta {
  id: string; // "m1-l1"
  slug: string; // url segment
  order: number;
  title: string;
  minutes: number; // estimated learning time (video + reading + practice)
  segment: LessonSegment;
  summary: string;
  goals: string[];
}

export interface AcademyModule {
  id: string; // "module-1"
  number: number; // 1 - used in the url /academy-new/module/1
  title: string;
  subtitle: string;
  description: string;
  source: SourceVideo;
  lessons: AcademyLessonMeta[];
}

// ── Explanation blocks (original Cognia Quest teaching copy) ───────────────
export type ExplanationBlock =
  | { kind: "text"; heading?: string; paragraphs: string[] }
  | { kind: "callout"; variant: "info" | "warning" | "tip" | "think"; title: string; body: string }
  | { kind: "definition"; term: string; body: string }
  | { kind: "example"; title: string; body: string[] }
  | { kind: "diagram"; id: DiagramId; caption?: string };

export type DiagramId =
  | "ml-in-products"
  | "learning-stack"
  | "supervised-vs-unsupervised"
  | "regression-vs-classification"
  | "metric-dashboard"
  | "ml-workflow-pipeline"
  | "bias-variance-spectrum"
  | "overfitting-curves";

// ── Checkpoints (ungraded practice woven through the explanation) ──────────
export type Checkpoint =
  | {
      id: string;
      type: "choice";
      concept: string;
      scenario?: string;
      prompt: string;
      options: string[];
      correct: number;
      explanation: string;
    }
  | {
      id: string;
      type: "multi";
      concept: string;
      scenario?: string;
      prompt: string;
      options: string[];
      correct: number[];
      explanation: string;
    }
  | {
      id: string;
      type: "order";
      concept: string;
      scenario?: string;
      prompt: string;
      items: string[];
      /** correct sequence, expressed as indexes into `items` */
      correctOrder: number[];
      explanation: string;
    }
  | {
      id: string;
      type: "match";
      concept: string;
      scenario?: string;
      prompt: string;
      left: string[];
      right: string[];
      /** for each item in `left`, the matching index into `right` */
      correct: number[];
      explanation: string;
    };

// ── Interactive activities ───────────────────────────────────────────────
export type ActivityKind =
  | "applications-spotter"
  | "roadmap-builder"
  | "supervised-sorter"
  | "task-chooser"
  | "metric-detective"
  | "workflow-ordering"
  | "flexibility-slider"
  | "overfitting-detective";

export interface ActivityDef {
  kind: ActivityKind;
  heading: string;
  intro: string;
}

// ── Graded questions ───────────────────────────────────────────────────────
export type QuestionDifficulty = "easy" | "conceptual" | "application" | "reasoning";

export interface QuestionBase {
  id: string;
  concept: string;
  difficulty: QuestionDifficulty;
  explanation: string;
  /** source chapter the idea comes from, for tutor alignment */
  chapter: number;
}

export type AcademyQuestion =
  | (QuestionBase & { kind: "mcq"; prompt: string; options: string[]; correct: number })
  | (QuestionBase & { kind: "multi"; prompt: string; options: string[]; correct: number[] })
  | (QuestionBase & {
      kind: "order";
      prompt: string;
      items: string[];
      /** correct sequence expressed as indexes into `items` */
      correct: number[];
    })
  | (QuestionBase & {
      kind: "match";
      prompt: string;
      left: string[];
      right: string[];
      /** for each item in `left`, the matching index into `right` */
      correct: number[];
    });

export interface AcademyQuiz {
  id: string;
  title: string;
  lessonId: string | null; // null for the module test
  questions: AcademyQuestion[];
}

// ── Free response (AI-assisted rubric feedback) ───────────────────────────
export interface FreeResponseDef {
  id: string;
  prompt: string;
  guidance: string;
  /** ideas a strong answer should touch - drives the deterministic check */
  expectedConcepts: string[];
  rubric: string[];
  minLength: number;
  maxLength: number;
}

// ── Full lesson content ────────────────────────────────────────────────────
export interface AcademyLesson {
  meta: AcademyLessonMeta;
  moduleId: string;
  /** explanation blocks rendered before the checkpoints */
  intro: ExplanationBlock[];
  /** interleaved explanation + checkpoint flow after the video */
  blocks: (ExplanationBlock | { kind: "checkpoint"; checkpoint: Checkpoint })[];
  activity: ActivityDef | null;
  quizId: string;
  freeResponse: FreeResponseDef | null;
  /** ids the server treats as "required steps" for lesson completion */
  requiredSectionIds: string[];
}

// ── References ────────────────────────────────────────────────────────────
export interface ReferenceEntry {
  id: string;
  kind: "primary" | "additional";
  label: string; // e.g. "Primary video source"
  title: string;
  creator?: string;
  platform?: string;
  url?: string;
  detail?: string; // e.g. "Chapter 3 - ML Basics (50:01-52:23)"
}

// ── Tutor knowledge base ──────────────────────────────────────────────────
export interface KnowledgeChunk {
  id: string;
  moduleId: string;
  lessonId: string;
  concept: string;
  summary: string;
  source: { chapter: number; start: number; end: number };
  keywords: string[];
}

export interface TutorSourceRef {
  lessonId: string;
  chapter: number;
  start: number;
  end: number;
}
