import { describe, it, expect } from "vitest";
import { scorePrompt } from "@/server/services/promptScore";

describe("prompt scoring rubric", () => {
  it("scores the spec's weak prompt low", () => {
    const s = scorePrompt("Explain photosynthesis.");
    expect(s.total).toBeLessThan(60);
    expect(s.grade).toBe("weak");
  });

  it("scores the spec's improved prompt high", () => {
    const s = scorePrompt(
      "Explain photosynthesis to a 9th-grade biology student using one real-world analogy, no more than 150 words, and include the three main inputs and outputs.",
    );
    expect(s.total).toBeGreaterThanOrEqual(70);
  });

  it("rewards a fully-specified prompt at 80+", () => {
    const s = scorePrompt(
      "I'm studying for my 9th grade biology exam on Friday. Create a study guide on photosynthesis: a 2-column table of inputs and outputs, then 5 flashcards, in under 200 words, no jargon, one real-world analogy, and flag anything you're unsure about.",
    );
    expect(s.total).toBeGreaterThanOrEqual(80);
    expect(s.grade).toBe("strong");
  });

  it("reports missing dimensions with tips", () => {
    const s = scorePrompt("help with math");
    const failed = s.dimensions.filter((d) => !d.passed).map((d) => d.key);
    expect(failed).toContain("audience");
    expect(failed).toContain("format");
    expect(s.improvedVs).toBeTruthy();
  });

  it("handles empty input safely", () => {
    const s = scorePrompt("");
    expect(s.total).toBe(0);
  });

  it("empty prompt has all-zero dimensions", () => {
    const s = scorePrompt("   ");
    expect(s.dimensions.every((d) => d.score <= 1)).toBe(true);
  });
});
