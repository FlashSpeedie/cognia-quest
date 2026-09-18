import { z } from "zod";
import type { Db } from "@/server/db/db";
import { newId } from "@/server/db/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { DEFAULT_PREFERENCES, type User } from "@/lib/types";
import { audit } from "./audit";

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
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1),
});

const AVATARS = ["🚀", "🛰️", "🧠", "🤖", "⚡", "🔬", "🎯", "🛡️", "💡", "🌌"];

export async function registerUser(
  db: Db,
  input: { email: string; displayName: string; password: string },
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await db.table("users").first({ email: parsed.data.email });
  if (existing) return { ok: false, error: "An account with this email already exists" };

  const user: User = {
    id: newId(),
    email: parsed.data.email,
    displayName: parsed.data.displayName,
    passwordHash: await hashPassword(parsed.data.password),
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

export async function loginUser(
  db: Db,
  input: { email: string; password: string },
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid credentials" };
  const user = await db.table("users").first({ email: parsed.data.email });
  if (!user || !user.passwordHash) return { ok: false, error: "Invalid email or password" };
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return { ok: false, error: "Invalid email or password" };
  await audit(db, user.id, "user.login", user.id);
  return { ok: true, user };
}
