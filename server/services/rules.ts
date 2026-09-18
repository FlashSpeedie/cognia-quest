import type { XPSourceType } from "@/lib/types";

/**
 * XP economy (spec §8/§31/§84).
 * - fixed: one-time rewards (lesson completion, mission completion, etc.)
 * - repeatable: source can earn again with decay, capped per day (anti-farm)
 */
export interface XPRule {
  base: number;
  repeatable: boolean;
  /** max events per day for this sourceType (repeatables) */
  dailyCap: number;
  /** multiplier applied to attempt n (1-indexed) */
  decay: (n: number) => number;
}

const once = (base: number): XPRule => ({ base, repeatable: false, dailyCap: 1, decay: () => 1 });
const repeat = (base: number, dailyCap: number): XPRule => ({
  base,
  repeatable: true,
  dailyCap,
  decay: (n) => (n === 1 ? 1 : n === 2 ? 0.5 : 0.25),
});

export const XP_RULES: Record<XPSourceType, XPRule> = {
  lesson: once(50),
  quiz: repeat(40, 5), // perfect-score bonus computed in quiz service
  simulation: repeat(30, 6),
  challenge: repeat(75, 6),
  prompt: repeat(60, 8),
  detective: once(75), // per case
  ethics: once(150), // per case
  privacy: once(60), // per scenario
  mission: once(0), // amount comes from mission definition
  final: once(500),
};

/** Perfect-quiz bonus on top of base quiz XP. */
export const PERFECT_QUIZ_BONUS = 10;

export function xpAmountFor(sourceType: XPSourceType, attemptIndex: number, overrideBase?: number): number {
  const rule = XP_RULES[sourceType];
  const base = overrideBase ?? rule.base;
  if (!rule.repeatable) return attemptIndex === 1 ? base : 0;
  if (attemptIndex > rule.dailyCap) return 0;
  return Math.round(base * rule.decay(attemptIndex));
}
