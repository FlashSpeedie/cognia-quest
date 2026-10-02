import { Icon } from "@/components/ui/Icon";

/**
 * The compact creator credit rendered directly under every lesson video:
 * "Video source: LunarTech". The complete source record (title, platform,
 * timestamp, original link) lives once, in the lesson's References section.
 */
export function SourceAttribution({
  creator,
  url,
}: {
  creator: string;
  url: string;
}) {
  return (
    <p
      aria-label="Video source attribution"
      data-video-credit
      className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg border border-void-700/60 bg-void-850 px-4 py-2.5 text-xs text-ink-dim"
    >
      <Icon name="eye" size={12} className="text-ink-faint" aria-hidden="true" />
      <span className="font-semibold text-ink">{"Video source: "}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300"
      >
        {creator}
      </a>
      <span className="text-ink-faint">{"· full citation in this lesson's References section"}</span>
    </p>
  );
}
