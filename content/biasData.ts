/**
 * Bias simulation data (spec §20). Fictional scholarship applicants.
 * Story: historically, applicants living close to the school were favored
 * (a proxy for an advantaged neighborhood), so a model trained on history
 * reproduces that pattern — even when "location" seems harmless.
 */

export interface BiasApplicant {
  id: number;
  grades: number; // GPA 2.5–4.0
  activities: number; // count 0–6
  attendance: number; // % 80–100
  commuteMin: number; // 5–55 (PROXY FEATURE)
  approvedHistory: boolean; // what historical data shows (biased)
}

export const BIAS_APPLICANTS: BiasApplicant[] = [
  { id: 1, grades: 3.9, activities: 4, attendance: 97, commuteMin: 8, approvedHistory: true },
  { id: 2, grades: 3.7, activities: 3, attendance: 95, commuteMin: 12, approvedHistory: true },
  { id: 3, grades: 3.8, activities: 5, attendance: 96, commuteMin: 48, approvedHistory: false },
  { id: 4, grades: 3.5, activities: 2, attendance: 93, commuteMin: 10, approvedHistory: true },
  { id: 5, grades: 3.6, activities: 4, attendance: 94, commuteMin: 44, approvedHistory: false },
  { id: 6, grades: 3.2, activities: 1, attendance: 90, commuteMin: 15, approvedHistory: true },
  { id: 7, grades: 3.9, activities: 5, attendance: 98, commuteMin: 51, approvedHistory: false },
  { id: 8, grades: 3.4, activities: 2, attendance: 92, commuteMin: 9, approvedHistory: true },
  { id: 9, grades: 3.1, activities: 1, attendance: 88, commuteMin: 38, approvedHistory: false },
  { id: 10, grades: 3.8, activities: 3, attendance: 96, commuteMin: 14, approvedHistory: true },
  { id: 11, grades: 3.7, activities: 4, attendance: 95, commuteMin: 42, approvedHistory: false },
  { id: 12, grades: 3.0, activities: 0, attendance: 85, commuteMin: 50, approvedHistory: false },
  { id: 13, grades: 3.6, activities: 3, attendance: 94, commuteMin: 7, approvedHistory: true },
  { id: 14, grades: 3.3, activities: 2, attendance: 91, commuteMin: 33, approvedHistory: false },
  { id: 15, grades: 3.95, activities: 5, attendance: 99, commuteMin: 55, approvedHistory: false },
  { id: 16, grades: 3.2, activities: 2, attendance: 90, commuteMin: 11, approvedHistory: true },
];

export interface BiasFeature {
  key: keyof Pick<BiasApplicant, "grades" | "activities" | "attendance" | "commuteMin">;
  label: string;
  suspicious: boolean;
}

export const BIAS_FEATURES: BiasFeature[] = [
  { key: "grades", label: "GPA", suspicious: false },
  { key: "activities", label: "Extracurriculars", suspicious: false },
  { key: "attendance", label: "Attendance", suspicious: false },
  { key: "commuteMin", label: "Commute distance", suspicious: true },
];

/**
 * Deterministic scoring the sim uses: normalized weights. When commuteMin
 * is included with historical-fidelity weighting, distance drives outcomes.
 */
export function scoreApplicant(a: BiasApplicant, activeFeatures: string[]): number {
  let score = 0;
  if (activeFeatures.includes("grades")) score += (a.grades - 2.5) * 22; // up to ~33
  if (activeFeatures.includes("activities")) score += a.activities * 4; // up to 24
  if (activeFeatures.includes("attendance")) score += (a.attendance - 80) * 1.2; // up to 24
  if (activeFeatures.includes("commuteMin")) {
    // The model "learned from history": closer = favored (proxy effect).
    // Heavily weighted so the bias is visible and inspectable.
    score += (60 - a.commuteMin) * 1.2;
  }
  return score;
}

/** The model "approves" the top 6 applicants by score (fixed cohort size). */
export const BIAS_SLOTS = 6;

export function runBiasSim(activeFeatures: string[]) {
  const scored = BIAS_APPLICANTS.map((a) => ({
    ...a,
    score: Math.round(scoreApplicant(a, activeFeatures) * 10) / 10,
  }));
  const approvedIds = new Set(
    [...scored].sort((x, y) => y.score - x.score).slice(0, BIAS_SLOTS).map((s) => s.id),
  );
  const nearGroup = scored.filter((s) => s.commuteMin <= 15);
  const farGroup = scored.filter((s) => s.commuteMin >= 30);
  const rate = (rows: typeof scored) =>
    rows.length ? Math.round((rows.filter((r) => approvedIds.has(r.id)).length / rows.length) * 100) : 0;
  const strongApplicants = scored.filter((s) => s.grades >= 3.5 && s.activities >= 3);
  const strongFarRejected = strongApplicants.filter((s) => s.commuteMin >= 30 && !approvedIds.has(s.id)).length;
  const weakNearAccepted = scored.filter((s) => s.grades < 3.3 && s.commuteMin <= 15 && approvedIds.has(s.id)).length;
  // The "smoking gun": a lower-GPA nearby applicant approved over a
  // higher-GPA distant applicant.
  const approvedNear = scored.filter((s) => approvedIds.has(s.id) && s.commuteMin <= 15);
  const rejectedFar = scored.filter((s) => !approvedIds.has(s.id) && s.commuteMin >= 30);
  const weakestIn = approvedNear.length ? Math.min(...approvedNear.map((s) => s.grades)) : null;
  const strongestOut = rejectedFar.length ? Math.max(...rejectedFar.map((s) => s.grades)) : null;
  const crossover =
    weakestIn !== null && strongestOut !== null && strongestOut > weakestIn
      ? { approvedGPA: weakestIn, rejectedGPA: strongestOut }
      : null;
  return {
    rows: scored.map((s) => ({ ...s, approved: approvedIds.has(s.id) })),
    nearRate: rate(nearGroup),
    farRate: rate(farGroup),
    approvedCount: approvedIds.size,
    disparity: rate(nearGroup) - rate(farGroup),
    strongFarRejected,
    weakNearAccepted,
    crossover,
    usedCommute: activeFeatures.includes("commuteMin"),
  };
}
