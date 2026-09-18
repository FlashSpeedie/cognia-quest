import type { Db } from "@/server/db/db";
import type { User, FinalResult } from "@/lib/types";
import { FINAL_STAGES } from "@/content/final";
import { scorePrompt } from "./promptScore";
import { awardXP } from "./xp";
import { touchStreak } from "./streaks";
import { checkBadges } from "./badges";
import { recordMissionEvent } from "./missions";
import { logActivity, notify } from "./activity";

export interface FinalSubmission {
  "choose-data"?: string[];
  "spot-problem"?: number;
  "read-results"?: number;
  "prompt-write"?: string;
  "detect-issue"?: number;
  checklist?: string[];
  verdict?: number;
}

export function scoreStage(stageId: string, answer: unknown): number | null {
  const stage = FINAL_STAGES.find((s) => s.id === stageId);
  if (!stage) return null;
  switch (stage.kind) {
    case "multi-select": {
      if (!Array.isArray(answer)) return null;
      const picked = new Set(answer.filter((a) => typeof a === "string"));
      const good = stage.options.filter((o) => o.good && picked.has(o.id)).length;
      const badPicked = stage.options.filter((o) => !o.good && picked.has(o.id)).length;
      const totalGood = stage.options.filter((o) => o.good).length;
      const score = (good / totalGood) * 100 - badPicked * 15;
      return Math.max(0, Math.min(100, Math.round(score)));
    }
    case "mcq":
      if (typeof answer !== "number") return null;
      return answer === stage.correct ? 100 : 0;
    case "prompt": {
      if (typeof answer !== "string" || answer.trim().length < 20) return null;
      return scorePrompt(answer).total;
    }
    case "checklist": {
      if (!Array.isArray(answer)) return null;
      const picked = new Set(answer.filter((a) => typeof a === "string"));
      const important = stage.items.filter((i) => i.important);
      const hit = important.filter((i) => picked.has(i.id)).length;
      const badPicked = stage.items.filter((i) => !i.important && picked.has(i.id)).length;
      return Math.max(0, Math.min(100, Math.round((hit / important.length) * 100 - badPicked * 20)));
    }
    case "verdict": {
      if (typeof answer !== "number") return null;
      const opt = stage.options[answer];
      if (!opt) return null;
      return opt.defensible ? 100 : 40;
    }
  }
}

export async function submitFinal(
  db: Db,
  user: User,
  submission: FinalSubmission,
): Promise<{ ok: boolean; error?: string; result?: FinalResult; alreadyDone?: boolean }> {
  const existing = await db.table("final_results").get(user.id);
  if (existing) return { ok: false, error: "Final challenge already completed", alreadyDone: true };

  const stageScores: Record<string, number> = {};
  for (const stage of FINAL_STAGES) {
    const answer = (submission as Record<string, unknown>)[stage.id];
    const score = scoreStage(stage.id, answer);
    if (score === null) {
      return { ok: false, error: `Stage "${stage.title}" is missing or invalid` };
    }
    stageScores[stage.id] = score;
  }
  const totalScore = Math.round(
    FINAL_STAGES.reduce((s, st) => s + stageScores[st.id]!, 0) / FINAL_STAGES.length,
  );

  const result: FinalResult = {
    id: user.id,
    userId: user.id,
    stageScores,
    totalScore,
    completedAt: new Date().toISOString(),
  };
  await db.table("final_results").insert(result);

  const xp = await awardXP(db, user, { sourceType: "final", sourceId: "final-challenge", note: `Final Challenge: ${totalScore}%` });
  await logActivity(db, user.id, "final_completed", `Completed the Final AI Challenge (${totalScore}%)`);
  await notify(db, user.id, "achievement", "🏆 Final Challenge complete", `Score ${totalScore}% — title unlocked: AI Architect`);
  await touchStreak(db, user.id);
  await recordMissionEvent(db, user, { type: "final", id: "final:completed" });
  await checkBadges(db, user.id);
  if (xp.leveledUp) await notify(db, user.id, "level", `Level up: ${xp.leveledUp.to}`, `Level ${xp.leveledUp.level}`);

  return { ok: true, result };
}
