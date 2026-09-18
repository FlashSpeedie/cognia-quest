import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-backdrop flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel max-w-md rounded-2xl p-8 text-center">
        <p className="font-mono text-6xl font-black text-pulse-400">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Unmapped territory</h1>
        <p className="mt-2 text-sm text-ink-dim">
          This coordinate isn&apos;t on the quest map. Even the AI Detective couldn&apos;t find it.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-gradient-to-r from-pulse-500 to-volt-500 px-5 py-2.5 text-sm font-bold text-white focus-ring">
            Home
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-void-700 px-5 py-2.5 text-sm font-semibold text-ink-dim focus-ring">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
