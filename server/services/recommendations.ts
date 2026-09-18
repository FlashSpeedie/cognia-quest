import type { UserStats } from "./stats";

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  href: string;
  priority: number; // lower = sooner
}

/** Rule-based recommendations (spec §101). No sensitive inputs. */
export function recommendations(s: UserStats): Recommendation[] {
  const recs: Recommendation[] = [];

  if ((s.modulePct["fundamentals"] ?? 0) < 50 && !s.finalDone) {
    recs.push({
      id: "fundamentals",
      title: "Start: AI Fundamentals",
      reason: "Foundations make every later module easier.",
      href: "/academy/ai-fundamentals",
      priority: 1,
    });
  }
  if ((s.modulePct["fundamentals"] ?? 0) >= 50 && !s.simIds.has("train-machine")) {
    recs.push({
      id: "train-machine",
      title: "Train the Machine",
      reason: "You know the theory — now see a model actually learn.",
      href: "/lab/train-the-machine",
      priority: 2,
    });
  }
  if (s.promptBest > 0 && s.promptBest < 60) {
    recs.push({
      id: "prompting",
      title: "Prompt Engineering Fundamentals",
      reason: `Your best prompt score is ${s.promptBest}/100. The anatomy lesson will push it past 80.`,
      href: "/academy/prompt-engineering/anatomy-of-a-prompt",
      priority: 2,
    });
  } else if (s.promptBest === 0 && (s.modulePct["genai"] ?? 0) > 0) {
    recs.push({
      id: "promptlab",
      title: "Try the Prompt Lab",
      reason: "You know how generative AI works — practice driving it.",
      href: "/lab/prompt-lab",
      priority: 3,
    });
  }
  if (s.ethicsBestCoverage < 75 && (s.modulePct["ml"] ?? 0) >= 50) {
    recs.push({
      id: "ethics",
      title: "AI Ethics Court",
      reason: "Time to think like a reviewer, not just a builder.",
      href: "/ethics/court",
      priority: 3,
    });
  }
  if (s.detectiveCorrect < 3 && (s.modulePct["fundamentals"] ?? 0) >= 75) {
    recs.push({
      id: "detective",
      title: "AI Detective Cases",
      reason: "Sharpen your verification habit on real-looking cases.",
      href: "/detective",
      priority: 3,
    });
  }
  if (recs.length === 0 && !s.finalDone) {
    recs.push({
      id: "final",
      title: "The Final AI Challenge",
      reason: "You've built the skills — bring them together.",
      href: "/final-challenge",
      priority: 1,
    });
  }
  if (s.finalDone) {
    recs.push({
      id: "certificate",
      title: "Claim your certificate",
      reason: "You finished the Final Challenge. Print-proof your glory.",
      href: "/certificate",
      priority: 1,
    });
  }
  return recs.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
