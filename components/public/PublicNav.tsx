"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-8 w-8 text-base" : "h-9 w-9 text-lg";
  return (
    <span className="flex items-center gap-2">
      <span className={`flex ${s} items-center justify-center rounded-xl bg-gradient-to-br from-pulse-500 to-volt-500 font-display font-black text-white shadow-glow`}>
        Q
      </span>
      <span className="font-display text-lg font-bold tracking-wide text-ink">AI&nbsp;QUEST</span>
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
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? "border-b border-void-700/60 bg-void-950/85 backdrop-blur-md" : ""
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Public">
        <Link href="/" aria-label="AI Quest home" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-ink-dim md:flex">
          <Link href="/about" className="transition-colors hover:text-ink focus-ring rounded">
            How it works
          </Link>
          <Link href="/preview" className="transition-colors hover:text-ink focus-ring rounded">
            Preview
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {demoEnabled && (
            <Button variant="ghost" size="sm" onClick={tryDemo} loading={demoLoading}>
              Try demo
            </Button>
          )}
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-pulse-500 to-volt-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 focus-ring"
          >
            Start
          </Link>
        </div>
      </nav>
    </header>
  );
}
