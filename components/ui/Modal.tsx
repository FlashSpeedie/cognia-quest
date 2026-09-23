"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Focus the dialog for keyboard & screen reader users
    const t = setTimeout(() => ref.current?.focus(), 20);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/80 p-4 backdrop-blur-sm animate-fade-up"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`glass-panel w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[85vh] overflow-y-auto rounded-xl p-6 shadow-pop outline-none`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
