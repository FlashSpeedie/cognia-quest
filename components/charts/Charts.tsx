import type { ReactNode } from "react";

/** Accessible SVG charts: every chart ships a text table fallback. */

export function XPSpark({ points, label = "XP earned per day" }: { points: { day: string; xp: number }[]; label?: string }) {
  const w = 560;
  const h = 120;
  const pad = 8;
  const max = Math.max(10, ...points.map((p) => p.xp));
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => [pad + i * step, h - pad - (p.xp / max) * (h - pad * 2)] as const);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${(pad + (points.length - 1) * step).toFixed(1)},${h - pad} L${pad},${h - pad} Z`;

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`${label}: total ${points.reduce((s, p) => s + p.xp, 0)} XP over ${points.length} days`}>
        <defs>
          <linearGradient id="xpfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {points.length > 0 ? (
          <>
            <path d={area} fill="url(#xpfill)" />
            <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
            {coords.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3" fill="#0b1020" stroke="#38bdf8" strokeWidth="1.6" />
            ))}
          </>
        ) : (
          <text x="50%" y="50%" textAnchor="middle" fill="#5d6a86" fontSize="13">No activity yet - your first lesson will draw this line.</text>
        )}
      </svg>
      <figcaption className="sr-only">
        {label}: {points.map((p) => `${p.day}: ${p.xp} XP`).join(", ") || "no data yet"}
      </figcaption>
    </figure>
  );
}

export function SkillsRadar({ skills }: { skills: { label: string; value: number }[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 34;
  const n = skills.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r] as const;

  const rings = [0.33, 0.66, 1];
  const poly = skills.map((s, i) => pt(i, (Math.max(3, s.value) / 100) * R).join(",")).join(" ");

  return (
    <figure>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[280px]" role="img" aria-label={`Skills profile: ${skills.map((s) => `${s.label} ${s.value}%`).join(", ")}`}>
        {rings.map((r) => (
          <polygon key={r} points={skills.map((_, i) => pt(i, r * R).join(",")).join(" ")} fill="none" stroke="#182036" strokeWidth="1" />
        ))}
        {skills.map((_, i) => (
          <line key={i} x1={cx} y1={cy} x2={pt(i, R)[0]} y2={pt(i, R)[1]} stroke="#182036" strokeWidth="1" />
        ))}
        <polygon points={poly} fill="rgba(56,189,248,0.22)" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" />
        {skills.map((s, i) => {
          const [x, y] = pt(i, (s.value / 100) * R);
          const [lx, ly] = pt(i, R + 20);
          return (
            <g key={s.label}>
              <circle cx={x} cy={y} r="3" fill="#38bdf8" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#9aa7c2" fontSize="9.5" fontFamily="ui-monospace, monospace">
                {s.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">Skills radar - learning indicators, not formal assessments.</figcaption>
    </figure>
  );
}

export function BarRow({ label, value, right, tone = "pulse" }: { label: string; value: number; right?: ReactNode; tone?: "pulse" | "mint" | "volt" | "amber" }) {
  const tones = { pulse: "from-pulse-500 to-volt-500", mint: "from-mint-500 to-pulse-500", volt: "from-volt-500 to-rose-500", amber: "from-amber-500 to-rose-500" };
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-ink-dim">{label}</span>
        <span className="font-mono text-ink">{right ?? `${value}%`}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-void-700" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full bg-gradient-to-r ${tones[tone]} transition-[width] duration-700`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
