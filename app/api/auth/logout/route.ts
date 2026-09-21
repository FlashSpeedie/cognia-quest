import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/server/auth/session";
import { logoutUser } from "@/server/services/authService";
import { isSupabaseConfigured } from "@/lib/env";
import { json } from "@/server/http";

export async function POST() {
  if (isSupabaseConfigured()) {
    await logoutUser(); // revokes the Supabase refresh token + clears cookies
  } else {
    const jar = await cookies();
    await destroySession(jar.get(SESSION_COOKIE)?.value);
    jar.delete(SESSION_COOKIE);
  }
  return json({ ok: true });
}
