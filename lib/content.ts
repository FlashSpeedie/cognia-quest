/** Content model - modules, lessons, quizzes, missions, cases (spec §40/§86). */

// ── Quizzes ─────────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  kind: "mcq" | "multi" | "tf";
  prompt: string;
  choices: string[];
  /** indexes into choices that are correct (>=1) */
  correct: number[];
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

// ── Lessons ────────────────────────────────────────────────────────────
export type LessonSection =
  | { id: string; kind: "concept"; heading: string; body: string[] }
  | { id: string; kind: "callout"; variant: "info" | "warning" | "tip"; title: string; body: string }
  | { id: string; kind: "interactive"; widget: string; heading: string; body?: string }
  | { id: string; kind: "quiz"; quizId: string };

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  minutes: number;
  xp: number;
  outcomes: string[];
  sections: LessonSection[];
}

export interface ModuleDef {
  id: string;
  slug: string;
  order: number;
  title: string;
  tagline: string;
  description: string;
  icon: string; // emoji-free glyph key used by QuestMap & cards
  color: "pulse" | "volt" | "mint" | "amber" | "rose";
  lessons: Lesson[];
}

// ── Missions ────────────────────────────────────────────────────────────
export interface MissionObjective {
  id: string;
  label: string;
  /** event the server recognizes: e.g. sim:train-machine, lesson:fund-what-is-ai */
  event?: { type: string; id: string };
}

export interface MissionDef {
  id: string;
  order: number;
  title: string;
  description: string;
  minutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  objectives: MissionObjective[];
  /** primary call-to-action target */
  href: string;
  /** client-completed missions need the server to verify these events */
  requiresEvents: boolean;
}

// ── Badges ──────────────────────────────────────────────────────────────
export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  hint: string; // "how to earn" shown while locked
  rarity: "common" | "rare" | "epic" | "legendary";
}

// ── AI Detective ────────────────────────────────────────────────────────
export type IssueType =
  | "hallucination"
  | "unsupported"
  | "outdated"
  | "bias"
  | "misleading"
  | "missing-context"
  | "privacy"
  | "overconfidence"
  | "none";

export const ISSUE_LABELS: Record<IssueType, string> = {
  hallucination: "Hallucination",
  unsupported: "Unsupported claim",
  outdated: "Outdated information",
  bias: "Bias",
  misleading: "Misleading wording",
  "missing-context": "Missing context",
  privacy: "Privacy concern",
  overconfidence: "Overconfidence",
  none: "Nothing - this is fine",
};

export interface DetectiveCase {
  id: string;
  caseNo: number;
  title: string;
  /** The AI's output, broken into inspectable fragments. */
  response: string;
  evidence: { claim: string; source: string; context: string; logic: string };
  correctIssue: IssueType;
  explanation: string;
  teachingPoint: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// ── Ethics Court ────────────────────────────────────────────────────────
export type EthicsCategory =
  | "privacy" | "accuracy" | "fairness" | "transparency" | "human-review" | "safety";

export interface EthicsFactor {
  id: string;
  label: string;
  category: EthicsCategory;
  /** important = students SHOULD raise this question */
  important: boolean;
  explanation: string;
}

export interface EthicsCase {
  id: string;
  title: string;
  scenario: string;
  setting: string;
  benefits: string[];
  risks: string[];
  factors: EthicsFactor[];
  debrief: string;
}

// ── Privacy challenges ──────────────────────────────────────────────────
export interface PrivacyScenario {
  id: string;
  title: string;
  context: string;
  app: string;
  dataRequests: { id: string; label: string; needed: boolean; reason: string }[];
  principle: string;
}

// ── Prompt challenges ───────────────────────────────────────────────────
export interface PromptTask {
  id: string;
  category: string;
  task: string;
  weakExample: string;
  hints: string[];
  /** ideas a strong prompt should cover (shown after submission) */
  expectations: string[];
}

// ── Tool selector ───────────────────────────────────────────────────────
export interface ToolScenario {
  id: string;
  scenario: string;
  options: string[]; // tool categories
  correct: number;
  why: string;
  risks: string;
  verify: string;
}

// ── Glossary & careers ──────────────────────────────────────────────────
export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  related?: string[];
}

export interface Career {
  title: string;
  icon: string;
  what: string;
  skills: string[];
  subjects: string[];
}
