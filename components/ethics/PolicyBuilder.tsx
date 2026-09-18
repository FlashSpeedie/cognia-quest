"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

const STANCES = [
  { id: "allowed", label: "Allowed freely", tone: "border-mint-400/50 text-mint-300" },
  { id: "disclose", label: "Allowed with disclosure", tone: "border-pulse-400/50 text-pulse-300" },
  { id: "ask-first", label: "Ask the teacher first", tone: "border-amber-400/50 text-amber-300" },
  { id: "not-allowed", label: "Not allowed", tone: "border-rose-400/50 text-rose-400" },
] as const;

const SCENARIOS = [
  { id: "explain", label: "AI explaining a concept you don't understand" },
  { id: "essay", label: "AI writing paragraphs for a graded essay" },
  { id: "outline", label: "AI outlining / brainstorming your assignment" },
  { id: "code", label: "AI debugging your CS homework" },
  { id: "quizprep", label: "AI generating practice questions for self-testing" },
  { id: "citations", label: "AI-suggested sources in your bibliography" },
  { id: "translate", label: "AI translating your own sentences in language class" },
] as const;

export function PolicyBuilder() {
  const [rules, setRules] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const settled = Object.keys(rules).length;

  async function publish() {
    setSaving(true);
    try {
      const res = await fetch("/api/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      if (res.ok) {
        setPublished(true);
        push({ kind: "success", title: "Policy published", body: "Mission 09 progress saved." });
        router.refresh();
      } else {
        const d = (await res.json()) as { error?: string };
        push({ kind: "error", title: "Couldn't publish", body: d.error ?? "Try again." });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <GlassCard className="p-5">
        <p className="text-sm leading-relaxed text-ink-dim">
          Real institutions don&apos;t ban or bless AI wholesale — they write <em>context-specific rules</em>.
          Choose a stance per scenario. There are no trick answers here; the exercise is thinking in shades.
        </p>
      </GlassCard>
      <div className="mt-5 space-y-3">
        {SCENARIOS.map((s) => (
          <GlassCard key={s.id} className="p-4">
            <p className="text-sm font-semibold text-ink">{s.label}</p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Rule for: ${s.label}`}>
              {STANCES.map((st) => (
                <button
                  key={st.id}
                  role="radio"
                  aria-checked={rules[s.id] === st.id}
                  onClick={() => setRules((r) => ({ ...r, [s.id]: st.id }))}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-ring ${
                    rules[s.id] === st.id ? st.tone + " bg-void-800" : "border-void-700 text-ink-faint hover:text-ink"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Button size="lg" onClick={publish} disabled={settled < 4} loading={saving}>
          <Icon name="check" size={16} /> Publish policy ({settled}/{SCENARIOS.length} set)
        </Button>
        {settled < 4 && <p className="text-xs text-ink-faint">Set at least 4 rules.</p>}
      </div>
      {published && (
        <GlassCard glow className="mt-6 border-mint-400/30 p-5">
          <p className="font-display text-lg font-bold text-ink">Your Responsible AI Policy 📜</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-dim">
            {SCENARIOS.filter((s) => rules[s.id]).map((s) => (
              <li key={s.id} className="flex justify-between gap-3">
                <span>{s.label}</span>
                <span className="font-mono text-xs uppercase text-pulse-300">
                  {STANCES.find((x) => x.id === rules[s.id])?.label}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
