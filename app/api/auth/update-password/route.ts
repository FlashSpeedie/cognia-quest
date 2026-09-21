import { json, parseBody, requireUser, throttle } from "@/server/http";
import { updatePassword } from "@/server/services/authService";
import { z } from "zod";

const schema = z.object({ password: z.string().min(8, "At least 8 characters").max(128) });

/** Set a new password. Requires a valid (recovery or normal) session. */
export async function POST(req: Request) {
  const limited = throttle(req, "update-password", 10, 60_000);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const r = await updatePassword(parsed.data.password);
  if (!r.ok) return json({ error: r.error }, 422);
  return json({ ok: true });
}
