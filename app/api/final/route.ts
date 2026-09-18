import { z } from "zod";
import { getDb } from "@/server/db/db";
import { submitFinal } from "@/server/services/final";
import { json, requireUser, throttle } from "@/server/http";

const schema = z.object({
  "choose-data": z.array(z.string().max(20)).max(10).optional(),
  "spot-problem": z.number().int().min(0).max(3).optional(),
  "read-results": z.number().int().min(0).max(3).optional(),
  "prompt-write": z.string().max(2000).optional(),
  "detect-issue": z.number().int().min(0).max(3).optional(),
  checklist: z.array(z.string().max(10)).max(10).optional(),
  verdict: z.number().int().min(0).max(2).optional(),
});

export async function POST(req: Request) {
  const limited = throttle(req, "final", 8);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "Malformed submission" }, 422);

  const db = await getDb();
  const r = await submitFinal(db, auth.user, parsed.data);
  if (!r.ok) return json({ error: r.error, alreadyDone: r.alreadyDone }, 422);
  return json({ ok: true, result: r.result });
}
