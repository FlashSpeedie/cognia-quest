import type { Db } from "@/server/db/db";
import { newId } from "@/server/db/db";
import type { User } from "@/lib/types";
import { detectiveCaseById } from "@/content/detective";
import { ethicsCaseById } from "@/content/ethics";
import { privacyScenarioById } from "@/content/privacy";
import { promptTaskById, toolScenarioById } from "@/content/prompts";
import type { IssueType } from "@/lib/content";
import { awardXP, type AwardResult } from "./xp";
import { touchStreak } from "./streaks";
import { checkBadges } from "./badges";
import { recordMissionEvent, type MissionEvent } from "./missions";
import { logActivity } from "./activity";
import { scorePrompt, type PromptScore } from "./promptScore";

export interface ActivityResult {
  ok: boolean;
  error?: string;
  xp?: AwardResult;
  badges?: string[];
}

async function finalize(db: Db, user: User, events: MissionEvent[]): Promise<ActivityResult> {
  await touchStreak(db, user.id);
  for (const e of events) await recordMissionEvent(db, user, e);
  const badges = await checkBadges(db, user.id);
  return { ok: true, badges: badges.newlyUnlocked.map((b) => b.title) };
}

// ── AI Detective ─────────────────────────────────────────────────────────
export async function submitDetective(
  db: Db,
  user: User,
  caseId: string,
  verdict: IssueType,
): Promise<ActivityResult & { correct?: boolean; explanation?: string; teachingPoint?: string; actualIssue?: string }> {
  const c = detectiveCaseById(caseId);
  if (!c) return { ok: false, error: "Unknown case" };

  const correct = verdict === c.correctIssue;
  await db.table("challenge_attempts").insert({
    id: newId(),
    userId: user.id,
    challengeId: caseId,
    kind: "detective",
    correct,
    detail: `verdict=${verdict};actual=${c.correctIssue}`,
    createdAt: new Date().toISOString(),
  });

  let xp: AwardResult | undefined;
  if (correct) {
    xp = await awardXP(db, user, { sourceType: "detective", sourceId: caseId, note: `Case #${c.caseNo} solved` });
    await logActivity(db, user.id, "detective_case", `Solved case #${c.caseNo}: ${c.title}`);
  }

  const correctCases = (await db.table("challenge_attempts").find({ userId: user.id, kind: "detective" }))
    .filter((a) => a.correct);
  const distinctCorrect = new Set(correctCases.map((a) => a.challengeId));

  const events: MissionEvent[] = [{ type: "detective", id: "detective:opened" }];
  if (distinctCorrect.size >= 3) events.push({ type: "detective", id: "detective:3-correct" });
  if (correct && c.correctIssue === "hallucination") events.push({ type: "detective", id: "detective:hallucination" });

  const fin = await finalize(db, user, events);
  return {
    ...fin,
    correct,
    explanation: c.explanation,
    teachingPoint: c.teachingPoint,
    actualIssue: c.correctIssue,
    xp,
  };
}

// ── Ethics Court ─────────────────────────────────────────────────────────
export async function submitEthics(
  db: Db,
  user: User,
  caseId: string,
  selectedFactorIds: string[],
): Promise<ActivityResult & { coverage?: number; breakdown?: { importantSelected: string[]; importantMissed: string[]; distractorsPicked: string[] } }> {
  const c = ethicsCaseById(caseId);
  if (!c) return { ok: false, error: "Unknown case" };

  const important = c.factors.filter((f) => f.important);
  const distractors = c.factors.filter((f) => !f.important);
  const picked = new Set(selectedFactorIds.filter((id) => c.factors.some((f) => f.id === id)));
  const importantSelected = important.filter((f) => picked.has(f.id));
  const distractorsPicked = distractors.filter((f) => picked.has(f.id));
  const importantMissed = important.filter((f) => !picked.has(f.id));

  // coverage rewards important picks and softly penalizes distractors
  const raw = importantSelected.length / important.length;
  const penalty = Math.min(0.3, distractorsPicked.length * 0.1);
  const coverage = Math.max(0, Math.round((raw - penalty) * 100));

  await db.table("challenge_attempts").insert({
    id: newId(),
    userId: user.id,
    challengeId: caseId,
    kind: "ethics",
    correct: coverage >= 60,
    detail: `coverage=${coverage}`,
    createdAt: new Date().toISOString(),
  });

  let xp: AwardResult | undefined;
  if (coverage >= 60) {
    xp = await awardXP(db, user, { sourceType: "ethics", sourceId: caseId, note: `Ethics review: ${c.title} (${coverage}%)` });
    await logActivity(db, user.id, "ethics_review", `Ethics review: ${c.title} — ${coverage}% coverage`);
  }

  const events: MissionEvent[] = [{ type: "ethics", id: "ethics:reviewed" }];
  if (coverage >= 75) events.push({ type: "ethics", id: "ethics:coverage-75" });
  const fin = await finalize(db, user, events);
  return {
    ...fin,
    coverage,
    breakdown: {
      importantSelected: importantSelected.map((f) => f.label),
      importantMissed: importantMissed.map((f) => f.label),
      distractorsPicked: distractorsPicked.map((f) => f.label),
    },
    xp,
  };
}

// ── Privacy Challenge ────────────────────────────────────────────────────
export async function submitPrivacy(
  db: Db,
  user: User,
  scenarioId: string,
  chosenIds: string[],
): Promise<ActivityResult & { correct?: boolean; perfect?: boolean; reasons?: { label: string; needed: boolean; picked: boolean; reason: string }[] }> {
  const s = privacyScenarioById(scenarioId);
  if (!s) return { ok: false, error: "Unknown scenario" };

  const chosen = new Set(chosenIds.filter((id) => s.dataRequests.some((d) => d.id === id)));
  const reasons = s.dataRequests.map((d) => ({ label: d.label, needed: d.needed, picked: chosen.has(d.id), reason: d.reason }));
  const perfect = s.dataRequests.every((d) => chosen.has(d.id) === d.needed);
  const neededCount = s.dataRequests.filter((d) => d.needed).length;
  const correctNeeded = s.dataRequests.filter((d) => d.needed && chosen.has(d.id)).length;
  const overCollected = s.dataRequests.filter((d) => !d.needed && chosen.has(d.id)).length;
  const correct = correctNeeded === neededCount && overCollected <= 1;

  await db.table("challenge_attempts").insert({
    id: newId(),
    userId: user.id,
    challengeId: scenarioId,
    kind: "privacy",
    correct,
    detail: perfect ? "perfect" : `missed=${neededCount - correctNeeded};over=${overCollected}`,
    createdAt: new Date().toISOString(),
  });

  let xp: AwardResult | undefined;
  if (correct) {
    xp = await awardXP(db, user, { sourceType: "privacy", sourceId: scenarioId, note: `Privacy: ${s.title}${perfect ? " (perfect)" : ""}` });
    await logActivity(db, user.id, "privacy_challenge", `Privacy challenge: ${s.title}`);
  }

  const distinctDone = new Set(
    (await db.table("challenge_attempts").find({ userId: user.id, kind: "privacy" }))
      .filter((a) => a.correct)
      .map((a) => a.challengeId),
  );
  const hasPerfect = (await db.table("challenge_attempts").find({ userId: user.id, kind: "privacy" }))
    .some((a) => a.detail === "perfect");

  const events: MissionEvent[] = [];
  if (distinctDone.size >= 3) events.push({ type: "privacy", id: "privacy:3-done" });
  if (hasPerfect) events.push({ type: "privacy", id: "privacy:perfect" });

  const fin = await finalize(db, user, events);
  return { ...fin, correct, perfect, reasons, xp };
}

// ── Tool Selector ────────────────────────────────────────────────────────
export async function submitToolChoice(
  db: Db,
  user: User,
  scenarioId: string,
  choiceIndex: number,
): Promise<ActivityResult & { correct?: boolean; why?: string; risks?: string; verify?: string }> {
  const s = toolScenarioById(scenarioId);
  if (!s) return { ok: false, error: "Unknown scenario" };
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= s.options.length) {
    return { ok: false, error: "Invalid choice" };
  }
  const correct = choiceIndex === s.correct;
  await db.table("challenge_attempts").insert({
    id: newId(),
    userId: user.id,
    challengeId: scenarioId,
    kind: "tool",
    correct,
    detail: `chose=${choiceIndex};correct=${s.correct}`,
    createdAt: new Date().toISOString(),
  });
  let xp: AwardResult | undefined;
  if (correct) {
    xp = await awardXP(db, user, { sourceType: "challenge", sourceId: scenarioId, baseOverride: 40, note: `Tool selector: ${s.scenario.slice(0, 40)}…` });
  }
  const fin = await finalize(db, user, []);
  return { ...fin, correct, why: s.why, risks: s.risks, verify: s.verify, xp };
}

// ── Prompt Lab / Battle ──────────────────────────────────────────────────
export async function submitPrompt(
  db: Db,
  user: User,
  taskId: string,
  prompt: string,
): Promise<ActivityResult & { score?: PromptScore }> {
  if (prompt.trim().length < 2) return { ok: false, error: "Prompt is empty" };
  if (prompt.length > 4000) return { ok: false, error: "Prompt too long (4000 chars max)" };
  if (taskId !== "free" && !promptTaskById(taskId)) return { ok: false, error: "Unknown task" };

  const score = scorePrompt(prompt);
  await db.table("prompt_attempts").insert({
    id: newId(),
    userId: user.id,
    taskId,
    prompt: prompt.slice(0, 4000),
    score: score.total,
    dimensions: Object.fromEntries(score.dimensions.map((d) => [d.key, d.score])),
    createdAt: new Date().toISOString(),
  });

  // XP only for decent effort, scaled by score band
  let xp: AwardResult | undefined;
  if (score.total >= 30) {
    xp = await awardXP(db, user, {
      sourceType: "prompt",
      sourceId: `${taskId}:${score.total >= 80 ? "strong" : score.total >= 50 ? "okay" : "weak"}`,
      baseOverride: score.total >= 80 ? 100 : score.total >= 50 ? 60 : 30,
      note: `Prompt score ${score.total}`,
    });
    if (score.total >= 80) await logActivity(db, user.id, "prompt_mastery", `Wrote an ${score.total}-point prompt`);
  }

  const events: MissionEvent[] = [{ type: "prompt", id: "prompt:analyzed" }];
  if (score.total >= 80) events.push({ type: "prompt", id: "prompt:score-80" });
  const fin = await finalize(db, user, events);
  return { ...fin, score, xp };
}
