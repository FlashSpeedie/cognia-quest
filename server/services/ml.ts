/**
 * Train the Machine - deterministic educational classifier (spec §13/§32).
 *
 * A tiny logistic regression (2 features) trained with fixed-seed gradient
 * descent. Deterministic: same data + same settings ⇒ same result, so the
 * concept being taught is reproducible and testable. Labeled in the UI as
 * an educational simulation - not a production ML system.
 */

export interface DataRow {
  study: number; // hours
  sleep: number; // hours
  passed: boolean;
}

export interface TrainConfig {
  rows: DataRow[];
  testSplit: number; // 0.1 - 0.5
  noise: number; // 0 - 1 probability of flipping labels in extra points
  extraSamples: number; // synthetic extra rows 0..60
}

export interface TrainResult {
  ok: boolean;
  problem?: string; // educational flag (imbalanced, too small, one class...)
  weights: [number, number, number]; // w0 bias, w1 study, w2 sleep (normalized space)
  trainAccuracy: number;
  testAccuracy: number;
  confusion: { tp: number; fp: number; tn: number; fn: number };
  trainCount: number;
  testCount: number;
  baseline: number; // majority-class accuracy on test set
  decisionBoundary: { slope: number; intercept: number } | null;
  normalization: { mean: [number, number]; sd: [number, number] } | null;
  predictions: { study: number; sleep: number; prob: number; actual: boolean }[];
  classBalance: { pass: number; fail: number };
}

/** Small deterministic PRNG (mulberry32) so simulations are reproducible. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sig = (z: number) => 1 / (1 + Math.exp(-z));

function genSynthetic(rand: () => number, n: number, noise: number): DataRow[] {
  const rows: DataRow[] = [];
  for (let i = 0; i < n; i++) {
    const study = Math.round((2 + rand() * 7) * 10) / 10;
    const sleep = Math.round((4 + rand() * 5) * 10) / 10;
    // ground truth leans on study + sleep with slight nonlinearity
    let passed = 1.6 * study + 1.1 * sleep - 13 + (rand() - 0.5) * 3 > 0;
    if (rand() < noise) passed = !passed;
    rows.push({ study, sleep, passed });
  }
  return rows;
}

export function trainModel(cfg: TrainConfig, seed = 42): TrainResult {
  const rand = mulberry32(seed);
  const base = cfg.rows.filter(
    (r) => Number.isFinite(r.study) && Number.isFinite(r.sleep) && r.study >= 0 && r.sleep >= 0 && r.study <= 24 && r.sleep <= 24,
  );
  const rows = [...base, ...genSynthetic(rand, Math.max(0, Math.min(60, cfg.extraSamples)), cfg.noise)];

  const pass = rows.filter((r) => r.passed).length;
  const fail = rows.length - pass;

  const empty: Omit<TrainResult, "ok" | "problem"> = {
    weights: [0, 0, 0],
    trainAccuracy: 0,
    testAccuracy: 0,
    confusion: { tp: 0, fp: 0, tn: 0, fn: 0 },
    trainCount: 0,
    testCount: 0,
    baseline: 0,
    decisionBoundary: null,
    normalization: null,
    predictions: [],
    classBalance: { pass, fail },
  };

  if (rows.length < 4) {
    return { ok: false, problem: "too-small", ...empty };
  }
  if (pass === 0 || fail === 0) {
    return { ok: false, problem: "one-class", ...empty };
  }
  const minority = Math.min(pass, fail) / rows.length;
  const imbalanced = minority < 0.15;

  // deterministic shuffle (Fisher–Yates) then split
  const shuffled = [...rows];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const testN = Math.max(1, Math.round(shuffled.length * cfg.testSplit));
  const test = shuffled.slice(0, testN);
  const train = shuffled.slice(testN);

  // normalize
  const mean = [0, 0];
  for (const r of train) {
    mean[0]! += r.study;
    mean[1]! += r.sleep;
  }
  mean[0]! /= train.length;
  mean[1]! /= train.length;
  const sd = [0, 0];
  for (const r of train) {
    sd[0]! += (r.study - mean[0]!) ** 2;
    sd[1]! += (r.sleep - mean[1]!) ** 2;
  }
  sd[0] = Math.sqrt(sd[0]! / train.length) || 1;
  sd[1] = Math.sqrt(sd[1]! / train.length) || 1;

  const feats = (r: { study: number; sleep: number }): [number, number] => [
    (r.study - mean[0]!) / sd[0]!,
    (r.sleep - mean[1]!) / sd[1]!,
  ];

  // logistic regression - fixed iterations & learning rate, fully deterministic
  let w = [0, 0, 0];
  const lr = 0.5;
  for (let iter = 0; iter < 400; iter++) {
    const grad = [0, 0, 0];
    for (const r of train) {
      const [x1, x2] = feats(r);
      const p = sig(w[0]! + w[1]! * x1 + w[2]! * x2);
      const err = (r.passed ? 1 : 0) - p;
      grad[0]! += err;
      grad[1]! += err * x1;
      grad[2]! += err * x2;
    }
    w[0]! += (lr * grad[0]!) / train.length;
    w[1]! += (lr * grad[1]!) / train.length;
    w[2]! += (lr * grad[2]!) / train.length;
  }

  const evalSet = (set: DataRow[]) => {
    let correct = 0;
    const confusion = { tp: 0, fp: 0, tn: 0, fn: 0 };
    for (const r of set) {
      const [x1, x2] = feats(r);
      const prob = sig(w[0]! + w[1]! * x1 + w[2]! * x2);
      const pred = prob >= 0.5;
      if (pred === r.passed) correct++;
      if (pred && r.passed) confusion.tp++;
      else if (pred && !r.passed) confusion.fp++;
      else if (!pred && r.passed) confusion.fn++;
      else confusion.tn++;
    }
    return { acc: set.length ? correct / set.length : 0, confusion };
  };

  const trainEval = evalSet(train);
  const testEval = evalSet(test);

  // baseline: always predict majority class of train
  const trainPassShare = train.filter((r) => r.passed).length / train.length;
  const majority = trainPassShare >= 0.5;
  const baseline = test.filter((r) => r.passed === majority).length / test.length;

  // decision boundary in feature space: w0 + w1*x1 + w2*x2 = 0 ⇒ x2 = -(w0 + w1*x1)/w2
  const decisionBoundary =
    Math.abs(w[2]!) > 1e-6 ? { slope: -w[1]! / w[2]!, intercept: -w[0]! / w[2]! } : null;

  return {
    ok: true,
    problem: imbalanced ? "imbalanced" : undefined,
    weights: [round3(w[0]!), round3(w[1]!), round3(w[2]!)],
    trainAccuracy: round3(trainEval.acc),
    testAccuracy: round3(testEval.acc),
    confusion: testEval.confusion,
    trainCount: train.length,
    testCount: test.length,
    baseline: round3(baseline),
    decisionBoundary,
    normalization: { mean: [round3(mean[0]!), round3(mean[1]!)], sd: [round3(sd[0]!), round3(sd[1]!)] },
    predictions: rows.map((r) => {
      const [x1, x2] = feats(r);
      return { study: r.study, sleep: r.sleep, prob: round3(sig(w[0]! + w[1]! * x1 + w[2]! * x2)), actual: r.passed };
    }),
    classBalance: { pass, fail },
  };
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;
