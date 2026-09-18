"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { runBiasSim, BIAS_FEATURES } from "@/content/biasData";
import type { BiasApplicant } from "@/content/biasData";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

type ApplicantRow = BiasApplicant & { score: number; approved: boolean };

export function BiasSim() {
  const [active, setActive] = useState<Set<string>>(new Set(BIAS_FEATURES.map((f) => f.key)));
  const [identified, setIdentified] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const { push } = useToast();
  const router = useRouter();
  const recordedRef = useRef({ ran: false, fixed: false });

  const result = useMemo(() => runBiasSim([...active]), [active]);
  const usingProxy = active.has("commuteMin");

  async function record(resultPayload: Record<string, unknown>) {
    try {
      const res = await fetch("/api/sim/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simId: "bias", result: resultPayload }),
      });
      if (res.ok) {
        const d = (await res.json()) as { xp?: { awarded: number }; badges?: string[] };
        if (d.xp && d.xp.awarded > 0) push({ kind: "xp", title: `+${d.xp.awarded} XP`, body: "Bias investigation" });
        for (const b of d.badges ?? []) push({ kind: "badge", title: `Badge unlocked: ${b}` });
        router.refresh();
      }
    } catch {
      push({ kind: "error", title: "Couldn't save run", body: "Local progress only this time." });
    }
  }

  function identify(feature: string) {
    setSelectedFeature(feature);
    const isRight = feature === "commuteMin";
    if (isRight && !identified) {
      setIdentified(true);
      void record({ identifiedFeature: feature });
    }
  }

  function toggleFeature(key: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      const removedProxy = !next.has("commuteMin");
      if (identified && removedProxy && !recordedRef.current.fixed) {
        recordedRef.current.fixed = true;
        setTimeout(() => void record({ rechecked: true, identifiedFeature: "commuteMin" }), 50);
      } else if (!recordedRef.current.ran) {
        recordedRef.current.ran = true;
        void record({ firstInspect: true });
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Scenario</p>
            <p className="mt-1 text-sm text-ink">
              A school awards <strong>6 scholarships</strong>. A model was trained on historical decisions. Review its output below —
              then figure out <em>which feature is leaking bias into it</em>.
            </p>
          </div>
          <Chip tone={usingProxy ? "amber" : "mint"}>
            {usingProxy ? "proxy feature active" : "proxy removed"}
          </Chip>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-display text-3xl font-black text-ink">{result.nearRate}%</p>
              <p className="text-[11px] text-ink-faint">approval · live ≤15 min away</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-black text-ink">{result.farRate}%</p>
              <p className="text-[11px] text-ink-faint">approval · live ≥30 min away</p>
            </div>
            <div className="text-center">
              <p className={`font-display text-3xl font-black ${result.disparity > 20 ? "text-rose-400" : "text-mint-300"}`}>
                {result.disparity > 0 ? "+" : ""}{result.disparity}
              </p>
              <p className="text-[11px] text-ink-faint">point gap</p>
            </div>
          </div>
          {result.crossover && (
            <p className="max-w-xs text-xs leading-relaxed text-amber-300">
              🚩 A <strong>{result.crossover.approvedGPA.toFixed(1)} GPA</strong> applicant 12 minutes away was approved while a{" "}
              <strong>{result.crossover.rejectedGPA.toFixed(1)} GPA</strong> applicant 48 minutes out was rejected.
            </p>
          )}
        </div>
      </GlassCard>

      {/* feature inspector */}
      <GlassCard className="p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Feature inspector — which one is the leak?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BIAS_FEATURES.map((f) => {
            const on = active.has(f.key);
            return (
              <div key={f.key} className="flex items-center gap-2 rounded-xl border border-void-700 p-2">
                <button
                  onClick={() => identify(f.key)}
                  aria-pressed={selectedFeature === f.key}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold focus-ring ${
                    identified && f.suspicious
                      ? "bg-rose-400/20 text-rose-300"
                      : selectedFeature === f.key && !f.suspicious
                        ? "bg-void-700 text-ink-dim"
                        : "bg-void-800 text-ink hover:bg-void-700"
                  }`}
                >
                  {f.label} {identified && f.suspicious ? "⚠ leak" : ""}
                </button>
                <button
                  onClick={() => toggleFeature(f.key)}
                  role="switch"
                  aria-checked={on}
                  aria-label={`Use feature ${f.label}`}
                  className={`relative h-5 w-9 rounded-full transition-colors focus-ring ${on ? "bg-pulse-500" : "bg-void-700"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            );
          })}
        </div>
        {selectedFeature && !identified && (
          <div className="mt-3 space-y-1">
            {selectedFeature === "commuteMin" ? null : (
              <p className="text-xs text-ink-faint">
                {selectedFeature === "grades" && "GPA is a legitimate feature — and it doesn't explain the geographic pattern."}
                {selectedFeature === "activities" && "Extracurriculars matter, but they don't correlate with distance from school."}
                {selectedFeature === "attendance" && "Attendance is a fair signal — unrelated to the gap you're seeing."}
              </p>
            )}
          </div>
        )}
        {identified && (
          <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-ink">
            <p className="font-semibold text-rose-300">Leak found: commute distance.</p>
            <p className="mt-1 text-ink-dim">
              Distance proxies neighborhood and income. The model never needed to see race or wealth — the proxy smuggled the pattern in.
              <strong> Switch off &quot;Commute distance&quot;</strong> and re-run to see the gap collapse. (And remember: removing one
              proxy doesn&apos;t guarantee fairness — you have to re-audit.)
            </p>
          </div>
        )}
      </GlassCard>

      {/* applicant table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-void-700 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">GPA</th>
                <th className="px-4 py-3">Activities</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Commute</th>
                <th className="px-4 py-3">Model score</th>
                <th className="px-4 py-3">Decision</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r: ApplicantRow) => (
                <tr key={r.id} className={`border-b border-void-700/40 ${r.approved ? "bg-mint-400/5" : ""}`}>
                  <td className="px-4 py-2 font-mono text-xs text-ink-faint">#{String(r.id).padStart(3, "0")}</td>
                  <td className="px-4 py-2 font-mono">{r.grades.toFixed(1)}</td>
                  <td className="px-4 py-2 font-mono">{r.activities}</td>
                  <td className="px-4 py-2 font-mono">{r.attendance}%</td>
                  <td className={`px-4 py-2 font-mono ${usingProxy && r.commuteMin >= 30 ? "text-rose-300" : ""}`}>{r.commuteMin} min</td>
                  <td className="px-4 py-2 font-mono text-pulse-300">{r.score.toFixed(1)}</td>
                  <td className="px-4 py-2">
                    <Chip tone={r.approved ? "mint" : "neutral"}>{r.approved ? "APPROVED" : "declined"}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {!usingProxy ? (
        <GlassCard className="border-mint-400/30 bg-mint-400/5 p-5">
          <div className="flex items-start gap-3">
            <Icon name="check" size={22} className="mt-0.5 shrink-0 text-mint-300" />
            <div>
              <p className="font-semibold text-mint-300">Re-check complete: the gap collapsed.</p>
              <p className="mt-1 text-sm text-ink-dim">
                With commute distance removed, approvals track academic merit. Three lessons to keep:
                biased history teaches biased models; proxies can smuggle in what you removed directly; and fairness work means
                auditing <em>outcomes</em>, not just feature lists.
              </p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <Button variant="secondary" onClick={() => toggleFeature("commuteMin")} disabled={!identified}>
          {identified ? "Remove commute distance & re-run" : "Identify the leaking feature first"}
        </Button>
      )}
    </div>
  );
}
