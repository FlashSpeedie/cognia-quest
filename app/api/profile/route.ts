import { getDb } from "@/server/db/db";
import { updatePreferences, updateProfile } from "@/server/services/user";
import { json, parseBody, requireUser } from "@/server/http";
import { z } from "zod";

const patchSchema = z.object({
  displayName: z.string().min(2).max(24).optional(),
  avatarId: z.string().max(8).optional(),
  preferences: z.record(z.unknown()).optional(),
});

export async function PATCH(req: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(req, patchSchema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  if (parsed.data.displayName || parsed.data.avatarId) {
    const r = await updateProfile(db, auth.user, parsed.data);
    if (!r.ok) return json({ error: r.error }, 422);
  }
  if (parsed.data.preferences) {
    const r = await updatePreferences(db, auth.user, parsed.data.preferences);
    if (!r.ok) return json({ error: r.error }, 422);
  }
  const fresh = await db.table("users").get(auth.user.id);
  return json({ ok: true, user: fresh });
}
