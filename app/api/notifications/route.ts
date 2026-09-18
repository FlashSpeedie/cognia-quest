import { z } from "zod";
import { getDb } from "@/server/db/db";
import { json, parseBody, requireUser } from "@/server/http";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const db = await getDb();
  const all = await db.table("notifications").find({ userId: auth.user.id });
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ notifications: all.slice(0, 25), unread: all.filter((n) => !n.read).length });
}

const markSchema = z.object({ ids: z.array(z.string()).optional(), all: z.boolean().optional() });

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, markSchema);
  if (!parsed.ok) return parsed.response;
  const db = await getDb();
  const all = await db.table("notifications").find({ userId: auth.user.id });
  const targets = parsed.data.all ? all : all.filter((n) => parsed.data.ids?.includes(n.id));
  for (const n of targets) {
    if (!n.read) await db.table("notifications").update(n.id, { read: true });
  }
  return json({ ok: true, marked: targets.length });
}
