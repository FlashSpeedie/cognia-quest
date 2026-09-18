"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGeneral(null);
    const fd = new FormData(e.currentTarget);
    const displayName = String(fd.get("displayName") ?? "");
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");

    const local: Record<string, string> = {};
    if (displayName.trim().length < 2) local.displayName = "At least 2 characters";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) local.email = "Enter a valid email";
    if (password.length < 8) local.password = "At least 8 characters";
    if (confirm !== password) local.confirm = "Passwords don't match";
    if (Object.keys(local).length > 0) {
      setErrors(local);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName: displayName.trim(), password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setGeneral(data.error ?? "Registration failed");
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setGeneral("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Become an AI Apprentice" subtitle="Create your account. No personal data beyond an email — we keep it minimal.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Display name" name="displayName" autoComplete="username" required placeholder="e.g. Alex" error={errors.displayName} hint="Shown on your profile. Nicknames welcome." />
        <Input label="Email" name="email" type="email" autoComplete="email" required placeholder="you@school.edu" error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="new-password" required placeholder="8+ characters" error={errors.password} />
        <Input label="Confirm password" name="confirm" type="password" autoComplete="new-password" required placeholder="Repeat it" error={errors.confirm} />
        {general && (
          <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {general}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-dim">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-pulse-300 hover:underline focus-ring rounded">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
