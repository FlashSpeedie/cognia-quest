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
      const data = (await res.json()) as { error?: string; confirmEmail?: boolean };
      if (!res.ok) {
        setGeneral(data.error ?? "Registration failed");
      } else if (data.confirmEmail) {
        router.push(`/login?message=${encodeURIComponent("Check your email to confirm your account, then log in.")}`);
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setGeneral("We couldn't reach the server right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Start your AI journey" subtitle="Create your account and begin learning AI through interactive challenges.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Display name" name="displayName" autoComplete="username" required placeholder="e.g. Alex" error={errors.displayName} hint="Shown on your profile. Nicknames welcome." />
        <Input label="Email" name="email" type="email" autoComplete="email" required placeholder="you@school.edu" error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="new-password" required placeholder="8+ characters" error={errors.password} />
        <Input label="Confirm password" name="confirm" type="password" autoComplete="new-password" required placeholder="Repeat it" error={errors.confirm} />
        {general && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-700/50 dark:bg-rose-950/40 dark:text-rose-300">
            {general}
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
        <p className="text-xs leading-relaxed text-ink-faint">
          We only collect the information needed to provide your account and learning experience.
        </p>
      </form>
      <p className="mt-7 text-center text-sm text-ink-dim">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-pulse-600 hover:underline focus-ring rounded">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
