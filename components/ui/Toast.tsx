"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ToastKind = "xp" | "badge" | "success" | "error" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
}

const ToastContext = createContext<{ push: (t: Omit<ToastItem, "id">) => void }>({ push: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const kindStyles: Record<ToastKind, { border: string; icon: string; iconBg: string }> = {
  xp: { border: "border-amber-200", icon: "⚡", iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  badge: { border: "border-volt-200", icon: "🏅", iconBg: "bg-volt-200 text-volt-700 dark:bg-volt-950 dark:text-volt-300" },
  success: { border: "border-mint-200", icon: "✓", iconBg: "bg-mint-200 text-mint-700 dark:bg-mint-950 dark:text-mint-300" },
  error: { border: "border-rose-200", icon: "!", iconBg: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
  info: { border: "border-pulse-200", icon: "ℹ", iconBg: "bg-pulse-100 text-pulse-700 dark:bg-pulse-950 dark:text-pulse-300" },
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = nextId++;
      setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,22rem)] flex-col gap-2">
        {toasts.map((t) => {
          const s = kindStyles[t.kind];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto animate-fade-up rounded-xl border ${s.border} bg-void-900 p-3.5 shadow-pop`}
            >
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${s.iconBg}`}>
                  {s.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">{t.title}</p>
                  {t.body && <p className="mt-0.5 text-xs text-ink-dim">{t.body}</p>}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="text-ink-faint transition-colors hover:text-ink focus-ring rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
