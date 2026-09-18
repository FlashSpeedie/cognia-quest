import { getDb } from "@/server/db/db";
import { json, requireUser, throttle } from "@/server/http";

/** GDPR-flavored data portability (spec §48/§70): dump the caller's own data. */
export async function GET(req: Request) {
  const limited = throttle(req, "export", 5, 60_000);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const db = await getDb();
  const uid = auth.user.id;
  const [badges, lessons, missions, quizzes, challenges, prompts, sims, streak, activity, notifications, final] =
    await Promise.all([
      db.table("badge_states").find({ userId: uid }),
      db.table("lesson_progress").find({ userId: uid }),
      db.table("mission_progress").find({ userId: uid }),
      db.table("quiz_attempts").find({ userId: uid }),
      db.table("challenge_attempts").find({ userId: uid }),
      db.table("prompt_attempts").find({ userId: uid }),
      db.table("sim_runs").find({ userId: uid }),
      db.table("streaks").get(uid),
      db.table("activity").find({ userId: uid }),
      db.table("notifications").find({ userId: uid }),
      db.table("final_results").get(uid),
    ]);
  const u = auth.user;
  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      email: u.email,
      displayName: u.displayName,
      title: u.title,
      xpTotal: u.xpTotal,
      createdAt: u.createdAt,
      onboarding: u.onboarding,
      preferences: u.preferences,
    },
    badges, lessons, missions, quizzes, challenges, prompts, sims, streak, activity, notifications, final,
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ai-quest-${u.displayName.replace(/\W+/g, "-").toLowerCase()}-data.json"`,
    },
  });
}
