import { z } from "zod";
import { callGemini } from "@/server/ai/provider";
import { json, parseBody, requireUser, throttle } from "@/server/http";

/**
 * AI Tutor (spec §112): answers questions about the CURRENT lesson topic.
 * Context is server-derived from the lesson id - clients can't inject
 * arbitrary system prompts. Gemini only teaches; it never scores or grants.
 */
const schema = z.object({
  lessonId: z.string().max(80).optional(),
  question: z.string().min(4, "Ask a full question").max(600),
});

const SYSTEM = [
  "You are the Cognia Quest tutor for high-school students learning AI literacy.",
  "Answer briefly (under 150 words), accurately and encouragingly.",
  "If the question is off-topic for AI literacy, say so and redirect.",
  "Never do homework for the student; explain concepts instead.",
  "If unsure, say you're not sure. Never invent facts or citations.",
].join(" ");

export async function POST(req: Request) {
  const limited = throttle(req, "ai-tutor", 12, 60_000);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const context = parsed.data.lessonId ? `Lesson context id: ${parsed.data.lessonId}\n` : "";
  const r = await callGemini(SYSTEM, `${context}Student question: ${parsed.data.question}`);
  if (!r.ok) {
    const status = r.reason === "unconfigured" ? 503 : r.reason === "timeout" ? 504 : 502;
    return json({ error: "The tutor is unavailable right now - try again in a moment.", reason: r.reason }, status);
  }
  return json({ ok: true, answer: r.text });
}
