"use client";

import { useId, useState, type ReactNode } from "react";

/** Educational tooltip - definition on hover/focus. */
export function Term({
  term,
  definition,
  children,
}: {
  term?: string;
  definition: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="cursor-help border-b border-dashed border-pulse-400/60 font-medium text-pulse-700 dark:text-pulse-300 focus-ring rounded-sm"
      >
        {children ?? term}
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute bottom-full left-1/2 z-40 mb-2 w-64 -translate-x-1/2 rounded-xl border border-pulse-400/25 bg-void-800 p-3 text-left text-xs leading-relaxed text-ink shadow-card"
        >
          {term && <span className="mb-1 block font-bold text-pulse-700 dark:text-pulse-300">{term}</span>}
          {definition}
        </span>
      )}
    </span>
  );
}
