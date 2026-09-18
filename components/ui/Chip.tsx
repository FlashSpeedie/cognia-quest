import type { ReactNode } from "react";

export type ChipTone = "pulse" | "volt" | "mint" | "amber" | "rose" | "neutral";

const tones: Record<ChipTone, string> = {
  pulse: "border-pulse-400/40 bg-pulse-400/10 text-pulse-300",
  volt: "border-volt-400/40 bg-volt-400/10 text-volt-300",
  mint: "border-mint-400/40 bg-mint-400/10 text-mint-300",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  rose: "border-rose-400/40 bg-rose-400/10 text-rose-400",
  neutral: "border-void-700 bg-void-800 text-ink-dim",
};

export function Chip({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
