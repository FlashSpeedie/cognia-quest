import { Icon } from "@/components/ui/Icon";
import { formatSegment } from "@/lib/academy";

/**
 * Creator credit - rendered directly under every lesson video.
 * Compact, visible, and unambiguous: Cognia Quest did not produce this
 * video; it remains hosted by its original creator/publisher on YouTube.
 */
export function SourceAttribution({
  videoTitle,
  creator,
  url,
  segments,
}: {
  videoTitle: string;
  creator: string;
  url: string;
  segments: { label: string; chapter: string; start: number; end: number }[];
}) {
  return (
    <aside
      aria-label="Video source attribution"
      className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-2 rounded-xl border border-void-700/60 bg-void-850 px-4 py-3 text-sm"
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          <Icon name="eye" size={12} aria-hidden="true" /> Video source
        </p>
        <p className="mt-1 truncate font-semibold text-ink" title={videoTitle}>
          {videoTitle}
        </p>
        <p className="mt-0.5 text-ink-dim">
          Creator: <span className="font-medium text-ink">{creator}</span> · Platform: YouTube · Externally hosted
        </p>
        <p className="mt-1 text-ink-dim">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
            Lesson segment{segments.length === 1 ? "" : "s"}
          </span>
        </p>
        <ul className="mt-0.5 space-y-0.5">
          {segments.map((s, i) => (
            <li key={i} className="text-ink-dim">
              {segments.length > 1 && <span className="font-mono text-[11px] text-ink-faint">{i + 1}. </span>}
              <span className="font-medium text-ink">{s.label}</span>{" "}
              <span className="text-ink-faint">· {s.chapter}</span>{" "}
              <span className="font-mono">{formatSegment(s.start, s.end)}</span>
            </li>
          ))}
        </ul>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-void-700 bg-void-900 px-3 py-2 text-xs font-semibold text-pulse-700 transition-colors hover:border-pulse-400/50 hover:bg-pulse-50 focus-ring dark:text-pulse-300 dark:hover:bg-pulse-950/40"
      >
        Watch original video
        <Icon name="arrow-right" size={13} aria-hidden="true" />
      </a>
    </aside>
  );
}
