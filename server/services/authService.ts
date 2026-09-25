import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { siteUrl } from "@/lib/site";
import type { Db } from "@/server/db/db";
import { getDb, newId } from "@/server/db/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { authClientForCookies } from "@/server/auth/supabase";
import { provisionProfile } from "@/server/auth/session";
import { DEFAULT_PREFERENCES, type User } from "@/lib/types";
import { audit } from "./audit";

/**
 * Auth flows. Production (Supabase configured) delegates credentials and
 * sessions to Supabase Auth; development/test uses the local scrypt store.
 * Either way the app profile (role, XP, prefs) lives server-side in the
 * `users` table and is never taken from client input or JWT claims.
 */

export const registerSchema = z.object({
  email: z.string().email().max(120).transform((s) => s.toLowerCase().trim()),
  displayName: z
    .string()
    .min(2, "At least 2 characters")
    .max(24, "At most 24 characters")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Letters, numbers, spaces, - and _ only"),
  password: z.string().min(8, "At least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(120).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1),
});

const AVATARS = ["🚀", "🛰️", "🧠", "🤖", "⚡", "🔬", "🎯", "🛡️", "💡", "🌌"];
type Result = { ok: true; user: User; confirmEmail?: true } | { ok: false; error: string };

export async function registerUser(
  db: Db,
  input: { email: string; displayName: string; password: string },
): Promise<Result> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (isSupabaseConfigured()) return registerSupabase(parsed.data);
  return registerLocal(db, parsed.data);
}

async function registerLocal(
  db: Db,
  data: { email: string; displayName: string; password: string },
): Promise<Result> {
  const existing = await db.table("users").first({ email: data.email });
  if (existing) return { ok: false, error: "An account with this email already exists" };

  const user: User = {
    id: newId(),
    email: data.email,
    displayName: data.displayName,
    passwordHash: await hashPassword(data.password),
    role: "student",
    title: "AI Rookie",
    avatarId: AVATARS[Math.floor(Math.random() * AVATARS.length)]!,
    createdAt: new Date().toISOString(),
    onboarding: { completed: false },
    preferences: DEFAULT_PREFERENCES,
    xpTotal: 0,
    isDemo: false,
  };
  await db.table("users").insert(user);
  await audit(db, user.id, "user.register", user.id);
  return { ok: true, user };
}

async function registerSupabase(data: { email: string; displayName: string; password: string }): Promise<Result> {
  const supabase = await authClientForCookies({ writable: true });
  const { data: r, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { display_name: data.displayName },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });
  if (error) {
    const msg = /already registered/i.test(error.message)
      ? "An account with this email already exists"
      : error.message;
    return { ok: false, error: msg };
  }
  if (!r.user) return { ok: false, error: "Registration failed - please try again" };

  const db = await getDb();
  // When email confirmation is ON there's no session yet; the profile is
  // provisioned on first confirmed login instead (see getSupabaseUser).
  if (r.session) {
    const user = await provisionProfile(db, r.user.id, data.email, data.displayName);
    if (user) {
      await audit(db, user.id, "user.register", user.id);
      return { ok: true, user };
    }
    return { ok: false, error: "Account created but profile setup failed - try logging in" };
  }
  // Placeholder-shaped user just so the route can respond; no session set.
  return {
    ok: true,
    confirmEmail: true,
    user: (await db.table("users").get(r.user.id)) ?? ({
      id: r.user.id,
      email: data.email,
      displayName: data.displayName,
      passwordHash: null,
      role: "student",
      title: "AI Rookie",
      avatarId: AVATARS[0]!,
      createdAt: new Date().toISOString(),
      onboarding: { completed: false },
      preferences: DEFAULT_PREFERENCES,
      xpTotal: 0,
      isDemo: false,
    } satisfies User),
  };
}

export async function loginUser(
  db: Db,
  input: { email: string; password: string },
): Promise<Result> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid credentials" };
  if (isSupabaseConfigured()) return loginSupabase(parsed.data);
  return loginLocal(db, parsed.data);
}

async function loginLocal(db: Db, data: { email: string; password: string }): Promise<Result> {
  const user = await db.table("users").first({ email: data.email });
  if (!user || !user.passwordHash) return { ok: false, error: "Invalid email or password" };
  if (user.status === "suspended") return { ok: false, error: "This account has been suspended" };
  const ok = await verifyPassword(data.password, user.passwordHash);
  if (!ok) return { ok: false, error: "Invalid email or password" };
  await audit(db, user.id, "user.login", user.id);
  return { ok: true, user };
}

async function loginSupabase(data: { email: string; password: string }): Promise<Result> {
  const supabase = await authClientForCookies({ writable: true });
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    const msg = /invalid login credentials/i.test(error.message)
      ? "Invalid email or password"
      : /email not confirmed/i.test(error.message)
        ? "Please confirm your email first - check your inbox"
        : error.message;
    return { ok: false, error: msg };
  }
  const db = await getDb();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { ok: false, error: "Login failed - please try again" };
  const user =
    (await db.table("users").get(authUser.id)) ??
    (await provisionProfile(db, authUser.id, data.email, authUser.user_metadata?.display_name));
  if (!user) return { ok: false, error: "Profile setup failed - contact support" };
  await audit(db, user.id, "user.login", user.id);
  return { ok: true, user };
}

/**
 * Post-login destination, decided exclusively from the SERVER-side user
 * record. Admins land on the console; students go to their dashboard (or
 * onboarding first). The client never chooses this - the login response
 * carries the path, and a client-supplied role field is ignored.
 */
export function postLoginPath(user: Pick<User, "role" | "onboarding">): string {
  if (user.role === "admin") return "/admin";
  return user.onboarding.completed ? "/dashboard" : "/onboarding";
}

export async function logoutUser(): Promise<void> {
  if (!isSupabaseConfigured()) return; // local route deletes its own session row
  const supabase = await authClientForCookies({ writable: true });
  await supabase.auth.signOut();
}

/** Password reset request. Production: Supabase emails a recovery link. */
export async function requestPasswordReset(emailRaw: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = z.string().email().max(120).safeParse(emailRaw);
  if (!email.success) return { ok: false, error: "Enter a valid email address" };
  if (!isSupabaseConfigured()) {
    // Local dev mode has no mailer - the limitation is documented, and the
    // route pretends success to avoid leaking which emails exist.
    return { ok: true };
  }
  const supabase = await authClientForCookies({ writable: true });
  const { error } = await supabase.auth.resetPasswordForEmail(email.data.toLowerCase().trim(), {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) return { ok: false, error: "Could not send the reset email - try again shortly" };
  return { ok: true };
}

/** Set a new password after recovery (requires a valid recovery session). */
export async function updatePassword(newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const p = z.string().min(8, "At least 8 characters").max(128).safeParse(newPassword);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Invalid password" };
  if (!isSupabaseConfigured()) return { ok: false, error: "Password reset is unavailable in local mode" };
  const supabase = await authClientForCookies({ writable: true });
  const { error } = await supabase.auth.updateUser({ password: p.data });
  if (error) return { ok: false, error: "Could not update the password - open the reset link again" };
  return { ok: true };
}
