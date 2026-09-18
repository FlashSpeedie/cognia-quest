import { describe, it, expect } from "vitest";
import { trainModel } from "@/server/services/ml";
import { runBiasSim, BIAS_FEATURES } from "@/content/biasData";

const GOOD_ROWS = [
  { study: 2, sleep: 5, passed: false },
  { study: 3, sleep: 6, passed: false },
  { study: 5, sleep: 7, passed: true },
  { study: 6, sleep: 8, passed: true },
  { study: 8, sleep: 8, passed: true },
  { study: 9, sleep: 7, passed: true },
  { study: 4, sleep: 6, passed: false },
  { study: 7, sleep: 8, passed: true },
];

describe("train the machine simulation", () => {
  it("is deterministic", () => {
    const a = trainModel({ rows: GOOD_ROWS, testSplit: 0.25, noise: 0, extraSamples: 20 });
    const b = trainModel({ rows: GOOD_ROWS, testSplit: 0.25, noise: 0, extraSamples: 20 });
    expect(a).toEqual(b);
  });

  it("learns a separable dataset with decent accuracy", () => {
    const r = trainModel({ rows: GOOD_ROWS, testSplit: 0.25, noise: 0, extraSamples: 30 });
    expect(r.ok).toBe(true);
    expect(r.testAccuracy).toBeGreaterThanOrEqual(0.7);
  });

  it("flags a single-class dataset instead of pretending to learn", () => {
    const r = trainModel({
      rows: GOOD_ROWS.filter((r) => r.passed),
      testSplit: 0.25, noise: 0, extraSamples: 0,
    });
    expect(r.ok).toBe(false);
    expect(r.problem).toBe("one-class");
  });

  it("requires a minimum number of rows", () => {
    const r = trainModel({ rows: GOOD_ROWS.slice(0, 2), testSplit: 0.25, noise: 0, extraSamples: 0 });
    expect(r.ok).toBe(false);
    expect(r.problem).toBe("too-small");
  });

  it("detects class imbalance", () => {
    const rows = [
      ...GOOD_ROWS.filter((r) => r.passed),
      { study: 7.5, sleep: 8, passed: true },
      { study: 8.5, sleep: 8, passed: true },
      GOOD_ROWS[0]!, // single failure example
    ];
    const r = trainModel({ rows, testSplit: 0.25, noise: 0, extraSamples: 0 });
    expect(r.problem).toBe("imbalanced");
  });

  it("produces a decision boundary and per-row predictions", () => {
    const r = trainModel({ rows: GOOD_ROWS, testSplit: 0.25, noise: 0, extraSamples: 20 });
    expect(r.decisionBoundary).toBeTruthy();
    expect(r.predictions.length).toBeGreaterThan(0);
    expect(r.confusion.tp + r.confusion.fp + r.confusion.tn + r.confusion.fn).toBe(r.testCount);
  });
});

describe("bias simulation", () => {
  it("shows a disparity when the proxy feature is used", () => {
    const all = BIAS_FEATURES.map((f) => f.key);
    const r = runBiasSim(all);
    expect(r.disparity).toBeGreaterThanOrEqual(30);
    expect(r.nearRate).toBeGreaterThan(r.farRate);
  });

  it("removing the proxy feature shrinks the gap and the crossover anomaly", () => {
    const without = BIAS_FEATURES.filter((f) => f.key !== "commuteMin").map((f) => f.key);
    const r = runBiasSim(without);
    expect(Math.abs(r.disparity)).toBeLessThanOrEqual(25);
    expect(r.crossover).toBeNull();
  });

  it("marks wrong-looking historical outcomes driven by the proxy", () => {
    const r = runBiasSim(BIAS_FEATURES.map((f) => f.key));
    // a weaker nearby applicant is approved while a stronger far one is rejected
    expect(r.crossover).not.toBeNull();
    expect(r.crossover!.rejectedGPA).toBeGreaterThan(r.crossover!.approvedGPA);
    expect(r.strongFarRejected).toBeGreaterThan(0);
  });
});
