/**
 * Content model for the Academy (New) learning experience.
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

/**
 * One focused slice of the (very long) external source video.
 * Lessons NEVER embed the full video; they play a playlist of segments,
 * each anchored to an exact chapter boundary from the source.
 */
export interface VideoSegment {
  id: string;
  videoId: string;
  startSeconds: number; // absolute position in the source video
  endSeconds: number; // absolute position in the source video
  chapter: string; // source chapter the slice belongs to
  label: string; // what this slice teaches
}

// ── Module & lesson metadata ──────────────────────────────────────────────
export interface AcademyLessonMeta {
  id: string; // "m1-l1"
  slug: string; // url segment
  order: number;
  title: string;
  minutes: number; // estimated learning time (video + sheet + practice)
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

// ── Lesson Sheet (the study material below the video) ─────────────────────
export type DiagramId =
  | "ml-in-products"
  | "learning-stack"
  | "supervised-vs-unsupervised"
  | "regression-vs-classification"
  | "metric-dashboard"
  | "ml-workflow-pipeline"
  | "bias-variance-spectrum"
  | "overfitting-curves";

export interface VocabularyCard {
  term: string;
  body: string;
}

export interface ConceptSection {
  title: string;
  body: string[];
  diagramId?: DiagramId;
}

export interface LessonSheet {
  /** the one core idea, in plain language */
  coreIdea: string[];
  vocabulary: VocabularyCard[];
  /** numbered "Concepts to Remember" sections */
  concepts: ConceptSection[];
  example: { title: string; body: string[] } | null;
  /** the mix-up students commonly make with this material */
  commonConfusion: { title: string; body: string } | null;
  /** one short reasoning prompt ("Think About It") */
  thinkAboutIt: string;
  /** 3-6 concise takeaways */
  keyTakeaways: string[];
  /** ties the sheet back to the exact source segments */
  sourceConnection: string;
}

// ── Checkpoints (video-tied practice) ────────────────────────────────────
export type Checkpoint =
  | {
      id: string;
      /** which source segment this checkpoint belongs to */
      segmentId: string;
      /** lesson-local time (seconds into the segment playlist) when it fires */
      timestampSeconds: number;
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
      segmentId: string;
      timestampSeconds: number;
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
      segmentId: string;
      timestampSeconds: number;
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
      segmentId: string;
      timestampSeconds: number;
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

// ── Interactive activities (optional enrichment, not required) ────────────
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

/** The auto-graded half of a lesson quiz: exactly 6 questions per lesson. */
export interface AcademyQuiz {
  id: string;
  title: string;
  lessonId: string | null; // null for the module test
  questions: AcademyQuestion[];
}

// ── Free response (the reasoning half of the quiz: 4 per lesson) ─────────
export interface FreeResponseDef {
  id: string; // doubles as the persistable step id, e.g. "fr-m1-l3-2"
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
  /** the focused source-segment playlist for this lesson */
  video: { segments: VideoSegment[] };
  sheet: LessonSheet;
  /** pause-and-think moments tied to video timestamps */
  checkpoints: Checkpoint[];
  activity: ActivityDef | null;
  /** the 6 auto-graded questions */
  quizId: string;
  /** the 4 reasoning/free-response questions */
  freeResponses: FreeResponseDef[];
  /** steps that must ALL be done for lesson completion */
  requiredSectionIds: string[];
  /** genuine interactions that are enrichment only (never block completion) */
  optionalSectionIds: string[];
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
