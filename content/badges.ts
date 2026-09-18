import type { BadgeDef } from "@/lib/content";

/** Badge catalog (spec §10). Unlock logic lives in server/services/badges.ts */
export const BADGES: BadgeDef[] = [
  {
    id: "ai-rookie",
    title: "AI Rookie",
    description: "Completed the AI Fundamentals module.",
    icon: "🤖",
    hint: "Finish every lesson in AI Fundamentals.",
    rarity: "common",
  },
  {
    id: "machine-learner",
    title: "Machine Learner",
    description: "Trained your first model in the Train the Machine simulation.",
    icon: "🧠",
    hint: "Run a successful training in the ML Lab.",
    rarity: "common",
  },
  {
    id: "prompt-crafter",
    title: "Prompt Crafter",
    description: "Scored 80+ on a Prompt Battle challenge.",
    icon: "💬",
    hint: "Score 80+ on any Prompt Battle task.",
    rarity: "common",
  },
  {
    id: "ai-detective",
    title: "AI Detective",
    description: "Correctly identified AI mistakes in 5 detective cases.",
    icon: "🔎",
    hint: "Solve 5 AI Detective cases correctly.",
    rarity: "rare",
  },
  {
    id: "bias-buster",
    title: "Bias Buster",
    description: "Completed the bias simulation and found the hidden pattern.",
    icon: "⚖️",
    hint: "Finish the Bias Simulation in the AI Lab.",
    rarity: "rare",
  },
  {
    id: "ethical-guardian",
    title: "Ethical AI Guardian",
    description: "Completed Ethics Court with strong coverage.",
    icon: "🛡️",
    hint: "Score 75%+ coverage in an Ethics Court case.",
    rarity: "rare",
  },
  {
    id: "data-explorer",
    title: "Data Explorer",
    description: "Completed three different data experiments in the labs.",
    icon: "📊",
    hint: "Run experiments in three different lab simulations.",
    rarity: "common",
  },
  {
    id: "critical-thinker",
    title: "Critical Thinker",
    description: "Successfully challenged AI claims across detective and verification activities.",
    icon: "🧩",
    hint: "Correctly evaluate 8 AI outputs across Detective and lab activities.",
    rarity: "rare",
  },
  {
    id: "lab-rat",
    title: "Lab Rat",
    description: "Ran 10 experiments in the AI Lab.",
    icon: "🧪",
    hint: "Run 10 simulation experiments.",
    rarity: "common",
  },
  {
    id: "mission-specialist",
    title: "Mission Specialist",
    description: "Completed 6 missions.",
    icon: "🎯",
    hint: "Complete 6 missions.",
    rarity: "rare",
  },
  {
    id: "ai-architect",
    title: "AI Architect",
    description: "Completed the Final AI Challenge.",
    icon: "🏗️",
    hint: "Finish the capstone Final Challenge.",
    rarity: "epic",
  },
  {
    id: "ai-master",
    title: "AI Master",
    description: "Completed every module and the final challenge.",
    icon: "🏆",
    hint: "Complete the full learning path and the Final Challenge.",
    rarity: "legendary",
  },
];

export function badgeById(id: string) {
  return BADGES.find((b) => b.id === id);
}
