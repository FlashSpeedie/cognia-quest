import { z } from "zod";
import { json, parseBody, throttle } from "@/server/http";
import { getSessionUser } from "@/server/auth/session";
import { rateLimit } from "@/lib/ratelimit";
import { getDb } from "@/server/db/db";
import { lessonById } from "@/content/academy";
import { recordAcademySection } from "@/server/services/academyProgress";
import {
  FREE_RESPONSE_SYSTEM_PROMPT,
  buildFreeResponseUserPrompt,
  parseFreeResponseFeedback,
  deterministicFeedback,
  detectConcepts,
  type FreeResponseFeedback,
} from "@/server/ai/academyPrompts";
import { callGemini, aiConfigured } from "@/server/ai/provider";

/**
 * Free-response submission with AI rubric feedback.
 *
 * POST /api/academy/free-response  { lessonId, response }
 *
 * The deterministic keyword-coverage check always runs; Gemini (server-side
 * only) adds strengths/improvements when available. If Gemini is missing,
 * slow or malformed, the student still gets the deterministic feedback and
 * - when signed in - the step still counts. Anonymous visitors get feedback
 * only (stricter IP rate limit, nothing persisted).
 */
const schema = z.object({
  lessonId: z.string().min(1).max(40),
  response: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;
  const { lessonId } = parsed.data;

  const lesson = lessonById(lessonId);
  const fr = lesson?.freeResponse ?? null;
  if (!lesson || !fr) return json({ error: "Unknown lesson" }, 404);

  const response = parsed.data.response.trim();
  if (response.length < fr.minLength) {
    return json({ error: `Add a bit more - aim for at least ${fr.minLength} characters.` }, 422);
  }
  if (response.length > fr.maxLength) {
    return json({ error: `Keep it under ${fr.maxLength} characters.` }, 422);
  }

  // Rate limits: per-user when signed in, tighter IP limit for guests.
  const user = await getSessionUser();
  if (user) {
    if (!rateLimit(`academy-freeresponse:u:${user.id}`, 6, 60_000).ok) {
      return json({ error: "That's a few too many submissions in a minute - try again shortly." }, 429);
    }
  } else {
    const limited = throttle(req, "academy-freeresponse-guest", 3, 60_000);
    if (limited) return limited;
  }

  // Deterministic baseline - always computed, never depends on the network.
  const mentioned = detectConcepts(response, fr.expectedConcepts);
  const fallback = deterministicFeedback({
    expectedConcepts: fr.expectedConcepts,
    mentionedConcepts: mentioned,
    minLength: fr.minLength,
    responseLength: response.length,
  });

  let feedback: FreeResponseFeedback = { ...fallback, aiGenerated: false };

  if (aiConfigured()) {
    const graderPrompt = buildFreeResponseUserPrompt({
      lessonTitle: lesson.meta.title,
      question: fr.prompt,
      rubric: fr.rubric,
      expectedConcepts: fr.expectedConcepts,
      mentionedConcepts: mentioned,
      response,
    });
    const result = await callGemini(FREE_RESPONSE_SYSTEM_PROMPT, graderPrompt);
    if (result.ok) {
      const ai = parseFreeResponseFeedback(result.text);
      if (ai) {
        // Blend: AI narrative wins, keyword coverage keeps the score honest.
        feedback = {
          score: Math.round((ai.score + fallback.score) / 2),
          strengths: ai.strengths.length > 0 ? ai.strengths : fallback.strengths,
          improvements: ai.improvements.length > 0 ? ai.improvements : fallback.improvements,
          missingConcepts: ai.missingConcepts.length > 0 ? ai.missingConcepts : fallback.missingConcepts,
          nextStep: ai.nextStep || fallback.nextStep,
          aiGenerated: true,
        };
      }
    }
    // Any Gemini failure simply leaves the deterministic feedback in place.
  }

  // Persist the step for signed-in students (genuine attempt = done).
  let guest = true;
  let lessonXp: { awarded: number; total: number; duplicate: boolean; leveledUp: { to: string; level: number } | null } | null = null;
  if (user) {
    guest = false;
    const db = await getDb();
    const saved = await recordAcademySection(db, user, lesson.meta.id, `${lesson.meta.id}-freeresponse`);
    if (!saved.ok) {
      return json({ error: "Your feedback is below - but we couldn't save this step. Try again in a moment." }, 502);
    }
    if (saved.lessonXp && saved.lessonXp.awarded > 0) {
      lessonXp = {
        awarded: saved.lessonXp.awarded,
        total: saved.lessonXp.total,
        duplicate: saved.lessonXp.duplicate,
        leveledUp: saved.lessonXp.leveledUp,
      };
    }
  }

  return json({ ok: true, guest, feedback, lessonXp });
}
