import type { ReactNode } from "react";
import { GlassCard } from "./Card";

export function EmptyState({
  icon = "○",
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <GlassCard className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-pulse-400/20 bg-pulse-400/5 text-2xl text-pulse-400">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-dim">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </GlassCard>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function LoadingPanel({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 p-2">
      <SkeletonBlock className="h-6 w-1/3" />
      <SkeletonBlock className="h-24 w-full" />
      <SkeletonBlock className="h-24 w-full" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
