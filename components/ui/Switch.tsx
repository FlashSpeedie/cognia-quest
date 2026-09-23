"use client";

/**
 * One shared switch, one state convention:
 *  - OFF: thumb left, neutral gray track
 *  - ON: thumb right, accent blue track
 * Uses a real <button role="switch"> so keyboard (Tab/Space/Enter) and
 * screen readers get native behavior; `checked` is the only state source.
 *
 * Track: 24x44px (h-6 w-11) with 1px border -> 22x42px content box.
 * Thumb: 18x18px, auto-centered vertically via items-center.
 * OFF:  translate-x-0.5  (2px from left edge of content box)
 * ON:   translate-x-[22px] (22px from left -> 2px gap on the right)
 */
export function Switch({
  label,
  hint,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = `switch-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="mt-3 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <span id={id} className="text-sm font-medium text-ink">
          {label}
        </span>
        {hint && <p className="text-xs text-ink-faint">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${
          checked
            ? "border-pulse-600 bg-pulse-600"
            : "border-slate-300 bg-slate-300 hover:border-slate-400"
        }`}
      >
        <span
          aria-hidden="true"
          className={`block h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(16,24,40,0.2)] transition-transform duration-150 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
