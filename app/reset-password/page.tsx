"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Choose a new password" subtitle="At least 8 characters.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="New password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="••••••••" />
        <Input label="Confirm password" name="confirm" type="password" autoComplete="new-password" required minLength={8} placeholder="••••••••" />
        {error && (
          <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          Update password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-dim">
        <Link href="/login" className="font-semibold text-pulse-300 hover:underline focus-ring rounded">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
