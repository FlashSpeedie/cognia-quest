import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-void-700 bg-void-800/80 shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCard({
  className = "",
  children,
  glow = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; glow?: boolean }) {
  return (
    <div
      className={`glass-panel rounded-2xl ${glow ? "shadow-glow" : "shadow-card"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  description,
  className = "",
}: {
  kicker?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <header className={className}>
      {kicker && (
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pulse-400">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-ink-dim">{description}</p>}
    </header>
  );
}
