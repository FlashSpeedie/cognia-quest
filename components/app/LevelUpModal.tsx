"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { playChime } from "@/lib/sound";

export interface LevelUpDetail {
  to: string;
  level: number;
}

export function fireLevelUp(detail: LevelUpDetail) {
  window.dispatchEvent(new CustomEvent("aq:levelup", { detail }));
}

export function LevelUpModal() {
  const [info, setInfo] = useState<LevelUpDetail | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<LevelUpDetail>).detail;
      setInfo(d);
      playChime("levelup");
    };
    window.addEventListener("aq:levelup", handler);
    return () => window.removeEventListener("aq:levelup", handler);
  }, []);

  return (
    <Modal open={!!info} onClose={() => setInfo(null)} title={`Level ${info?.level ?? ""} — ${info?.to ?? ""}`}>
      <div className="text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/40 to-rose-500/40 blur-xl animate-pulse-soft" aria-hidden="true" />
          <span className="relative font-display text-5xl">⚡</span>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-amber-300">Level up</p>
        <h3 className="mt-2 font-display text-3xl font-black text-ink">
          LEVEL {info?.level}
          <br />
          <span className="text-gradient">{info?.to}</span>
        </h3>
        <p className="mt-3 text-sm text-ink-dim">
          Earned, not given. New challenges are calibrated to your new rank.
        </p>
        <button
          onClick={() => setInfo(null)}
          className="mt-6 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 px-7 py-3 font-display text-sm font-bold text-void-950 focus-ring"
        >
          Continue the quest
        </button>
      </div>
    </Modal>
  );
}
