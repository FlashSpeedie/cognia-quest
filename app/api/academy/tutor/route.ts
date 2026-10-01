import { z } from "zod";
import { callGemini, aiConfigured } from "@/server/ai/provider";
import { TUTOR_SYSTEM_PROMPT, buildTutorUserPrompt } from "@/server/ai/academyPrompts";
import { json, parseBody, throttle } from "@/server/http";
import { getSessionUser } from "@/server/auth/session";
import { rateLimit } from "@/lib/ratelimit";
import { MODULE_1, lessonMetaById, retrieveKnowledge } from "@/content/academy";
import type { TutorSourceRef } from "@/content/academy/types";
import { formatSegment } from "@/lib/academy";

/**
 * Academy learning assistant - Module-1-grounded tutor.
 *
 * POST /api/academy/tutor  { moduleId, lessonId, question }
 * Public: anonymous visitors get help too (stricter IP limit); signed-in
 * students get a per-user limit. Gemini runs only on the server - the key,
 * the system prompt and the knowledge base never reach the browser. Only a
 * handful of relevant knowledge chunks are attached per request (never the
 * full corpus), and the response is validated before it is returned.
 */

const schema = z.object({
  moduleId: z.enum(["module-1"]),
  lessonId: z.string().max(40).optional(),
  question: z.string().trim().min(4, "Ask a full question").max(600),
});

const MAX_ANSWER_CHARS = 2000;
const MAX_SOURCES = 3;

export async function POST(req: Request) {
  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return parsed.response;

  // Rate limits: tighter for anonymous usage, per-user when signed in.
  const user = await getSessionUser();
  if (user) {
    if (!rateLimit(`academy-tutor:u:${user.id}`, 12, 60_000).ok) {
      return json({ error: "That's a lot of questions in a minute - give it a moment and try again." }, 429);
    }
  } else {
    const limited = throttle(req, "academy-tutor-guest", 6, 60_000);
    if (limited) return limited;
  }

  if (!aiConfigured()) {
    return json(
      {
        error:
          "The learning assistant isn't enabled on this server right now - but every lesson explains everything you need. Try again another time.",
        reason: "unconfigured",
      },
      503,
    );
  }

  // Resolve the lesson (must belong to the module) and retrieve grounded chunks.
  const lesson = parsed.data.lessonId ? lessonMetaById(parsed.data.lessonId) : null;
  if (parsed.data.lessonId && !lesson) {
    return json({ error: "Unknown lesson" }, 404);
  }

  const chunks = retrieveKnowledge(MODULE_1.id, lesson?.id, parsed.data.question, { max: 6, maxChars: 5500 });

  const userPrompt = buildTutorUserPrompt({
    moduleTitle: `Module 1 - ${MODULE_1.title}`,
    lessonId: lesson?.id ?? null,
    lessonTitle: lesson ? `Lesson ${lesson.order} - ${lesson.title}` : null,
    chunks,
    question: parsed.data.question,
  });

  const result = await callGemini(TUTOR_SYSTEM_PROMPT, userPrompt);
  if (!result.ok) {
    const status = result.reason === "timeout" ? 504 : 502;
    return json(
      { error: "Your question could not be answered right now. Please try again.", reason: result.reason },
      status,
    );
  }

  // Validate the answer before returning it.
  const answer = result.text.trim();
  if (answer.length < 4) {
    return json({ error: "Your question could not be answered right now. Please try again." }, 502);
  }

  // Sources come from the chunks the server selected - never invented.
  const seen = new Set<string>();
  const sources: TutorSourceRef[] = [];
  for (const c of chunks) {
    if (sources.length >= MAX_SOURCES) break;
    const key = `${c.lessonId}:${c.source.start}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ lessonId: c.lessonId, chapter: c.source.chapter, start: c.source.start, end: c.source.end });
  }

  const first = sources[0];
  return json({
    ok: true,
    answer: answer.slice(0, MAX_ANSWER_CHARS),
    sources,
    segmentLabel: first ? formatSegment(first.start, first.end) : null,
  });
}
