"use client";

import { useMemo, useState } from "react";
import type { GlossaryTerm } from "@/lib/content";
import { GlassCard } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return terms;
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(needle) ||
        t.definition.toLowerCase().includes(needle) ||
        t.example?.toLowerCase().includes(needle),
    );
  }, [q, terms]);

  return (
    <div className="mt-6">
      <label htmlFor="glossary-search" className="sr-only">Search glossary</label>
      <div className="relative">
        <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          id="glossary-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search terms - try token, overfitting, bias…"
          className="w-full rounded-xl border border-void-700 bg-void-850 py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-faint focus-ring"
        />
      </div>
      {filtered.length === 0 ? (
        <GlassCard className="mt-6 p-10 text-center">
          <p className="font-display text-lg font-bold text-ink">No entry for &quot;{q}&quot;</p>
          <p className="mt-1 text-sm text-ink-dim">Try a broader term, or hit a related lesson from the search results.</p>
        </GlassCard>
      ) : (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((t) => (
            <GlassCard key={t.term} id={t.term} className="p-5 scroll-mt-24">
              <dt className="font-display text-lg font-bold capitalize text-ink">{t.term}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-dim">{t.definition}</dd>
              {t.example && <dd className="mt-2 border-l-2 border-pulse-400/40 pl-3 text-xs italic text-ink-faint">{t.example}</dd>}
              {t.related && t.related.length > 0 && (
                <dd className="mt-3 flex flex-wrap gap-1.5">
                  {t.related.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQ(r)}
                      className="rounded-full border border-void-700 px-2 py-0.5 text-[11px] text-ink-faint transition-colors hover:border-pulse-400/50 hover:text-pulse-700 dark:text-pulse-300 focus-ring"
                    >
                      {r}
                    </button>
                  ))}
                </dd>
              )}
            </GlassCard>
          ))}
        </dl>
      )}
    </div>
  );
}
