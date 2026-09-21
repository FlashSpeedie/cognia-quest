"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email") }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) setError(data.error ?? "Something went wrong");
      else setMessage(data.message ?? "Check your email for a reset link.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure reset link.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" name="email" type="email" autoComplete="email" required placeholder="you@school.edu" />
        {error && (
          <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-lg border border-mint-400/30 bg-mint-400/10 px-3 py-2 text-sm text-mint-300">
            {message}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-dim">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-pulse-300 hover:underline focus-ring rounded">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
