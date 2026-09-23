import { json, requireUser } from "@/server/http";
import { getDb } from "@/server/db/db";
import { checkBadges } from "@/server/services/badges";
import { BADGES } from "@/content/badges";

/** GET /api/achievements - badge catalog with caller's state. */
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const db = await getDb();
  const { states } = await checkBadges(db, auth.user.id);
  const byId = new Map(states.map((s) => [s.badgeId, s]));
  return json({
    achievements: BADGES.map((b) => ({
      ...b,
      unlocked: !!byId.get(b.id)?.unlockedAt,
      unlockedAt: byId.get(b.id)?.unlockedAt ?? null,
      progress: byId.get(b.id)?.progress ?? 0,
    })),
  });
}
