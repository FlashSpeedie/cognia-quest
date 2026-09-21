import { cookies } from "next/headers";
import { getDb } from "@/server/db/db";
import { registerUser, registerSchema } from "@/server/services/authService";
import { createSession, SESSION_COOKIE } from "@/server/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { json, parseBody, throttle } from "@/server/http";

export async function POST(req: Request) {
  const limited = throttle(req, "register", 10, 60_000);
  if (limited) return limited;

  const parsed = await parseBody(req, registerSchema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const result = await registerUser(db, parsed.data);
  if (!result.ok) return json({ error: result.error }, 409);

  if (isSupabaseConfigured()) {
    // Supabase Auth owns the session: signUp() already wrote the cookies
    // when email confirmation is off; otherwise the user must confirm first.
    if ("confirmEmail" in result && result.confirmEmail) {
      return json({ ok: true, confirmEmail: true }, 201);
    }
    return json({ ok: true, onboard: true }, 201);
  }

  const cookie = await createSession(result.user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return json({ ok: true, onboard: true }, 201);
}
