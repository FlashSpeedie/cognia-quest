import type { ExplanationBlock } from "@/content/academy/types";
import { Diagram } from "./Diagrams";
import { Icon } from "@/components/ui/Icon";

/**
 * Server-rendered explanation blocks: original Cognia Quest teaching copy.
 * Callouts, definitions and examples use the same restrained visual language
 * as the rest of the site.
 */

const CALLOUT_STYLES: Record<string, { border: string; icon: "spark" | "eye" | "badge" | "brain"; kicker: string }> = {
  info: { border: "border-pulse-400/50 bg-pulse-400/5", icon: "eye", kicker: "Note" },
  warning: { border: "border-amber-400/50 bg-amber-400/5", icon: "spark", kicker: "Watch out" },
  tip: { border: "border-mint-400/50 bg-mint-400/5", icon: "badge", kicker: "Tip" },
  think: { border: "border-volt-400/50 bg-volt-400/5", icon: "brain", kicker: "Think about it" },
};

export function BlockView({ block }: { block: ExplanationBlock }) {
  switch (block.kind) {
    case "text":
      return (
        <div>
          {block.heading && (
            <h2 className="font-display text-xl font-bold text-ink">{block.heading}</h2>
          )}
          <div className="mt-3 space-y-3.5">
            {block.paragraphs.map((p, i) => (
              <p key={i} className="leading-[1.75] text-ink-dim">
                {p}
              </p>
            ))}
          </div>
        </div>
      );
    case "callout": {
      const s = CALLOUT_STYLES[block.variant]!;
      return (
        <aside className={`rounded-xl border-l-4 px-5 py-4 ${s.border}`}>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink-dim">
            <Icon name={s.icon} size={14} aria-hidden="true" />
            {s.kicker}
          </p>
          <p className="mt-2 font-display text-base font-bold text-ink">{block.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{block.body}</p>
        </aside>
      );
    }
    case "definition":
      return (
        <div className="rounded-xl border border-pulse-400/30 bg-pulse-400/5 px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-pulse-700 dark:text-pulse-300">
            Definition
          </p>
          <p className="mt-1.5 font-display text-lg font-bold text-ink">{block.term}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{block.body}</p>
        </div>
      );
    case "example":
      return (
        <div className="rounded-xl border border-void-700/70 bg-void-850 px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">Example</p>
          <p className="mt-1.5 font-display text-lg font-bold text-ink">{block.title}</p>
          <div className="mt-2 space-y-2.5">
            {block.body.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink-dim">
                {p}
              </p>
            ))}
          </div>
        </div>
      );
    case "diagram":
      return <Diagram id={block.id} caption={block.caption} />;
  }
}
