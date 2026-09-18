import { describe, it, expect } from "vitest";
import { LEVELS, levelFor, levelProgress, nextLevel } from "@/lib/levels";

describe("level system", () => {
  it("maps XP to the spec thresholds", () => {
    expect(levelFor(0).title).toBe("AI Rookie");
    expect(levelFor(249).level).toBe(1);
    expect(levelFor(250).title).toBe("Data Explorer");
    expect(levelFor(600).title).toBe("Machine Learner");
    expect(levelFor(1500).title).toBe("AI Explorer");
    expect(levelFor(2200).title).toBe("AI Detective");
    expect(levelFor(3000).title).toBe("Ethical AI Guardian");
    expect(levelFor(4000).title).toBe("AI Architect");
    expect(levelFor(5250).title).toBe("AI Innovator");
    expect(levelFor(7000).title).toBe("AI Master");
    expect(levelFor(100000).title).toBe("AI Master");
  });

  it("is strictly ascending", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i]!.minXP).toBeGreaterThan(LEVELS[i - 1]!.minXP);
    }
  });

  it("reports progress to next level", () => {
    const p = levelProgress(1750); // level 5 (1500) → 6 (2200)
    expect(p.current.level).toBe(5);
    expect(p.next?.level).toBe(6);
    expect(p.into).toBe(250);
    expect(p.pct).toBe(Math.round((250 / 700) * 100));
    expect(nextLevel(7000)).toBeNull();
  });
});
