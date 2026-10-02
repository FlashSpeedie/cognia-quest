"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Checkpoint } from "@/content/academy/types";
import {
  segmentTimings,
  totalLessonSeconds,
  sourceToLocal,
  localToSource,
  formatDuration,
  formatClock,
  formatSegment,
  type SegmentTiming,
} from "@/lib/academy";
import type { YTPlayer } from "@/lib/youtube";
import { Icon } from "@/components/ui/Icon";
import { CheckpointQuestion } from "./CheckpointQuestion";
import { useLessonProgress } from "./LessonProgressContext";

/**
 * The Cognia segment player.
 *
 * Lessons never embed the full (11+ hour) source video. Each lesson plays a
 * playlist of exact source segments through ONE underlying YouTube IFrame
 * API player (loaded only after the student presses play - never on page
 * load), wrapped in a Cognia learning shell:
 *   - custom play/pause, ±10s, prev/next segment, speed, mute, fullscreen
 *   - a lesson-local timeline (segment-mapped, never the source duration)
 *   - authored checkpoints pause playback at conceptual transitions
 *
 * The official embed (and its required attribution) stay intact underneath;
 * standard YouTube controls are disabled via the official playerVars API.
 */

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export interface PlayerSegment {
  id: string;
  label: string;
  chapter: string;
  startSeconds: number;
  endSeconds: number;
}

let ytLoader: Promise<NonNullable<Window["YT"]>> | null = null;
function loadYouTubeApi(): Promise<NonNullable<Window["YT"]>> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!ytLoader) {
    ytLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        ytLoader = null;
        reject(new Error("YouTube API failed to load"));
      };
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT?.Player) resolve(window.YT);
        else reject(new Error("YouTube API unavailable"));
      };
      document.head.appendChild(script);
    });
  }
  return ytLoader;
}

const POS_KEY = (lessonId: string) => `aq-academy-video-${lessonId}`;
const SPEED_KEY = "aq-academy-speed";

interface StoredPosition {
  si: number;
  t: number;
  ts: number;
}

function readPosition(lessonId: string): StoredPosition | null {
  try {
    const raw = localStorage.getItem(POS_KEY(lessonId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPosition;
    if (typeof parsed.si !== "number" || typeof parsed.t !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function LessonVideo({
  lessonId,
  videoId,
  segments,
  checkpoints,
  initialSourceSeconds = null,
  sourceUrl,
}: {
  lessonId: string;
  videoId: string;
  segments: PlayerSegment[];
  checkpoints: Checkpoint[];
  initialSourceSeconds?: number | null;
  sourceUrl: string;
}) {
  const timings = useMemo<SegmentTiming[]>(() => segmentTimings(segments), [segments]);
  const total = useMemo(() => totalLessonSeconds(timings), [timings]);

  const { checkpointResults, recordCheckpoint } = useLessonProgress();
  const resultsRef = useRef(checkpointResults);
  resultsRef.current = checkpointResults;

  const sortedCheckpoints = useMemo(
    () => [...checkpoints].sort((a, b) => a.timestampSeconds - b.timestampSeconds),
    [checkpoints],
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const advancingRef = useRef(false);
  const segIndexRef = useRef(0);
  const speedRef = useRef(1);
  const dragRef = useRef(false);
  const lastSaveRef = useRef(0);
  const pendingStartRef = useRef<{ si: number; offset: number } | null>(null);

  const [phase, setPhase] = useState<"poster" | "loading" | "ready" | "error">("poster");
  const [playing, setPlaying] = useState(false);
  const [localNow, setLocalNow] = useState(0);
  const [segIndex, setSegIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [activeCpId, setActiveCpId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [resumeLocal, setResumeLocal] = useState<number | null>(null);
  const activeCpIdRef = useRef<string | null>(null);
  activeCpIdRef.current = activeCpId;

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(SPEED_KEY));
      if (SPEEDS.includes(saved)) {
        setSpeed(saved);
        speedRef.current = saved;
      }
    } catch {}
    // Where should playback position itself? Tutor links (?t=) jump straight
    // to the referenced source moment; otherwise a stored position offers a
    // Resume / Start over choice.
    if (initialSourceSeconds != null && initialSourceSeconds > 0) {
      const local = sourceToLocal(timings, initialSourceSeconds);
      const m = localToSource(timings, local ?? 0);
      if (m) pendingStartRef.current = { si: timings.indexOf(m.timing), offset: m.sourceSeconds - m.timing.startSeconds };
      if (local != null && local > 5) setResumeLocal(local);
    } else {
      const stored = readPosition(lessonId);
      if (stored) {
        const timing = timings[stored.si];
        if (timing) {
          const offset = Math.max(0, Math.min(stored.t - timing.startSeconds, timing.localDuration - 2));
          if (offset > 20) {
            setResumeLocal(timing.localStart + offset);
            pendingStartRef.current = { si: stored.si, offset };
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistPosition = useCallback(
    (si: number, sourceSeconds: number) => {
      try {
        localStorage.setItem(
          POS_KEY(lessonId),
          JSON.stringify({ si, t: Math.round(sourceSeconds), ts: Date.now() } satisfies StoredPosition),
        );
      } catch {}
    },
    [lessonId],
  );

  const loadSegment = useCallback(
    (index: number, offsetSeconds = 0) => {
      const player = playerRef.current;
      const timing = timings[index];
      if (!player || !timing) return;
      player.loadVideoById({
        videoId,
        startSeconds: timing.startSeconds + offsetSeconds,
        endSeconds: timing.endSeconds,
      });
      player.setPlaybackRate(speedRef.current);
      segIndexRef.current = index;
      setSegIndex(index);
      setLocalNow(timing.localStart + offsetSeconds);
      setFinished(false);
      persistPosition(index, timing.startSeconds + offsetSeconds);
    },
    [timings, videoId, persistPosition],
  );

  const handleSegmentEnded = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    const next = segIndexRef.current + 1;
    if (next < timings.length) {
      window.setTimeout(() => {
        loadSegment(next);
        window.setTimeout(() => {
          advancingRef.current = false;
        }, 900);
      }, 250);
    } else {
      setPlaying(false);
      setFinished(true);
      advancingRef.current = false;
    }
  }, [loadSegment, timings.length]);

  const fireCheckpoint = useCallback((cp: Checkpoint) => {
    firedRef.current.add(cp.id);
    playerRef.current?.pauseVideo();
    setActiveCpId(cp.id);
  }, []);

  // Poll: map source time -> lesson time, drive checkpoints + segment ends.
  useEffect(() => {
    if (phase !== "ready") return;
    pollRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || advancingRef.current || dragRef.current) return;
      let sourceNow: number;
      try {
        sourceNow = player.getCurrentTime();
      } catch {
        return;
      }
      if (!Number.isFinite(sourceNow)) return;

      // Which segment are we actually in (seeking may cross boundaries)?
      const containing = timings.find(
        (t) => sourceNow >= t.startSeconds && sourceNow < t.endSeconds,
      );
      if (containing) {
        const idx = timings.indexOf(containing);
        if (idx !== segIndexRef.current) {
          segIndexRef.current = idx;
          setSegIndex(idx);
        }
        const local = containing.localStart + (sourceNow - containing.startSeconds);
        setLocalNow(local);

        if (activeCpIdRef.current == null) {
          const cp = sortedCheckpoints.find(
            (c) =>
              !firedRef.current.has(c.id) &&
              !resultsRef.current[c.id]?.answered &&
              local >= c.timestampSeconds - 0.5 &&
              local < c.timestampSeconds + 8,
          );
          if (cp) fireCheckpoint(cp);
        }

        if (Date.now() - lastSaveRef.current > 2500) {
          lastSaveRef.current = Date.now();
          persistPosition(timings.indexOf(containing), sourceNow);
        }
      }
      // Segment end detection (also fires via the player's ENDED state).
      const current = timings[segIndexRef.current];
      if (current && sourceNow >= current.endSeconds - 0.35) {
        handleSegmentEnded();
      }
    }, 250);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [phase, timings, sortedCheckpoints, fireCheckpoint, handleSegmentEnded, persistPosition]);

  // Unmount cleanup: stop polling + free the underlying player.
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      try {
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
    };
  }, []);

  const beginPlayback = useCallback(
    (from?: { si: number; offset: number } | null) => {
      if (phase !== "poster") return;
      setPhase("loading");
      const startAt = from ?? pendingStartRef.current ?? { si: 0, offset: 0 };
      loadYouTubeApi()
        .then((YT) => {
          const timing = timings[startAt.si] ?? timings[0]!;
          const mount = stageRef.current;
          if (!mount) throw new Error("stage missing");
          const host = document.createElement("div");
          mount.appendChild(host);
          const player = new YT.Player(host, {
            videoId,
            playerVars: {
              controls: 0,
              rel: 0,
              playsinline: 1,
              start: timing.startSeconds + startAt.offset,
              end: timing.endSeconds,
              origin: window.location.origin,
            },
            events: {
              onReady: (event) => {
                playerRef.current = event.target;
                segIndexRef.current = timings.indexOf(timing);
                setSegIndex(timings.indexOf(timing));
                event.target.setPlaybackRate(speedRef.current);
                event.target.playVideo();
                setPhase("ready");
                lastSaveRef.current = Date.now();
              },
              onStateChange: (event) => {
                const YT_PS = window.YT?.PlayerState;
                if (!YT_PS) return;
                if (event.data === YT_PS.ENDED) handleSegmentEnded();
                else if (event.data === YT_PS.PLAYING) setPlaying(true);
                else if (event.data === YT_PS.PAUSED) setPlaying(false);
              },
              onError: () => setPhase("error"),
            },
          });
        })
        .catch(() => setPhase("error"));
    },
    [phase, timings, videoId, handleSegmentEnded],
  );

  const seekLocal = useCallback(
    (local: number) => {
      const player = playerRef.current;
      if (!player) return;
      const m = localToSource(timings, Math.max(0, Math.min(local, total - 0.5)));
      if (!m) return;
      const idx = timings.indexOf(m.timing);
      if (idx !== segIndexRef.current) {
        loadSegment(idx, m.sourceSeconds - m.timing.startSeconds);
      } else {
        player.seekTo(m.sourceSeconds, true);
        setLocalNow(m.timing.localStart + (m.sourceSeconds - m.timing.startSeconds));
      }
      setFinished(false);
    },
    [timings, total, loadSegment],
  );

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (finished) {
      loadSegment(0);
      return;
    }
    if (playing) player.pauseVideo();
    else player.playVideo();
  }, [playing, finished, loadSegment]);

  const changeSpeed = useCallback((rate: number) => {
    speedRef.current = rate;
    setSpeed(rate);
    playerRef.current?.setPlaybackRate(rate);
    try {
      localStorage.setItem(SPEED_KEY, String(rate));
    } catch {}
    setSpeedMenuOpen(false);
  }, []);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (muted) {
      player.unMute();
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  }, [muted]);

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  const activeCp = activeCpId ? checkpoints.find((c) => c.id === activeCpId) ?? null : null;
  const currentTiming = timings[segIndex] ?? timings[0];
  const currentSegment = segments[segIndex] ?? segments[0];

  function closeCheckpoint(resume: boolean) {
    setActiveCpId(null);
    if (resume && !finished) playerRef.current?.playVideo();
  }

  function onWrapperKey(e: React.KeyboardEvent) {
    if (activeCp || phase !== "ready") return;
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "j":
        seekLocal(localNow - 10);
        break;
      case "l":
        seekLocal(localNow + 10);
        break;
      case "ArrowLeft":
        e.preventDefault();
        seekLocal(localNow - 5);
        break;
      case "ArrowRight":
        e.preventDefault();
        seekLocal(localNow + 5);
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullscreen();
        break;
    }
  }

  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      ref={wrapperRef}
      onKeyDown={onWrapperKey}
      tabIndex={0}
      aria-label="Lesson video player"
      data-video-id={videoId}
      data-segment-count={segments.length}
      data-current-start={currentTiming?.startSeconds}
      data-current-end={currentTiming?.endSeconds}
      data-lesson-seconds={total}
      className="overflow-hidden rounded-xl border border-void-700/70 bg-void-900 shadow-card focus-ring"
    >
      {/* ── 16:9 stage ── */}
      <div className="relative aspect-video w-full bg-void-950">
        {/* Underlying player mounts here after the student presses play */}
        <div
          ref={stageRef}
          aria-hidden={phase !== "ready"}
          className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full"
        />

        {phase === "poster" && (
          <button
            type="button"
            onClick={() => beginPlayback()}
            aria-label="Play the lesson video segments"
            className="group absolute inset-0 focus-ring"
          >
            <span
              role="img"
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${thumb})` }}
            />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-void-950/85 via-void-950/15 to-void-950/25" />
            <span className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 text-left">
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-white/70">
                  Lesson video
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-white">
                  {segments.length} segment{segments.length === 1 ? "" : "s"} · {formatDuration(total)}
                </span>
              </span>
              {resumeLocal != null && (
                <span className="shrink-0 rounded-md bg-white/15 px-2 py-1 font-mono text-[11px] font-semibold text-white backdrop-blur-sm">
                  Resume at {formatClock(resumeLocal)}
                </span>
              )}
            </span>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pulse-600 text-2xl text-white shadow-pop transition-transform duration-150 group-hover:scale-105"
            >
              ▶
            </span>
          </button>
        )}

        {phase === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center" role="status">
            <span className="flex items-center gap-2 text-sm text-white/70">
              <Icon name="brain" size={16} /> Loading the lesson player…
            </span>
          </div>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
            <p className="text-sm text-white/80">
              The lesson player could not start right now. The lesson below is fully usable without it.
            </p>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-void-700 bg-void-900 px-4 py-2 text-xs font-semibold text-pulse-700 focus-ring dark:text-pulse-300"
            >
              Watch this segment on YouTube
            </a>
          </div>
        )}

        {finished && phase === "ready" && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-void-950/90 to-transparent p-4">
            <p className="text-sm font-semibold text-white">Lesson video complete</p>
            <button
              type="button"
              onClick={() => loadSegment(0)}
              className="rounded-lg bg-pulse-600 px-3 py-1.5 text-xs font-semibold text-white focus-ring"
            >
              Replay segments
            </button>
          </div>
        )}

        {/* ── Checkpoint overlay: pauses playback, requires interaction ── */}
        {activeCp && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-void-950/80 p-4 backdrop-blur-[2px]">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Checkpoint: ${activeCp.concept}`}
              className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl border border-volt-400/40 bg-void-900 p-5 shadow-pop"
            >
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-volt-700 dark:text-volt-300">
                <Icon name="brain" size={14} aria-hidden="true" /> Checkpoint — pause and think
              </p>
              <div className="mt-3">
                <CheckpointQuestion
                  key={activeCp.id}
                  checkpoint={activeCp}
                  onAnswered={(correct) => recordCheckpoint(activeCp.id, correct)}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-void-700/60 pt-4">
                {checkpointResults[activeCp.id]?.answered && (
                  <button
                    type="button"
                    onClick={() => closeCheckpoint(true)}
                    className="rounded-lg bg-pulse-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
                  >
                    Continue video
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => closeCheckpoint(true)}
                  className="rounded-lg border border-void-700 bg-void-850 px-4 py-2 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
                >
                  {checkpointResults[activeCp.id]?.answered ? "Close" : "Review later"}
                </button>
                {!checkpointResults[activeCp.id]?.answered && (
                  <span className="text-xs text-ink-faint">Answer now, or come back to the card below.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Cognia control shell ── */}
      <div className="border-t border-void-700/60 bg-void-900 px-4 py-3">
        {/* Lesson-local timeline (never the source video duration) */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={Math.max(1, total - 1)}
            step={1}
            value={Math.min(Math.round(localNow), Math.max(0, total - 1))}
            aria-label="Lesson timeline"
            disabled={phase !== "ready"}
            onChange={(e) => {
              dragRef.current = true;
              setLocalNow(Number(e.target.value));
            }}
            onPointerUp={(e) => {
              seekLocal(Number((e.target as HTMLInputElement).value));
              dragRef.current = false;
            }}
            onKeyUp={(e) => {
              seekLocal(Number((e.target as HTMLInputElement).value));
              dragRef.current = false;
            }}
            className="w-full accent-pulse-600"
          />
          {/* Checkpoint markers on the timeline */}
          <div aria-hidden={true} className="pointer-events-none absolute inset-x-0 top-1.5 h-2">
            {sortedCheckpoints.map((cp) => (
              <span
                key={cp.id}
                className={`absolute h-2 w-2 -translate-x-1/2 rounded-full ${
                  checkpointResults[cp.id]?.answered ? "bg-mint-400" : "bg-volt-400"
                }`}
                style={{ left: `${(cp.timestampSeconds / Math.max(1, total)) * 100}%` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={togglePlay}
            disabled={phase !== "ready"}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-pulse-600 text-sm font-bold text-white transition-colors hover:bg-pulse-700 focus-ring disabled:opacity-40"
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            onClick={() => seekLocal(localNow - 10)}
            disabled={phase !== "ready"}
            aria-label="Back 10 seconds"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-700 bg-void-850 font-mono text-[11px] font-bold text-ink-dim transition-colors hover:text-ink focus-ring disabled:opacity-40"
          >
            10s◀
          </button>
          <button
            type="button"
            onClick={() => seekLocal(localNow + 10)}
            disabled={phase !== "ready"}
            aria-label="Forward 10 seconds"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-700 bg-void-850 font-mono text-[11px] font-bold text-ink-dim transition-colors hover:text-ink focus-ring disabled:opacity-40"
          >
            ▶10s
          </button>
          <button
            type="button"
            onClick={() => loadSegment(segIndex - 1)}
            disabled={phase !== "ready" || segIndex === 0}
            aria-label="Previous segment"
            className="flex h-9 items-center rounded-lg border border-void-700 bg-void-850 px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:text-ink focus-ring disabled:opacity-40"
          >
            ◀◀ Seg
          </button>
          <button
            type="button"
            onClick={() => loadSegment(segIndex + 1)}
            disabled={phase !== "ready" || segIndex >= timings.length - 1}
            aria-label="Next segment"
            className="flex h-9 items-center rounded-lg border border-void-700 bg-void-850 px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:text-ink focus-ring disabled:opacity-40"
          >
            Seg ▶▶
          </button>

          {/* Speed */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSpeedMenuOpen((v) => !v)}
              disabled={phase !== "ready"}
              aria-label={`Playback speed ${speed} times`}
              aria-expanded={speedMenuOpen}
              className="flex h-9 items-center rounded-lg border border-void-700 bg-void-850 px-2.5 font-mono text-xs font-bold text-ink-dim transition-colors hover:text-ink focus-ring disabled:opacity-40"
            >
              {speed}×
            </button>
            {speedMenuOpen && (
              <div className="absolute bottom-11 left-0 z-30 w-24 overflow-hidden rounded-lg border border-void-700 bg-void-900 shadow-pop" role="menu" aria-label="Playback speed">
                {SPEEDS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="menuitemradio"
                    aria-checked={r === speed}
                    onClick={() => changeSpeed(r)}
                    className={`block w-full px-3 py-1.5 text-left font-mono text-xs focus-ring ${
                      r === speed ? "bg-pulse-400/15 text-pulse-700 dark:text-pulse-300" : "text-ink-dim hover:bg-void-800"
                    }`}
                  >
                    {r}×
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleMute}
            disabled={phase !== "ready"}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-700 bg-void-850 text-xs font-bold text-ink-dim transition-colors hover:text-ink focus-ring disabled:opacity-40"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-700 bg-void-850 text-xs font-bold text-ink-dim transition-colors hover:text-ink focus-ring"
          >
            ⛶
          </button>
        </div>

        {/* Segment identity + lesson clock */}
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="min-w-0 truncate text-xs font-semibold text-ink" data-segment-label>
            {segments.length > 1 ? `Segment ${segIndex + 1} of ${segments.length} — ` : ""}
            {currentSegment?.label}
            <span className="ml-2 font-mono text-[11px] font-normal text-ink-faint">
              {currentTiming ? formatSegment(currentTiming.startSeconds, currentTiming.endSeconds) : ""}
            </span>
          </p>
          <p className="font-mono text-[11px] text-ink-faint" aria-live="off">
            {formatClock(localNow)} / {formatClock(total)}
          </p>
        </div>
        <p className="mt-1 text-[11px] text-ink-faint">
          Lesson video · {formatDuration(total)} of the source · keyboard: space play/pause, j/l ±10s, m mute, f fullscreen
        </p>
      </div>
    </div>
  );
}
