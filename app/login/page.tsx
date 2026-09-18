"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      const data = (await res.json()) as { error?: string; onboard?: boolean };
      if (!res.ok) {
        setError(data.error ?? "Login failed");
      } else {
        router.push(data.onboard ? "/onboarding" : "/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back, Apprentice" subtitle="Log in to continue your AI Quest.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        <Input label="Email" name="email" type="email" autoComplete="email" required placeholder="you@school.edu" />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
        {error && (
          <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-dim">
        New here?{" "}
        <Link href="/register" className="font-semibold text-pulse-300 hover:underline focus-ring rounded">
          Start your quest
        </Link>
      </p>
    </AuthShell>
  );
}
