import { z } from "zod";
import { getDb } from "@/server/db/db";
import { submitPrompt } from "@/server/services/activities";
import { scorePrompt } from "@/server/services/promptScore";
import { json, parseBody, requireUser, throttle } from "@/server/http";

const schema = z.object({
  prompt: z.string().min(1).max(4000),
  taskId: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const limited = throttle(req, "prompt", 30);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const db = await getDb();
  const r = await submitPrompt(db, auth.user, parsed.data.taskId ?? "free", parsed.data.prompt);
  if (!r.ok) return json({ error: r.error }, 422);
  return json({
    ok: true,
    score: r.score,
    xp: r.xp ? { awarded: r.xp.awarded, total: r.xp.total, leveledUp: r.xp.leveledUp } : undefined,
    badges: r.badges,
  });
}

/** Stateless instant preview (no XP stored) — used for live drafting. */
export async function PUT(req: Request) {
  const limited = throttle(req, "prompt-preview", 120);
  if (limited) return limited;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const prompt = (body as { prompt?: unknown }).prompt;
  if (typeof prompt !== "string" || prompt.length > 4000) return json({ error: "Invalid prompt" }, 422);
  return json({ score: scorePrompt(prompt) });
}
