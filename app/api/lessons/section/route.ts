import { z } from "zod";
import { getDb } from "@/server/db/db";
import { recordSection } from "@/server/services/progress";
import { json, parseBody, requireUser } from "@/server/http";

const schema = z.object({
  lessonId: z.string().max(80),
  sectionId: z.string().max(80),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;
  const db = await getDb();
  const r = await recordSection(db, auth.user, parsed.data.lessonId, parsed.data.sectionId);
  if (!r.ok) return json({ error: r.error }, 404);
  return json({ ok: true });
}
