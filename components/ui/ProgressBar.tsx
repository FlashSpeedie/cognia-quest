export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  tone = "pulse",
  className = "",
}: {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  tone?: "pulse" | "volt" | "mint" | "amber";
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const tones: Record<string, string> = {
    pulse: "bg-pulse-600",
    volt: "bg-volt-600",
    mint: "bg-mint-600",
    amber: "bg-amber-500",
  };
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-ink-dim">{label}</span>
        {showValue && (
          <span className="font-mono text-ink tabular-nums">
            {Math.round(pct)}%
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-void-700"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${tones[tone]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  max = 100,
  size = 72,
  stroke = 7,
  label,
  centerLabel,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label: string;
  centerLabel?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = `ring-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="relative inline-flex items-center justify-center" role="img" aria-label={`${label}: ${Math.round(pct * 100)}%`}>
      <svg width={size} height={size} aria-hidden="true" className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--void-700)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-sm font-bold tabular-nums text-ink">
        {centerLabel ?? `${Math.round(pct * 100)}%`}
      </span>
    </div>
  );
}
