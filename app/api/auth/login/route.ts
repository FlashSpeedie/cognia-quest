import { cookies } from "next/headers";
import { getDb } from "@/server/db/db";
import { loginUser, loginSchema, postLoginPath } from "@/server/services/authService";
import { createSession, SESSION_COOKIE } from "@/server/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { json, parseBody, throttle } from "@/server/http";

export async function POST(req: Request) {
  const limited = throttle(req, "login", 10, 60_000);
  if (limited) return limited;

  const parsed = await parseBody(req, loginSchema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const result = await loginUser(db, parsed.data);
  if (!result.ok) return json({ error: result.error }, 401);

  // Destination is computed from the server-side user record only.
  const redirect = postLoginPath(result.user);

  if (isSupabaseConfigured()) {
    // Session cookies were written by the Supabase Auth sign-in above.
    return json({ ok: true, onboard: !result.user.onboarding.completed, redirect });
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
  return json({ ok: true, onboard: !result.user.onboarding.completed, redirect });
}
