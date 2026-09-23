"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/Button";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-8 w-8 text-sm" : "h-9 w-9 text-base";
  return (
    <span className="flex items-center gap-2.5">
      <span className={`flex ${s} items-center justify-center rounded-lg bg-pulse-600 font-display font-bold text-white`}>
        Q
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-ink">AI&nbsp;QUEST</span>
    </span>
  );
}

export function PublicNav({ demoEnabled = false }: { demoEnabled?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function tryDemo() {
    setDemoLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${
        scrolled ? "border-b border-void-700/70 bg-void-900/95 dark:bg-void-900/90" : ""
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Public">
        <Link href="/" aria-label="AI Quest home" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-ink-dim md:flex">
          <Link href="/about" className="transition-colors hover:text-ink focus-ring rounded px-1 py-2">
            How it works
          </Link>
          <Link href="/preview" className="transition-colors hover:text-ink focus-ring rounded px-1 py-2">
            Preview
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {demoEnabled && (
            <Button variant="ghost" size="sm" onClick={tryDemo} loading={demoLoading}>
              Try demo
            </Button>
          )}
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring">
            Log in
          </Link>
          <LinkButton href="/register" size="sm">
            Start learning
          </LinkButton>
        </div>
      </nav>
    </header>
  );
}
