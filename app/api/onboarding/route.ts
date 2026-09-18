import { z } from "zod";
import { getDb } from "@/server/db/db";
import { completeOnboarding, skipOnboarding } from "@/server/services/user";
import { json, parseBody, requireUser } from "@/server/http";

const bodySchema = z.object({
  action: z.enum(["complete", "skip"]),
  learnerType: z.string().optional(),
  goal: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(req, bodySchema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const result =
    parsed.data.action === "skip"
      ? await skipOnboarding(db, auth.user)
      : await completeOnboarding(db, auth.user, {
          learnerType: parsed.data.learnerType,
          goal: parsed.data.goal,
        });
  if (!result.ok) return json({ error: result.error }, 422);
  return json({ ok: true });
}
