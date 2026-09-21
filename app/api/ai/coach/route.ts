import { z } from "zod";
import { callGemini } from "@/server/ai/provider";
import { scorePrompt } from "@/server/services/promptScore";
import { json, parseBody, requireUser, throttle } from "@/server/http";

/**
 * Prompt Coach: qualitative feedback on a draft prompt.
 * The authoritative SCORE always comes from the deterministic rubric
 * (server/services/promptScore); Gemini's optional coaching text is layered
 * on top and never changes the number. That keeps grading inspectable.
 */
const schema = z.object({
  prompt: z.string().min(1).max(2000),
  taskId: z.string().max(40).optional(),
});

const SYSTEM = [
  "You are a prompt-writing coach for high-school students.",
  "You are given a prompt and a deterministic rubric score breakdown (0-5 each).",
  "Give 2-3 concrete, kind suggestions to raise the WEAKEST dimensions.",
  "Do not rewrite the whole prompt; point at what to add, name the dimension.",
  "Keep it under 120 words. Plain text, no markdown headings.",
].join(" ");

export async function POST(req: Request) {
  const limited = throttle(req, "ai-coach", 15, 60_000);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  const rubric = scorePrompt(parsed.data.prompt);
  const perDim = Object.fromEntries(rubric.dimensions.map((d) => [d.key, d.score]));
  const userMsg = [
    `Rubric (deterministic, 0-5 each): ${JSON.stringify(perDim)}. Total: ${rubric.total}/100.`,
    ``,
    `Student's prompt:`,
    parsed.data.prompt,
  ].join("\n");

  const r = await callGemini(SYSTEM, userMsg);
  if (!r.ok) {
    const status = r.reason === "unconfigured" ? 503 : r.reason === "timeout" ? 504 : 502;
    return json({ error: "The coach is unavailable right now — the rubric score still counts.", reason: r.reason }, status);
  }
  return json({ ok: true, feedback: r.text, score: rubric.total });
}
