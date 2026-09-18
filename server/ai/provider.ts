/**
 * Optional real-LLM seam (spec §112/§113).
 *
 * The entire product works without any external AI provider: every learning
 * experience uses deterministic, inspectable educational engines by design.
 * If a deployer WANTS a live model for e.g. freeform question answering,
 * they can set OPENAI_API_KEY and call `generateExplanation`, which:
 *  - runs server-side only (this file is never shipped to the browser),
 *  - enforces a small input budget and per-context rate limiting (caller),
 *  - falls back gracefully (returns null) when no key is configured.
 *
 * No call site ships enabled by default — deterministic fallbacks are the
 * product, not a degraded mode.
 */

export interface AIProviderStatus {
  configured: boolean;
  provider: "openai" | "none";
}

export function aiProviderStatus(): AIProviderStatus {
  return process.env.OPENAI_API_KEY
    ? { configured: true, provider: "openai" }
    : { configured: false, provider: "none" };
}

export async function generateExplanation(prompt: string, opts?: { maxChars?: number }): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null; // deterministic fallback: caller uses curated content
  const input = prompt.slice(0, opts?.maxChars ?? 2000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.AI_QUEST_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a careful AI-literacy tutor for high school students. Be accurate, brief, and honest about uncertainty. Never invent citations." },
          { role: "user", content: input },
        ],
        max_tokens: 400,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
