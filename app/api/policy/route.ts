import { z } from "zod";
import { getDb } from "@/server/db/db";
import { json, parseBody, requireUser } from "@/server/http";
import { newId } from "@/server/db/db";
import { recordMissionEvent } from "@/server/services/missions";
import { logActivity } from "@/server/services/activity";
import { checkBadges } from "@/server/services/badges";
import { touchStreak } from "@/server/services/streaks";

const stance = z.enum(["allowed", "disclose", "ask-first", "not-allowed"]);

const schema = z.object({
  rules: z.record(z.string().max(60), stance),
  note: z.string().max(400).optional(),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const ruleCount = Object.keys(parsed.data.rules).length;
  if (ruleCount < 4) return json({ error: "Set a rule for at least 4 scenarios to publish a policy." }, 422);

  const db = await getDb();
  await db.table("challenge_attempts").insert({
    id: newId(),
    userId: auth.user.id,
    challengeId: "policy-builder",
    kind: "ethics",
    correct: true,
    detail: `policy:${JSON.stringify(parsed.data.rules).slice(0, 300)}`,
    createdAt: new Date().toISOString(),
  });
  await logActivity(db, auth.user.id, "policy_published", "Published a responsible-AI classroom policy");
  await touchStreak(db, auth.user.id);
  if (ruleCount >= 4) await recordMissionEvent(db, auth.user, { type: "ethics", id: "policy:4-rules" });
  await recordMissionEvent(db, auth.user, { type: "ethics", id: "policy:published" });
  await checkBadges(db, auth.user.id);
  return json({ ok: true });
}
