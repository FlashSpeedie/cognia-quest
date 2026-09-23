import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/public/BrandLogo";

export function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <main id="main" className="app-backdrop flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="Cognia Quest home" className="mb-8 flex justify-center focus-ring rounded-lg">
          <BrandLogo />
        </Link>
        <div className="glass-panel rounded-2xl p-7 shadow-lift sm:p-9">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 mb-7 text-sm leading-relaxed text-ink-dim">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
