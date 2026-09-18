import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Db } from "@/server/db/db";
import { getDb, newId } from "@/server/db/db";
import type { User } from "@/lib/types";

export const SESSION_COOKIE = "aq_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[ai-quest] AUTH_SECRET is not set — using a built-in development secret. Sessions are NOT safe for real deployments. Set AUTH_SECRET (and Supabase) before exposing this app.",
      );
    }
    return "dev-only-insecure-secret";
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function encodeSessionCookie(sessionId: string): string {
  return `${sessionId}.${sign(sessionId)}`;
}

export function decodeSessionCookie(value: string | undefined): string | null {
  if (!value) return null;
  const [id, sig] = value.split(".");
  if (!id || !sig) return null;
  const expected = sign(id);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

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

/** Get the signed-in user from the request cookie (server components/routes). */
export async function getSessionUser(dbOverride?: Db): Promise<User | null> {
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
  return db.table("users").get(session.userId);
}

/** Demo mode: a shared, clearly-flagged demo account (spec §72-73/§116). */
export const DEMO_EMAIL = "demo@aiquest.dev";
