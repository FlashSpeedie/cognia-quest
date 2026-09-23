"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { recordSimFeedback } from "./recordSim";

interface ExplRow {
  id: number;
  study: number;
  sleep: number | null;
  passed: boolean;
}

const DATA: ExplRow[] = (() => {
  const rows: ExplRow[] = [
    { id: 1, study: 2.0, sleep: 5, passed: false },
    { id: 2, study: 3.0, sleep: 6, passed: false },
    { id: 3, study: 5.0, sleep: 7, passed: true },
    { id: 4, study: 6.0, sleep: 8, passed: true },
    { id: 5, study: 8.0, sleep: 8, passed: true },
    { id: 6, study: 8.2, sleep: 8.5, passed: true },
    { id: 7, study: 8.1, sleep: 8, passed: true },
    { id: 8, study: 7.5, sleep: null, passed: true },
    { id: 9, study: 4.0, sleep: 6.5, passed: false },
    { id: 10, study: 2.5, sleep: 5.5, passed: false },
    { id: 11, study: 99, sleep: 8, passed: true }, // outlier
    { id: 12, study: 3.0, sleep: 6, passed: false }, // duplicate-ish
    { id: 13, study: 3.0, sleep: 6, passed: false },
    { id: 14, study: 6.5, sleep: 7.5, passed: true },
    { id: 15, study: 7.0, sleep: 7, passed: true },
    { id: 16, study: 1.5, sleep: 4.5, passed: false },
  ];
  return rows;
})();

type SortKey = "id" | "study" | "sleep" | "passed";

export function DataExplorer() {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [guess, setGuess] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const rows = useMemo(() => {
    let rs = [...DATA];
    if (onlyMissing) rs = rs.filter((r) => r.sleep === null);
    rs.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === null) return 1;
      if (vb === null) return -1;
      if (typeof va === "boolean") return Number(va) - Number(vb as boolean);
      return (va as number) - (vb as number);
    });
    return rs;
  }, [sortKey, onlyMissing]);

  const ISSUES = [
    { id: "missing", label: "Missing values", present: true, note: "Row 8 is missing Sleep - decide: drop, impute, or investigate." },
    { id: "outlier", label: "A likely data-entry outlier", present: true, note: "99 study hours in a week (row 11) is beyond real schedules. Outliers can bend models hard." },
    { id: "imbalance", label: "Class imbalance", present: true, note: "9 pass vs 7 fail is mild here - but you've seen how much worse it can get." },
    { id: "duplicates", label: "Duplicate entries", present: true, note: "Rows 12–13 repeat row 2. Duplicates overweight one example." },
  ];

  const all = ISSUES.every((i) => guess.has(i.id));

  async function submit() {
    setChecked(true);
    if (all) {
      await recordSimFeedback("data-explorer", { foundAll: true });
      push({ kind: "xp", title: "Dataset forensics complete", body: "All four issues found." });
      router.refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <GlassCard className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-void-700 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">student_study_v3.csv - {DATA.length} rows</p>
          <div className="flex gap-2">
            {(["study", "sleep", "passed"] as SortKey[]).map((k) => (
              <button key={k} onClick={() => setSortKey(k)} className={`rounded-lg border px-2.5 py-1 text-xs capitalize focus-ring ${sortKey === k ? "border-pulse-400 text-pulse-700 dark:text-pulse-300" : "border-void-700 text-ink-faint hover:text-ink"}`} aria-pressed={sortKey === k}>
                sort by {k}
              </button>
            ))}
            <button onClick={() => setOnlyMissing((v) => !v)} className={`rounded-lg border px-2.5 py-1 text-xs focus-ring ${onlyMissing ? "border-amber-400 text-amber-600 dark:text-amber-300" : "border-void-700 text-ink-faint hover:text-ink"}`} aria-pressed={onlyMissing}>
              missing only
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-void-850">
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                <th className="px-3 py-2">#</th><th className="px-3 py-2">Study</th><th className="px-3 py-2">Sleep</th><th className="px-3 py-2">Passed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t border-void-700/40 ${r.study > 24 ? "bg-rose-400/10" : r.sleep === null ? "bg-amber-400/5" : ""}`}>
                  <td className="px-3 py-1.5 font-mono text-xs text-ink-faint">{r.id}</td>
                  <td className="px-3 py-1.5 font-mono">{r.study}</td>
                  <td className="px-3 py-1.5 font-mono">{r.sleep ?? <span className="text-amber-600 dark:text-amber-300">-missing-</span>}</td>
                  <td className="px-3 py-1.5 font-mono">{r.passed ? "✓" : "✗"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="h-fit p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Forensics</p>
        <h3 className="mt-1 font-display text-lg font-bold text-ink">What problems do you notice?</h3>
        <div className="mt-3 space-y-2">
          {ISSUES.map((i) => {
            const on = guess.has(i.id);
            return (
              <label key={i.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${checked && on && i.present ? "border-mint-400/40" : "border-void-700"}`}>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={checked}
                  onChange={() => setGuess((g) => { const n = new Set(g); if (n.has(i.id)) n.delete(i.id); else n.add(i.id); return n; })}
                  className="mt-1 h-4 w-4 accent-pulse-500"
                />
                <span>
                  <span className="text-sm font-semibold text-ink">{i.label}</span>
                  {checked && on && <span className="mt-0.5 block text-xs text-ink-dim">{i.note}</span>}
                </span>
              </label>
            );
          })}
        </div>
        {!checked ? (
          <Button className="mt-4" onClick={submit}>Report findings</Button>
        ) : (
          <p className="mt-4 text-sm text-ink">
            {all ? "All four caught. Real datasets arrive dirty - cleaning them IS data science." : `You flagged ${guess.size}/4 expected findings. Inspect once more.`}
          </p>
        )}
      </GlassCard>
    </div>
  );
}
