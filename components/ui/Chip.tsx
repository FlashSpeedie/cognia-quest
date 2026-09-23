import type { ReactNode } from "react";

export type ChipTone = "pulse" | "volt" | "mint" | "amber" | "rose" | "neutral";

// Tinted light backgrounds, mid-tone text - readable on white and on dark.
const tones: Record<ChipTone, string> = {
  pulse: "border-pulse-200 bg-pulse-50 text-pulse-700 dark:border-pulse-700/50 dark:bg-pulse-950/50 dark:text-pulse-700 dark:text-pulse-300",
  volt: "border-volt-200 bg-volt-50 text-volt-700 dark:border-volt-600/50 dark:bg-volt-600/10 dark:text-volt-700 dark:text-volt-300",
  mint: "border-mint-200 bg-mint-50 text-mint-700 dark:border-mint-600/50 dark:bg-mint-600/10 dark:text-mint-700 dark:text-mint-300",
  amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-600/50 dark:bg-amber-500/10 dark:text-amber-600 dark:text-amber-300",
  rose: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-600/50 dark:bg-rose-500/10 dark:text-rose-700 dark:text-rose-300",
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
