import { json, requireUser } from "@/server/http";
import { MODULES } from "@/content/modules";
import { getDb } from "@/server/db/db";

/** GET /api/modules — module catalog + caller's completion state. */
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const db = await getDb();
  const progress = await db.table("lesson_progress").find({ userId: auth.user.id });
  const done = new Set(progress.filter((p) => p.status === "completed").map((p) => p.lessonId));
  return json({
    modules: MODULES.map((m) => ({
      id: m.id,
      slug: m.slug,
      order: m.order,
      title: m.title,
      tagline: m.tagline,
      lessons: m.lessons.length,
      estMinutes: m.lessons.reduce((n, l) => n + l.minutes, 0),
      completedLessons: m.lessons.filter((l) => done.has(l.id)).length,
    })),
  });
}
