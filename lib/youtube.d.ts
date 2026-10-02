/**
 * Minimal typings for the official YouTube IFrame Player API, loaded
 * on demand from https://www.youtube.com/iframe_api. Only the surface
 * this project uses is declared.
 */

export interface YTPlayerVars {
  controls?: 0 | 1;
  rel?: 0 | 1;
  modestbranding?: 0 | 1;
  playsinline?: 0 | 1;
  start?: number;
  end?: number;
  origin?: string;
  disablekb?: 0 | 1;
  cc_load_policy?: 0 | 1;
  iv_load_policy?: 1 | 3;
}

export interface YTPlayerOptions {
  videoId?: string;
  width?: number | string;
  height?: number | string;
  playerVars?: YTPlayerVars;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { data: number; target: YTPlayer }) => void;
    onError?: (event: { data: number }) => void;
  };
}

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  loadVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  cueVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  destroy(): void;
  getIframe(): HTMLIFrameElement;
}

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement | string, options: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};
