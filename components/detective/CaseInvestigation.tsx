"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DetectiveCase, IssueType } from "@/lib/content";
import { ISSUE_LABELS } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { Icon, type IconName } from "@/components/ui/Icon";

type EvidenceTab = "claim" | "source" | "context" | "logic";

export function CaseInvestigation({ caseFile, alreadySolved }: { caseFile: DetectiveCase; alreadySolved: boolean }) {
  const [tab, setTab] = useState<EvidenceTab>("claim");
  const [verdict, setVerdict] = useState<IssueType | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    explanation: string;
    teachingPoint: string;
    actualIssue: IssueType;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { push } = useToast();
  const router = useRouter();

  const TABS: { id: EvidenceTab; label: string; icon: IconName; body: string }[] = [
    { id: "claim", label: "Claim", icon: "flag", body: caseFile.evidence.claim },
    { id: "source", label: "Source", icon: "book", body: caseFile.evidence.source },
    { id: "context", label: "Context", icon: "network", body: caseFile.evidence.context },
    { id: "logic", label: "Logic", icon: "brain", body: caseFile.evidence.logic },
  ];

  async function submit() {
    if (!verdict) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/detective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: caseFile.id, verdict }),
      });
      const d = (await res.json()) as {
        correct: boolean; explanation: string; teachingPoint: string; actualIssue: IssueType;
        xp?: { awarded: number }; badges?: string[]; error?: string;
      };
      if (!res.ok) {
        setSubmitError(d.error ?? "Submission failed. Try again.");
        return;
      }
      setResult(d);
      if (d.correct && d.xp && d.xp.awarded > 0) {
        push({ kind: "xp", title: `+${d.xp.awarded} XP`, body: `Case #${caseFile.caseNo} solved` });
      }
      for (const b of d.badges ?? []) push({ kind: "badge", title: `Badge unlocked: ${b}` });
      router.refresh();
    } catch {
      setSubmitError("Network error — your verdict wasn't recorded.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Evidence panel */}
      <div className="space-y-4 lg:col-span-3">
        <GlassCard glow className="border-void-700 p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-void-700 px-5 py-3">
            <span className="font-mono text-[11px] tracking-[0.25em] text-ink-faint">
              CASE #{String(caseFile.caseNo).padStart(4, "0")} — {caseFile.title.toUpperCase()}
            </span>
            <Chip tone={alreadySolved ? "mint" : "amber"}>{alreadySolved ? "closed" : "active"}</Chip>
          </div>
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-volt-300">AI generated response</p>
            <blockquote className="mt-3 rounded-xl border border-volt-400/25 bg-volt-400/5 p-5 text-lg leading-relaxed text-ink">
              “{caseFile.response}”
            </blockquote>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-3">Evidence locker</p>
          <div role="tablist" aria-label="Evidence categories" className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold focus-ring ${
                  tab === t.id ? "border-pulse-400 bg-pulse-400/15 text-pulse-300" : "border-void-700 text-ink-dim hover:text-ink"
                }`}
              >
                <Icon name={t.icon} size={13} /> {t.label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-void-700 bg-void-900/60 p-4">
            <p className="text-sm leading-relaxed text-ink-dim">{TABS.find((t) => t.id === tab)!.body}</p>
          </div>
        </GlassCard>
      </div>

      {/* Verdict panel */}
      <div className="lg:col-span-2">
        <GlassCard className="p-5 sticky top-20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Your verdict</p>
          <p className="mt-1 text-sm text-ink-dim">What&apos;s suspicious about this response?</p>
          <div className="mt-3 space-y-1.5" role="radiogroup" aria-label="Issue type">
            {(Object.keys(ISSUE_LABELS) as IssueType[]).map((v) => (
              <button
                key={v}
                role="radio"
                aria-checked={verdict === v}
                disabled={!!result?.correct}
                onClick={() => setVerdict(v)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors focus-ring ${
                  verdict === v ? "border-pulse-400 bg-pulse-400/15 text-pulse-200" : "border-void-700 text-ink-dim hover:text-ink"
                }`}
              >
                {ISSUE_LABELS[v]}
              </button>
            ))}
          </div>
          {!result?.correct && (
            <>
              <Button className="mt-4 w-full" onClick={submit} disabled={!verdict} loading={submitting}>
                Submit investigation
              </Button>
              {submitError && <p role="alert" className="mt-2 text-xs text-rose-400">{submitError}</p>}
            </>
          )}
          {result && (
            <div className={`mt-4 rounded-xl border p-4 ${result.correct ? "border-mint-400/40 bg-mint-400/10" : "border-rose-400/40 bg-rose-400/10"}`} aria-live="polite">
              <p className={`font-display font-bold ${result.correct ? "text-mint-300" : "text-rose-300"}`}>
                {result.correct ? "Case closed — nice catch!" : "Not quite. Keep digging."}
              </p>
              {!result.correct && (
                <p className="mt-1 text-xs text-ink-dim">Find more evidence, then submit another verdict.</p>
              )}
              {result.correct && (
                <>
                  <p className="mt-2 text-sm text-ink">{result.explanation}</p>
                  <p className="mt-2 border-l-2 border-pulse-400/40 pl-3 text-xs text-ink-dim">
                    <span className="font-semibold text-pulse-300">Field note:</span> {result.teachingPoint}
                  </p>
                  <Chip tone="neutral" className="mt-3 font-mono text-[10px]">
                    actual issue: {ISSUE_LABELS[result.actualIssue]}
                  </Chip>
                </>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
