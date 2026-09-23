import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-xl border border-void-700/70 bg-void-900 shadow-card ${className}`}
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
      className={`glass-panel rounded-xl ${glow ? "shadow-lift" : ""} ${className}`}
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
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pulse-600">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">{title}</h2>
      {description && <p className="mt-2 max-w-2xl leading-relaxed text-ink-dim">{description}</p>}
    </header>
  );
}
