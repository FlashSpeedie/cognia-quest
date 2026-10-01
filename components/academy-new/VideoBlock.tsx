"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Video block: the external YouTube source, embedded as a facade.
 * The iframe mounts only after the student clicks play (one player per
 * lesson - never eight), with official embed parameters pinning the exact
 * segment (start/end). The video stays hosted by the original publisher.
 */
export function VideoBlock({
  videoId,
  start,
  end,
  title,
  creator,
}: {
  videoId: string;
  start: number;
  end: number;
  title: string;
  creator: string;
}) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embed = `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&end=${end}&rel=0&modestbranding=1`;

  if (playing) {
    return (
      <div className="overflow-hidden rounded-xl border border-void-700/70 bg-void-950 shadow-card">
        <div className="relative aspect-video w-full">
          <iframe
            src={embed}
            title={`${title} - ${creator} (via YouTube)`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-void-700/70 bg-void-900 shadow-card">
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play the lesson video segment: ${title} by ${creator} on YouTube`}
        className="group relative block aspect-video w-full focus-ring"
      >
        <span
          role="img"
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${thumb})` }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-void-950/80 via-void-950/10 to-void-950/20"
        />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pulse-600 text-white shadow-pop transition-transform duration-150 group-hover:scale-105"
        >
          <Icon name="spark" size={26} className="ml-1" />
        </span>
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-left">
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-white/70">
              Lesson video
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-white">{title}</span>
          </span>
          <span className="shrink-0 rounded-md bg-white/15 px-2 py-1 font-mono text-[11px] font-semibold text-white backdrop-blur-sm">
            YouTube
          </span>
        </span>
      </button>
    </div>
  );
}
