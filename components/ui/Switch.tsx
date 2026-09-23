"use client";

/**
 * One shared switch, one state convention:
 *  - OFF: thumb left, neutral track
 *  - ON: thumb right, accent track
 * Uses a real <button role="switch"> so keyboard (Tab/Space/Enter) and
 * screen readers get native behavior; `checked` is the only state source.
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
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-ring disabled:opacity-50 ${
          checked
            ? "border-pulse-600 bg-pulse-600"
            : "border-void-700 bg-void-700 hover:border-ink-faint"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 h-[1.125rem] w-[1.125rem] rounded-full bg-white shadow-card transition-transform duration-150 ${
            checked ? "translate-x-[1.35rem]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
