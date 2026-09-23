import { getDb } from "@/server/db/db";
import { requireAdmin, json } from "@/server/http";
import { audit } from "@/server/services/audit";

/**
 * Admin-only: permanently delete a student account and every owned record.
 * - Cannot target yourself (prevents the last admin locking themselves out)
 * - Cannot target other admins (escalation safety)
 * - Removes every user-owned row so no orphaned progress remains
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const db = await getDb();
  const target = await db.table("users").get(id);
  if (!target) return json({ error: "User not found" }, 404);
  if (target.id === auth.user.id) return json({ error: "You cannot delete your own account" }, 422);
  if (target.role === "admin") return json({ error: "Admin accounts cannot be deleted from the console" }, 422);

  // Collect and remove every user-owned record, then the account itself.
  const tables = [
    "sessions",
    "xp_events",
    "badge_states",
    "lesson_progress",
    "mission_progress",
    "quiz_attempts",
    "challenge_attempts",
    "prompt_attempts",
    "sim_runs",
    "streaks",
    "activity",
    "notifications",
    "final_results",
  ] as const;

  for (const t of tables) {
    const rows = await db.table(t).find({ userId: id });
    for (const r of rows) await db.table(t).remove(r.id);
  }

  await audit(db, auth.user.id, "admin.user.delete", id, { email: target.email, displayName: target.displayName });
  await db.table("users").remove(id);
  return json({ ok: true });
}
