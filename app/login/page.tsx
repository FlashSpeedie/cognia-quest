"use client";

import { useState, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
      setError("We couldn't reach the server right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Continue your AI learning journey.">
      <Suspense fallback={null}>
        <MessageBanner />
      </Suspense>
      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        <Input label="Email" name="email" type="email" autoComplete="email" required placeholder="you@school.edu" />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs font-medium text-ink-dim hover:text-pulse-600 focus-ring rounded">
            Forgot password?
          </Link>
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-700/50 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Log in
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-ink-dim">
        New here?{" "}
        <Link href="/register" className="font-semibold text-pulse-600 hover:underline focus-ring rounded">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

function MessageBanner() {
  const message = useSearchParams().get("message");
  if (!message) return null;
  return (
    <p role="status" className="mb-4 rounded-lg border border-mint-200 bg-mint-50 px-3 py-2.5 text-sm text-mint-700 dark:border-mint-700/50 dark:bg-mint-950/40 dark:text-mint-300">
      {message}
    </p>
  );
}
