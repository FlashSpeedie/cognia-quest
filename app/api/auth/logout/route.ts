import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/server/auth/session";
import { json } from "@/server/http";

export async function POST() {
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  await destroySession(value);
  jar.delete(SESSION_COOKIE);
  return json({ ok: true });
}
