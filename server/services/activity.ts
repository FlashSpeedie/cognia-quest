import type { Db } from "@/server/db/db";
import { newId } from "@/server/db/db";
import type { AppNotification } from "@/lib/types";

export async function logActivity(db: Db, userId: string, kind: string, label: string) {
  await db.table("activity").insert({
    id: newId(),
    userId,
    kind,
    label,
    createdAt: new Date().toISOString(),
  });
}

export async function notify(db: Db, userId: string, kind: AppNotification["kind"], title: string, body: string) {
  // avoid duplicates of identical unread notifications
  const existing = await db.table("notifications").find({ userId, title, read: false });
  if (existing.length > 0) return;
  await db.table("notifications").insert({
    id: newId(),
    userId,
    kind,
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
  });
}
