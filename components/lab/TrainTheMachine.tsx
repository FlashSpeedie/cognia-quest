"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import { fireLevelUp } from "@/components/app/LevelUpModal";
import type { DataRow, TrainResult } from "@/server/services/ml";

const DEFAULT_ROWS: DataRow[] = [
  { study: 2, sleep: 5, passed: false },
  { study: 3, sleep: 6, passed: false },
  { study: 5, sleep: 7, passed: true },
  { study: 6, sleep: 8, passed: true },
  { study: 8, sleep: 8, passed: true },
];

interface TrainResponse {
  result: TrainResult;
  xp?: { awarded: number; leveledUp: { to: string; level: number } | null };
  badges?: string[];
  events: string[];
}

export function TrainTheMachine() {
  const [rows, setRows] = useState<DataRow[]>(DEFAULT_ROWS);
  const [noise, setNoise] = useState(0);
  const [extra, setExtra] = useState(10);
  const [split, setSplit] = useState(0.25);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<TrainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();
  const router = useRouter();

  const classBalance = useMemo(() => {
    const p = rows.filter((r) => r.passed).length;
    return { pass: p, fail: rows.length - p };
  }, [rows]);

  function updateRow(i: number, patch: Partial<DataRow>) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  async function train() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sim/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, noise, extraSamples: extra, testSplit: split }),
      });
      const data = (await res.json()) as TrainResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Training failed");
        return;
      }
      setResp(data);
      if (data.xp && data.xp.awarded > 0) push({ kind: "xp", title: `+${data.xp.awarded} XP`, body: "Lab experiment recorded" });
      for (const b of data.badges ?? []) push({ kind: "badge", title: `Badge unlocked: ${b}` });
      if (data.xp?.leveledUp) fireLevelUp({ to: data.xp.leveledUp.to, level: data.xp.leveledUp.level });
      router.refresh();
    } catch {
      setError("Network error — your dataset is still here, try again.");
    } finally {
      setLoading(false);
    }
  }

  const r = resp?.result;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Left: dataset & controls ── */}
      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-ink">Dataset</h3>
            <Chip tone={classBalance.pass === 0 || classBalance.fail === 0 ? "rose" : Math.min(classBalance.pass, classBalance.fail) / rows.length < 0.15 ? "amber" : "mint"}>
              {classBalance.pass} pass / {classBalance.fail} fail
            </Chip>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  <th className="pb-2 pr-2">Study hrs</th>
                  <th className="pb-2 pr-2">Sleep hrs</th>
                  <th className="pb-2 pr-2">Passed?</th>
                  <th className="pb-2"><span className="sr-only">actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-void-700/50">
                    <td className="py-1.5 pr-2">
                      <input
                        type="number" min={0} max={24} step={0.5}
                        value={row.study}
                        aria-label={`Row ${i + 1} study hours`}
                        onChange={(e) => updateRow(i, { study: Number(e.target.value) })}
                        className="w-20 rounded-lg border border-void-700 bg-void-900 px-2 py-1 font-mono text-ink focus-ring"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number" min={0} max={24} step={0.5}
                        value={row.sleep}
                        aria-label={`Row ${i + 1} sleep hours`}
                        onChange={(e) => updateRow(i, { sleep: Number(e.target.value) })}
                        className="w-20 rounded-lg border border-void-700 bg-void-900 px-2 py-1 font-mono text-ink focus-ring"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <button
                        onClick={() => updateRow(i, { passed: !row.passed })}
                        aria-pressed={row.passed}
                        className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold focus-ring ${row.passed ? "border-mint-400/50 bg-mint-400/10 text-mint-300" : "border-rose-400/40 bg-rose-400/10 text-rose-300"}`}
                      >
                        {row.passed ? "YES" : "NO"}
                      </button>
                    </td>
                    <td className="py-1.5">
                      <button
                        onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                        aria-label={`Remove row ${i + 1}`}
                        className="rounded-lg p-1.5 text-ink-faint hover:text-rose-400 focus-ring"
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => setRows((rs) => [...rs.slice(0, 24), { study: 4, sleep: 7, passed: false }])}
          >
            + Add row
          </Button>
        </GlassCard>

        <GlassCard className="space-y-4 p-5">
          <h3 className="font-display font-bold text-ink">Training controls</h3>
          <Slider label={`Extra synthetic samples: ${extra}`} hint="How much more data to auto-generate for training" value={extra} min={0} max={60} onChange={setExtra} />
          <Slider label={`Label noise: ${Math.round(noise * 100)}%`} hint="Chance each added label is flipped — real data has errors" value={Math.round(noise * 100)} min={0} max={100} onChange={(v) => setNoise(v / 100)} />
          <Slider label={`Test split: ${Math.round(split * 100)}%`} hint="How much data is held back for honest testing" value={Math.round(split * 100)} min={10} max={50} onChange={(v) => setSplit(v / 100)} />
          <Button onClick={train} loading={loading} size="lg" className="w-full" disabled={rows.length < 2}>
            {loading ? "Training…" : "TRAIN MODEL"}
          </Button>
          {error && <p role="alert" className="rounded-lg border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}
        </GlassCard>
      </div>

      {/* ── Right: output ── */}
      <div className="space-y-4">
        {!r && !loading && (
          <GlassCard className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-volt-500/15 text-volt-300">
              <Icon name="cpu" size={26} />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-ink">Model status: untrained</p>
            <p className="mt-1 max-w-sm text-sm text-ink-dim">
              Edit the data, add noise, then train. Try to get 80%+ test accuracy — then sabotage the data and train again.
              And note: more data is not automatically better — 40 extra rows at 40% noise can make things worse.
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Educational simulation · deterministic logistic model</p>
          </GlassCard>
        )}
        {loading && (
          <GlassCard className="p-8" role="status" aria-label="Training model">
            <div className="space-y-3">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-24 w-full" />
              <div className="skeleton h-24 w-full" />
            </div>
            <p className="mt-4 text-center text-sm text-ink-dim">Splitting data → fitting weights → evaluating…</p>
          </GlassCard>
        )}
        {r && !loading && (
          <>
            <GlassCard className={`p-5 ${r.ok ? (r.testAccuracy >= 0.8 ? "border-mint-400/40" : r.testAccuracy >= 0.6 ? "border-amber-400/40" : "border-rose-400/40") : "border-rose-400/40"}`}>
              {!r.ok ? (
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400">Training blocked</p>
                  <p className="mt-2 text-sm text-ink">
                    {r.problem === "one-class"
                      ? "Your dataset contains only one answer. A model can't learn a difference that isn't there — it would just always say the same thing."
                      : "Not enough usable rows. Give the model at least 4 examples."}
                  </p>
                  <p className="mt-2 text-sm text-ink-dim">This is a feature: lesson one of ML is that data decides everything.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Model report</p>
                    {r.problem === "imbalanced" && <Chip tone="amber">imbalanced data</Chip>}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl border border-void-700 p-3">
                      <p className="font-mono text-[10px] uppercase text-ink-faint">Train acc</p>
                      <p className="mt-1 font-display text-2xl font-black text-ink">{Math.round(r.trainAccuracy * 100)}%</p>
                    </div>
                    <div className="rounded-xl border border-pulse-400/40 bg-pulse-400/5 p-3">
                      <p className="font-mono text-[10px] uppercase text-pulse-300">Test acc</p>
                      <p className="mt-1 font-display text-2xl font-black text-ink">{Math.round(r.testAccuracy * 100)}%</p>
                    </div>
                    <div className="rounded-xl border border-void-700 p-3">
                      <p className="font-mono text-[10px] uppercase text-ink-faint">Baseline</p>
                      <p className="mt-1 font-display text-2xl font-black text-ink-faint">{Math.round(r.baseline * 100)}%</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-ink-dim">
                    Baseline = guessing the majority class. Test accuracy beats it only if the model actually learned a pattern.{" "}
                    {r.trainAccuracy - r.testAccuracy > 0.15 && "⚠ Train ≫ test: the model is memorizing (overfitting)."}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-volt-300">
                    learned rule: pass ⇔ score({r.weights[1]} × study + {r.weights[2]} × sleep + {r.weights[0]}) ≥ 0.5
                  </p>
                </>
              )}
            </GlassCard>

            {r.ok && <ScatterPlot rows={r.predictions} boundary={r.decisionBoundary} norm={r.normalization} />}

            {r.ok && (
              <GlassCard className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Confusion matrix (test set)</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  {[
                    { k: "tp", v: r.confusion.tp, label: "Correctly predicted PASS", tone: "text-mint-300" },
                    { k: "fn", v: r.confusion.fn, label: "Missed passes (said fail)", tone: "text-amber-300" },
                    { k: "fp", v: r.confusion.fp, label: "False alarms (said pass)", tone: "text-amber-300" },
                    { k: "tn", v: r.confusion.tn, label: "Correctly predicted FAIL", tone: "text-mint-300" },
                  ].map((c) => (
                    <div key={c.k} className="rounded-xl border border-void-700 p-3">
                      <p className={`font-display text-xl font-black ${c.tone}`}>{c.v}</p>
                      <p className="mt-0.5 text-[10px] text-ink-faint">{c.label}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* teaching callouts */}
            {r.testAccuracy >= 0.8 && (
              <GlassCard className="border-mint-400/30 bg-mint-400/5 p-5">
                <p className="font-semibold text-mint-300">Solid model. Now break it.</p>
                <p className="mt-1 text-sm text-ink-dim">
                  Ideas: delete the failing students (one-sided data), crank noise past 40%, or train on 4 rows.
                  Notice <em>why</em> accuracy collapses.
                </p>
              </GlassCard>
            )}
            {r.testAccuracy < 0.6 && (
              <GlassCard className="border-rose-400/30 bg-rose-400/5 p-5">
                <p className="font-semibold text-rose-300">Not quite — and that&apos;s the lesson.</p>
                <p className="mt-1 text-sm text-ink-dim">
                  The model did what it could with what you gave it. More/better data usually beats cleverer algorithms.
                </p>
              </GlassCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Slider({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink">{label}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-pulse-400"
        aria-label={label}
      />
      <p className="text-[11px] text-ink-faint">{hint}</p>
    </div>
  );
}

function ScatterPlot({
  rows,
  boundary,
  norm,
}: {
  rows: { study: number; sleep: number; prob: number; actual: boolean }[];
  boundary: { slope: number; intercept: number } | null;
  norm: { mean: [number, number]; sd: [number, number] } | null;
}) {
  const W = 460;
  const H = 280;
  const pad = 32;
  const cx = (x: number) => pad + (x / 10) * (W - pad * 2);
  const cy = (y: number) => H - pad - (y / 10) * (H - pad * 2);

  // True decision line in raw (study, sleep) space, converting normalized coords back.
  let line: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (boundary && norm) {
    const slopeNorm = boundary.slope;
    const intNorm = boundary.intercept;
    // z2 = slope*z1 + intercept ⇒ (sleep-m2)/s2 = slope*(study-m1)/s1 + intercept
    const toRaw = (study: number) => {
      const z1 = (study - norm.mean[0]) / norm.sd[0];
      const z2 = slopeNorm * z1 + intNorm;
      return z2 * norm.sd[1] + norm.mean[1];
    };
    let x1 = 0;
    let x2 = 10;
    let y1 = toRaw(x1);
    let y2 = toRaw(x2);
    // clip to chart box [0..10]×[0..10]
    if (y1 < 0) { x1 = x1 + (0 - y1) * (x2 - x1) / (y2 - y1); y1 = 0; }
    if (y2 > 10) { x2 = x2 - (y2 - 10) * (x2 - x1) / (y2 - y1); y2 = 10; }
    if (y1 > 10) { x1 = x1 - (y1 - 10) * (x2 - x1) / (y2 - y1); y1 = 10; }
    if (y2 < 0) { x2 = x2 - y2 * (x2 - x1) / (y2 - y1); y2 = 0; }
    line = { x1: cx(x1), y1: cy(y1), x2: cx(x2), y2: cy(y2) };
  }

  return (
    <GlassCard className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Prediction map</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Scatter plot of examples with the model's decision boundary">
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <line x1={pad} x2={W - pad} y1={cy(i * 2.5)} y2={cy(i * 2.5)} stroke="#182036" strokeWidth="1" />
            <line x1={cx(i * 2.5)} x2={cx(i * 2.5)} y1={pad} y2={H - pad} stroke="#182036" strokeWidth="1" />
          </g>
        ))}
        {line && <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 4" />}
        {rows.map((r, i) => (
          <circle
            key={i}
            cx={cx(Math.min(10, r.study))}
            cy={cy(Math.min(10, r.sleep))}
            r="6"
            fill={r.actual ? "rgba(52,211,153,0.25)" : "rgba(244,63,94,0.2)"}
            stroke={r.prob >= 0.5 ? "#34d399" : "#f43f5e"}
            strokeWidth="1.5"
          >
            <title>{`${r.study}h study, ${r.sleep}h sleep → model says pass ${(r.prob * 100).toFixed(0)}%; actually ${r.actual ? "passed" : "failed"}`}</title>
          </circle>
        ))}
        <text x={W - pad} y={H - 8} textAnchor="end" fill="#5d6a86" fontSize="10">study hours →</text>
        <text x={pad - 6} y={pad - 10} fill="#5d6a86" fontSize="10">sleep →</text>
      </svg>
      <p className="mt-1 text-[11px] text-ink-faint">
        Dot color = model&apos;s prediction (green pass / red fail); ring tint = truth. The dashed line is the decision boundary.
      </p>
    </GlassCard>
  );
}
