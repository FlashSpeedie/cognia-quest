"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // server logs capture detail; the client gets a safe message
    console.error("[ai-quest] render error:", error?.digest ?? error?.message);
  }, [error]);

  return (
    <div className="app-backdrop flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel max-w-md rounded-2xl p-8 text-center">
        <span className="text-4xl" aria-hidden="true">🛠️</span>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-dim">
          A subsystem hiccupped. Your progress is safe - it lives on the server, not in this page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <LinkButton href="/dashboard" variant="ghost">Go to dashboard</LinkButton>
        </div>
        {error?.digest && <p className="mt-4 font-mono text-[10px] text-ink-faint">ref: {error.digest}</p>}
      </div>
    </div>
  );
}
