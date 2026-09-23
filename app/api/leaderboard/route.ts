import { getDb } from "@/server/db/db";
import { json, requireUser } from "@/server/http";
import { levelFor } from "@/lib/levels";

/** Opt-in only (spec §39). Returns display name + XP + level - nothing else. */
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const db = await getDb();
  const users = await db.table("users").all();
  const rows = users
    .filter((u) => u.preferences.leaderboardOptIn && u.role === "student")
    .map((u) => ({
      displayName: u.displayName,
      xp: u.xpTotal,
      title: levelFor(u.xpTotal).title,
      isMe: u.id === auth.user.id,
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 50);
  return json({ entries: rows, youOptedIn: auth.user.preferences.leaderboardOptIn });
}
