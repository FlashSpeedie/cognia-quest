import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";
import type { Db } from "@/server/db/db";
import { getDb, newId } from "@/server/db/db";
import type { User } from "@/lib/types";
import { DEFAULT_PREFERENCES } from "@/lib/types";
import { authClientForCookies } from "./supabase";

/**
 * Two authentication backends, one contract:
 *
 * - PRODUCTION (Supabase configured): Supabase Auth owns credentials and
 *   sessions. The browser holds sb-* httpOnly cookies (access + refresh
 *   token). Every request here re-validates the access token against
 *   GoTrue - a forged or expired cookie simply yields null. The app-level
 *   `users` table (server-side only) holds the profile, role and XP.
 *
 * - LOCAL (development/tests only): scrypt password hashes in the JSON
 *   store + HMAC-signed httpOnly cookie with a server-side session row.
 */

export const SESSION_COOKIE = "aq_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days (local mode)

function localSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[ai-quest] AUTH_SECRET is not set - using a built-in development secret. " +
          "Local-mode sessions are NOT safe for real deployments.",
      );
    }
    return "dev-only-insecure-secret";
  }
  return s;
}

export function signLocal(payload: string): string {
  return createHmac("sha256", localSecret()).update(payload).digest("hex");
}

export function encodeSessionCookie(sessionId: string): string {
  return `${sessionId}.${signLocal(sessionId)}`;
}

export function decodeSessionCookie(value: string | undefined): string | null {
  if (!value) return null;
  const [id, sig] = value.split(".");
  if (!id || !sig) return null;
  const expected = signLocal(id);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

/** Local mode only: create a server-side session row + signed cookie. */
export async function createSession(userId: string): Promise<string> {
  const db = await getDb();
  const id = newId();
  await db.table("sessions").insert({
    id,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });
  return encodeSessionCookie(id);
}

export async function destroySession(cookieValue: string | undefined): Promise<void> {
  const id = decodeSessionCookie(cookieValue);
  if (!id) return;
  const db = await getDb();
  await db.table("sessions").remove(id);
}

/** Signed-in user from the request cookies (server components/routes). */
export async function getSessionUser(dbOverride?: Db): Promise<User | null> {
  if (isSupabaseConfigured()) return getSupabaseUser(dbOverride);
  return getLocalUser(dbOverride);
}

async function getLocalUser(dbOverride?: Db): Promise<User | null> {
  const cookieStore = await cookies();
  const id = decodeSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const db = dbOverride ?? (await getDb());
  const session = await db.table("sessions").get(id);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await db.table("sessions").remove(id);
    return null;
  }
  const user = await db.table("users").get(session.userId);
  // Suspended accounts are treated as signed out everywhere.
  if (user?.status === "suspended") return null;
  return user;
}

/**
 * PRODUCTION path: verify the Supabase access token server-side, then load
 * (or lazily provision) the app profile. Role/XP/preferences live only in
 * our users table - never in client-readable JWT claims.
 */
async function getSupabaseUser(dbOverride?: Db): Promise<User | null> {
  const env = getSupabaseEnv();
  if (!env) return null;
  try {
    const supabase = await authClientForCookies({ writable: false });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const db = dbOverride ?? (await getDb());
    const existing = await db.table("users").get(data.user.id);
    // Suspended accounts are treated as signed out everywhere.
    if (existing?.status === "suspended") return null;
    if (existing) return existing;
    return await provisionProfile(db, data.user.id, data.user.email ?? "", data.user.user_metadata?.display_name);
  } catch {
    return null;
  }
}

const AVATARS = ["🚀", "🛰️", "🧠", "🤖", "⚡", "🔬", "🎯", "🛡️", "💡", "🌌"];

/**
 * Idempotent first-login profile row. Strictly server-side: role always
 * starts as "student" regardless of anything the client sends.
 */
export async function provisionProfile(
  db: Db,
  authUserId: string,
  email: string,
  displayNameRaw?: unknown,
): Promise<User | null> {
  const name = typeof displayNameRaw === "string" ? displayNameRaw.trim().replace(/\s+/g, " ") : "";
  const displayName = /^[a-zA-Z0-9 _-]{2,24}$/.test(name) ? name : (email.split("@")[0] || "Apprentice").slice(0, 24);
  const profile: User = {
    id: authUserId,
    email: email.toLowerCase(),
    displayName,
    passwordHash: null,
    role: "student",
    title: "AI Rookie",
    avatarId: AVATARS[Math.floor(Math.random() * AVATARS.length)]!,
    createdAt: new Date().toISOString(),
    onboarding: { completed: false },
    preferences: DEFAULT_PREFERENCES,
    xpTotal: 0,
    isDemo: false,
  };
  try {
    return await db.table("users").insert(profile);
  } catch {
    // Concurrent first requests race the insert - the row that won is fine.
    return db.table("users").get(authUserId);
  }
}

/** Demo mode (spec §73): a shared, clearly-flagged account. Local mode only - see lib/env. */
export const DEMO_EMAIL = "demo@aiquest.dev";
