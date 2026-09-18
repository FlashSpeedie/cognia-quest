import { getDb } from "@/server/db/db";
import { getDashboard } from "@/server/services/dashboard";
import { json, requireUser } from "@/server/http";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const db = await getDb();
  const data = await getDashboard(db, auth.user);
  // Sets aren't JSON-serializable — strip them for the API shape
  return json({
    ...data,
    stats: { ...data.stats, lessonIdsCompleted: undefined, simIds: undefined },
  });
}
