/** Level ladder (spec §9). Keep ascending; levelFor() picks the highest met. */
export interface LevelDef {
  level: number;
  title: string;
  minXP: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1, title: "AI Rookie", minXP: 0 },
  { level: 2, title: "Data Explorer", minXP: 250 },
  { level: 3, title: "Machine Learner", minXP: 600 },
  { level: 4, title: "Prompt Crafter", minXP: 1000 },
  { level: 5, title: "AI Explorer", minXP: 1500 },
  { level: 6, title: "AI Detective", minXP: 2200 },
  { level: 7, title: "Ethical AI Guardian", minXP: 3000 },
  { level: 8, title: "AI Architect", minXP: 4000 },
  { level: 9, title: "AI Innovator", minXP: 5250 },
  { level: 10, title: "AI Master", minXP: 7000 },
];

export function levelFor(xp: number): LevelDef {
  let current = LEVELS[0]!;
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l;
    else break;
  }
  return current;
}

export function nextLevel(xp: number): LevelDef | null {
  const current = levelFor(xp);
  return LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function levelProgress(xp: number): { current: LevelDef; next: LevelDef | null; pct: number; into: number; needed: number } {
  const current = levelFor(xp);
  const next = nextLevel(xp);
  if (!next) return { current, next: null, pct: 100, into: 0, needed: 0 };
  const span = next.minXP - current.minXP;
  const into = xp - current.minXP;
  return { current, next, pct: Math.round((into / span) * 100), into, needed: next.minXP - xp };
}
