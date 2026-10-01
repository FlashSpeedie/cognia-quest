import { z } from "zod";
import { json, parseBody, throttle } from "@/server/http";
import { requireUser } from "@/server/http";
import { getDb } from "@/server/db/db";
import { recordAcademySection } from "@/server/services/academyProgress";

/**
 * Academy lesson step tracking (checkpoint answered / activity completed /
 * free response submitted). Authenticated students only - anonymous visitors
 * keep their progress locally in the browser, and the UI tells them so.
 * Section ids are validated against the lesson's own required-step list,
 * so nothing arbitrary can be written.
 */
const schema = z.object({
  lessonId: z.string().min(1).max(40),
  sectionId: z.string().min(1).max(80),
});

export async function POST(req: Request) {
  const limited = throttle(req, "academy-progress", 90, 60_000);
  if (limited) return limited;

  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const result = await recordAcademySection(db, auth.user, parsed.data.lessonId, parsed.data.sectionId);
  if (!result.ok) return json({ error: result.error ?? "Couldn't save that step" }, 422);
  return json(result);
}
