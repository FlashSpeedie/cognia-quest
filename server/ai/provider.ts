import { getGeminiConfig } from "@/lib/env";

/**
 * Server-side Gemini provider for the optional live-AI features
 * (lesson tutor, prompt coach).
 *
 * Non-negotiables:
 *  - GEMINI_API_KEY never leaves the server (this module must not be
 *    imported from client components);
 *  - deterministic educational scoring (prompt rubric, quizzes, missions)
 *    NEVER goes through the LLM — Gemini only adds conversational help;
 *  - bounded input/output, hard timeout, no silent swallowing: failures
 *    surface as typed results so routes can answer 503/504 honestly.
 */

export type AIResult =
  | { ok: true; text: string }
  | { ok: false; reason: "unconfigured" | "timeout" | "provider_error" | "empty"; detail?: string };

const MAX_INPUT_CHARS = 4000;
const MAX_OUTPUT_TOKENS = 512;
const TIMEOUT_MS = 12_000;

export function aiConfigured(): boolean {
  return getGeminiConfig() !== null;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
}

/**
 * Single-turn generation. Returns a typed failure instead of throwing so
 * routes can log appropriately and answer with a useful status code.
 */
export async function callGemini(system: string, user: string): Promise<AIResult> {
  const cfg = getGeminiConfig();
  if (!cfg) return { ok: false, reason: "unconfigured" };

  const input = user.slice(0, MAX_INPUT_CHARS);
  const sys = system.slice(0, 2000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sys }] },
          contents: [{ role: "user", parts: [{ text: input }] }],
          generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.4 },
        }),
        signal: controller.signal,
      },
    );
    const data = (await res.json()) as GeminiResponse;
    if (!res.ok) {
      // Never log request bodies (may contain prompts) or the key.
      console.warn(`[ai-quest] gemini ${res.status} ${data.error?.status ?? ""}: ${data.error?.message?.slice(0, 160) ?? "unknown"}`);
      return { ok: false, reason: "provider_error", detail: `HTTP ${res.status}` };
    }
    if (data.promptFeedback?.blockReason) {
      return { ok: false, reason: "provider_error", detail: `blocked: ${data.promptFeedback.blockReason}` };
    }
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("")
      .trim();
    if (!text) return { ok: false, reason: "empty" };
    return { ok: true, text: text.slice(0, 4000) };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return { ok: false, reason: "timeout" };
    console.warn(`[ai-quest] gemini network failure: ${e instanceof Error ? e.message : "unknown"}`);
    return { ok: false, reason: "provider_error", detail: "network" };
  } finally {
    clearTimeout(timer);
  }
}
