import { z } from "zod";
import { getDb } from "@/server/db/db";
import { requireAdmin, json, parseBody } from "@/server/http";
import { audit } from "@/server/services/audit";

const patchSchema = z.object({ status: z.enum(["active", "suspended"]) });

/** Admin-only: set a user's account status (active or suspended). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(req, patchSchema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const target = await db.table("users").get(id);
  if (!target) return json({ error: "User not found" }, 404);
  if (target.id === auth.user.id) return json({ error: "You cannot change your own status" }, 422);

  await db.table("users").update(id, { status: parsed.data.status });
  await audit(db, auth.user.id, `admin.user.${parsed.data.status}`, id);
  return json({ ok: true, status: parsed.data.status });
}
