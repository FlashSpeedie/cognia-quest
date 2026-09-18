"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";

const TYPES = ["Computer vision", "NLP (language)", "Recommender", "Generative AI"] as const;
const APPS = [
  { label: "A music app builds a playlist you'll probably like", type: "Recommender" },
  { label: "A photo app finds all pictures of your dog", type: "Computer vision" },
  { label: "A tool drafts a birthday poem in Shakespeare's style", type: "Generative AI" },
  { label: "An app live-translates a conversation", type: "NLP (language)" },
  { label: "A car reads the speed limit sign ahead", type: "Computer vision" },
  { label: "A shopping site shows 'because you viewed headphones'", type: "Recommender" },
];

export function AITypesMatch({ onComplete }: { onComplete?: () => void }) {
  const [picked, setPicked] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const done = Object.keys(picked).length === APPS.length;
  const correct = APPS.filter((a, i) => picked[i] === a.type).length;

  return (
    <div>
      <div className="grid gap-3">
        {APPS.map((app, i) => {
          const ok = picked[i] === app.type;
          return (
            <GlassCard key={i} className={`p-3.5 ${checked ? (ok ? "border-mint-400/40" : "border-rose-400/40") : ""}`}>
              <p className="text-sm text-ink">{app.label}</p>
              <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Type for: ${app.label}`}>
                {TYPES.map((t) => (
                  <button
                    key={t}
                    role="radio"
                    aria-checked={picked[i] === t}
                    disabled={checked}
                    onClick={() => setPicked((p) => ({ ...p, [i]: t }))}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors focus-ring ${
                      picked[i] === t ? "border-pulse-400 bg-pulse-400/15 text-pulse-300" : "border-void-700 text-ink-dim hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {checked && !ok && <p className="mt-1.5 text-xs text-rose-400">It&apos;s {app.type}.</p>}
            </GlassCard>
          );
        })}
      </div>
      <div className="mt-4">
        {!checked ? (
          <Button disabled={!done} onClick={() => { setChecked(true); if (correct >= APPS.length - 1) onComplete?.(); }}>
            Check matches
          </Button>
        ) : (
          <p className="text-sm text-ink">
            {correct}/{APPS.length} correct. {correct === APPS.length ? "You can spot the machinery behind everyday apps." : "Review the corrections above."}
          </p>
        )}
      </div>
    </div>
  );
}
