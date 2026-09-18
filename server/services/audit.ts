import type { Db } from "@/server/db/db";
import { newId } from "@/server/db/db";

/** Audit log for security-relevant actions (spec §31). */
export async function audit(
  db: Db,
  actorId: string,
  action: string,
  targetId?: string,
  meta?: Record<string, unknown>,
) {
  await db.table("audit_log").insert({
    id: newId(),
    actorId,
    action,
    targetId,
    meta,
    createdAt: new Date().toISOString(),
  });
}
