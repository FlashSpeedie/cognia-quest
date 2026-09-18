"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";

const COLUMNS = [
  { id: "hours", label: "Study hours / week", verdict: "useful", note: "Direct learning signal — legitimate feature." },
  { id: "sleep", label: "Sleep hours / night", verdict: "useful", note: "Correlates with outcomes; fine to include." },
  { id: "past", label: "Past quiz scores", verdict: "useful", note: "Strongest signal available." },
  { id: "zip", label: "ZIP code", verdict: "risky", note: "Proxies for income and ethnicity — a fairness trap." },
  { id: "name", label: "Student name", verdict: "harmless-useless", note: "Identifiers carry no pattern; they just memorize rows (and leak privacy)." },
  { id: "dist", label: "Distance from school", verdict: "risky", note: "Like ZIP: often a proxy for neighborhood wealth." },
];

export function FeaturePicker({ onComplete }: { onComplete?: () => void }) {
  const [sel, setSel] = useState<Set<string>>(new Set(["hours", "past"]));
  const [checked, setChecked] = useState(false);

  const trapPicked = sel.has("zip") || sel.has("dist");

  return (
    <div>
      <p className="mb-3 text-sm text-ink-dim">Task: help a model predict student success. Toggle which columns should be features:</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {COLUMNS.map((c) => {
          const on = sel.has(c.id);
          return (
            <GlassCard key={c.id} className={`p-3 ${checked && c.verdict === "risky" && on ? "border-amber-400/50" : ""} ${checked && c.verdict === "risky" && !on ? "border-mint-400/40" : ""}`}>
              <label className="flex cursor-pointer items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{c.label}</p>
                  {checked && (
                    <p className={`mt-1 text-xs ${c.verdict === "risky" ? "text-amber-300" : c.verdict === "useful" ? "text-mint-300" : "text-ink-faint"}`}>
                      {c.note}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={checked}
                  onChange={() =>
                    setSel((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.id)) next.delete(c.id);
                      else next.add(c.id);
                      return next;
                    })
                  }
                  className="h-4 w-4 accent-pulse-500"
                  aria-label={`Use feature: ${c.label}`}
                />
              </label>
            </GlassCard>
          );
        })}
      </div>
      <div className="mt-4">
        {!checked ? (
          <Button onClick={() => { setChecked(true); if (!trapPicked) onComplete?.(); }}>Review choices</Button>
        ) : (
          <p className="text-sm text-ink">
            {trapPicked
              ? "⚠ You included a proxy feature (ZIP or distance). Legal to collect? Maybe. Fair to use? That's the unit's whole point."
              : "Clean choices — signals without the proxy traps."}
          </p>
        )}
      </div>
    </div>
  );
}
