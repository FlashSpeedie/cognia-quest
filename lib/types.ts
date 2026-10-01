/**
 * Shared domain types for Cognia Quest.
 * These describe persisted rows (server store / Supabase tables)
 * and are the contract between client, API routes and services.
 */

export type Role = "student" | "admin";

export interface OnboardingState {
  completed: boolean;
  learnerType?: string; // explorer | coder | researcher | creative | engineer | beginner
  goal?: string; // understand | school | prompting | ml | expert
}

export interface Preferences {
  theme: "dark" | "light" | "system";
  reducedMotion: boolean;
  sound: boolean;
  leaderboardOptIn: boolean;
  notifications: { achievements: boolean; missions: boolean };
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "light",
  reducedMotion: false,
  sound: false,
  leaderboardOptIn: false,
  notifications: { achievements: true, missions: true },
};

export interface User {
  id: string;
  email: string;
  displayName: string;
  /** scrypt hash in "salt:hash" hex form. Null when managed by Supabase Auth. */
  passwordHash: string | null;
  role: Role;
  title: string; // current rank title, e.g. "AI Explorer"
  avatarId: string;
  createdAt: string;
  onboarding: OnboardingState;
  preferences: Preferences;
  /** Cached total XP - always kept consistent with xp_events by awardXP(). */
  xpTotal: number;
  isDemo: boolean;
  /** "active" (default) or "suspended". Suspended accounts cannot sign in. */
  status?: "active" | "suspended";
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// ── XP ──────────────────────────────────────────────────────────────────
export type XPSourceType =
  | "lesson"
  | "quiz"
  | "simulation"
  | "challenge"
  | "prompt"
  | "detective"
  | "ethics"
  | "privacy"
  | "mission"
  | "final";

export interface XPEvent {
  id: string;
  userId: string;
  amount: number;
  sourceType: XPSourceType;
  /** Logical source id e.g. lesson slug / mission id / case id. */
  sourceId: string;
  /** YYYY-MM-DD (server-local) - powers daily XP + streaks. */
  day: string;
  note?: string;
  createdAt: string;
}

// ── Badges ──────────────────────────────────────────────────────────────
export interface BadgeState {
  id: string;
  userId: string;
  badgeId: string;
  /** 0–1 progress toward unlocking. */
  progress: number;
  unlockedAt: string | null;
}

// ── Learning progress ───────────────────────────────────────────────────
export interface LessonProgress {
  id: string; // `${userId}:${lessonId}`
  userId: string;
  lessonId: string;
  moduleId: string;
  status: "not_started" | "in_progress" | "completed";
  sectionsDone: string[];
  quizBest: number | null; // best quiz % 0-100
  attempts: number;
  completedAt: string | null;
  updatedAt: string;
}

export interface MissionProgress {
  id: string; // `${userId}:${missionId}`
  userId: string;
  missionId: string;
  status: "locked" | "available" | "in_progress" | "completed";
  objectivesDone: string[];
  attempts: number;
  completedAt: string | null;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  lessonId: string | null;
  score: number; // correct count
  total: number;
  /** answers[i] = chosen option indexes */
  answers: number[][];
  createdAt: string;
}

export interface ChallengeAttempt {
  id: string;
  userId: string;
  challengeId: string; // detective case id, ethics case id, privacy id, tool id...
  kind: "detective" | "ethics" | "privacy" | "tool" | "bias";
  correct: boolean;
  detail: string;
  createdAt: string;
}

export interface PromptAttempt {
  id: string;
  userId: string;
  taskId: string; // "free" for the open lab
  prompt: string;
  score: number;
  dimensions: Record<string, number>;
  createdAt: string;
}

export interface SimRun {
  id: string;
  userId: string;
  simId: string; // "train-machine" | "bias" | "overfitting" | ...
  config: Record<string, unknown>;
  result: Record<string, unknown>;
  createdAt: string;
}

// ── Streaks & activity ──────────────────────────────────────────────────
export interface Streak {
  id: string; // userId
  userId: string;
  current: number;
  longest: number;
  lastActiveDay: string | null;
}

export interface ActivityItem {
  id: string;
  userId: string;
  kind: string; // lesson_completed, badge_unlocked, mission_completed, ...
  label: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  kind: "achievement" | "mission" | "level" | "info";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ── Final challenge ─────────────────────────────────────────────────────
export interface FinalResult {
  id: string; // userId
  userId: string;
  stageScores: Record<string, number>; // stage id -> 0-100
  totalScore: number;
  completedAt: string;
}

// ── Academy module assessment ────────────────────────────────────────────
/**
 * One row per (user, module) for the public Academy module tests.
 * Kept separate from lesson_progress because a module assessment has a
 * different shape: best score, attempts, and a pass/fail mastery decision
 * rather than a per-section checklist.
 */
export interface AcademyModuleResult {
  id: string; // `${userId}:${moduleId}`
  userId: string;
  moduleId: string; // e.g. "module-1"
  bestScore: number; // best attempt % 0-100
  passed: boolean; // bestScore reached the module's mastery threshold
  attempts: number;
  passedAt: string | null;
  updatedAt: string;
}

// ── Admin / audit ───────────────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

/** Table registry for the Db abstraction. */
export interface Schema {
  users: User;
  sessions: Session;
  xp_events: XPEvent;
  badge_states: BadgeState;
  lesson_progress: LessonProgress;
  mission_progress: MissionProgress;
  quiz_attempts: QuizAttempt;
  challenge_attempts: ChallengeAttempt;
  prompt_attempts: PromptAttempt;
  sim_runs: SimRun;
  streaks: Streak;
  activity: ActivityItem;
  notifications: AppNotification;
  final_results: FinalResult;
  academy_module_results: AcademyModuleResult;
  audit_log: AuditEntry;
}

export type TableName = keyof Schema;
