/**
 * Hero visual: a clean, product-like snapshot of the learning experience -
 * progress ring, lesson cards, mission steps - in place of a sci-fi map.
 * Decorative (aria-hidden).
 */
export function HeroNetwork() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col gap-4 p-2">
      {/* Top row: progress ring + level summary */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-5 rounded-xl border border-void-700/70 bg-void-850 p-5">
        <svg width="92" height="92" viewBox="0 0 92 92" role="presentation">
          <circle cx="46" cy="46" r="38" fill="none" stroke="var(--void-700)" strokeWidth="9" />
          <circle
            cx="46"
            cy="46"
            r="38"
            fill="none"
            stroke="#0284c7"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="238.8"
            strokeDashoffset="90.7"
            transform="rotate(-90 46 46)"
          />
          <text x="46" y="50" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">
            62%
          </text>
        </svg>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pulse-600">Course progress</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">Level 6 - Critical Thinker</p>
          <p className="mt-1 text-sm text-ink-dim">1,540 XP · 4 of 7 mission sets underway</p>
        </div>
      </div>

      {/* Lesson cards */}
      <div className="rounded-xl border border-void-700/70 bg-void-850 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Continue learning</p>
        <div className="mt-3 space-y-2.5">
          {[
            { k: "Fundamentals", t: "What Is a Model?", m: "8 min", done: true },
            { k: "Machine Learning", t: "Data, Features, Labels", m: "10 min", done: false, active: true },
            { k: "Generative AI", t: "Tokens & Context Windows", m: "9 min", done: false },
          ].map((l) => (
            <div
              key={l.t}
              className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 ${
                l.active
                  ? "border-pulse-500/50 bg-pulse-50 text-ink dark:bg-pulse-950/40"
                  : "border-void-700/70 bg-void-900 text-ink"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                  l.done
                    ? "border-mint-600 bg-mint-600 text-white"
                    : l.active
                      ? "border-pulse-600 text-pulse-700"
                      : "border-void-700 text-ink-faint"
                }`}
              >
                {l.done ? "✓" : ""}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{l.k}</p>
                <p className="truncate text-sm font-semibold text-ink">{l.t}</p>
              </div>
              <span className="text-xs text-ink-faint">{l.m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mission roadmap strip */}
      <div className="rounded-xl border border-void-700/70 bg-void-850 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Mission roadmap</p>
        <div className="mt-3 flex items-center gap-1.5">
          {["Fund.", "ML", "Gen AI", "Prompting", "Ethics", "Detective", "Final"].map((m, i) => (
            <div key={m} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${
                  i <= 2
                    ? "border-pulse-600 bg-pulse-600 text-white"
                    : "border-void-700 bg-void-900 text-ink-faint"
                }`}
              >
                {i + 1}
              </span>
              <span className="text-[10px] font-medium text-ink-dim">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
