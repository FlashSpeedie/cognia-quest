import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <main id="main" className="app-backdrop flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 focus-ring rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pulse-500 to-volt-500 font-display text-lg font-black text-white">
            Q
          </span>
          <span className="font-display text-xl font-bold tracking-wide text-ink">AI QUEST</span>
        </Link>
        <div className="glass-panel rounded-3xl p-8 shadow-card">
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-ink-dim">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
