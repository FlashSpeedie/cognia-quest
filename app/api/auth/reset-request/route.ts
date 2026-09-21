import { json, throttle } from "@/server/http";
import { requestPasswordReset } from "@/server/services/authService";

/**
 * Request a password-reset email (Supabase Auth). Always answers 200 with a
 * generic message so the endpoint can't be used to enumerate accounts.
 */
export async function POST(req: Request) {
  const limited = throttle(req, "reset-request", 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const email = typeof (body as { email?: unknown } | null)?.email === "string"
    ? (body as { email: string }).email
    : "";
  const r = await requestPasswordReset(email);
  if (!r.ok) return json({ error: r.error }, 400);
  return json({ ok: true, message: "If that account exists, a reset link is on its way." });
}
