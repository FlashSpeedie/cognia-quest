import { cookies } from "next/headers";
import { getDb } from "@/server/db/db";
import { createSession, SESSION_COOKIE, DEMO_EMAIL } from "@/server/auth/session";
import { isDemoEnabled } from "@/lib/env";
import { json, throttle } from "@/server/http";

/**
 * Demo mode (spec §73): one-click sign-in to the seeded demo account.
 * Disabled whenever Supabase (production backend) is configured - a real
 * deployment must not offer shared demo logins. See lib/env.isDemoEnabled.
 */
export async function POST(req: Request) {
  if (!isDemoEnabled()) return json({ error: "Not found" }, 404);

  const limited = throttle(req, "demo", 10, 60_000);
  if (limited) return limited;

  const db = await getDb();
  const demo = await db.table("users").first({ email: DEMO_EMAIL });
  if (!demo) return json({ error: "Demo account not available - run `npm run seed`." }, 404);

  const cookie = await createSession(demo.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return json({ ok: true, onboard: false });
}
