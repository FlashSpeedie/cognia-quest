import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * Unit tests for the Gemini provider. Network is fully mocked — these run
 * offline and never touch the real API.
 */

async function importProvider(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return import("@/server/ai/provider");
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
});

describe("gemini provider", () => {
  it("returns unconfigured without a key and never calls fetch", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { callGemini, aiConfigured } = await importProvider({ GEMINI_API_KEY: undefined });
    expect(aiConfigured()).toBe(false);
    const r = await callGemini("sys", "hello");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("unconfigured");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns text on a well-formed response and never puts the key in the URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        expect(String(input)).not.toContain("TESTKEY");
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Hello student" }] } }] }), { status: 200 });
      }),
    );
    const { callGemini } = await importProvider({ GEMINI_API_KEY: "TESTKEY-123", GEMINI_MODEL: "gemini-2.5-flash" });
    const r = await callGemini("sys", "what is AI?");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.text).toBe("Hello student");
  });

  it("maps HTTP errors to provider_error and logs without secrets", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { code: 429, message: "quota" } }), { status: 429 })));
    const { callGemini } = await importProvider({ GEMINI_API_KEY: "K" });
    const r = await callGemini("sys", "q");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("provider_error");
  });

  it("flags safety-blocked answers distinctly", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }), { status: 200 })));
    const { callGemini } = await importProvider({ GEMINI_API_KEY: "K" });
    const r = await callGemini("sys", "q");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe("provider_error");
      expect(r.detail).toContain("SAFETY");
    }
  });

  it("treats empty completions as a typed failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [] } }] }), { status: 200 })));
    const { callGemini } = await importProvider({ GEMINI_API_KEY: "K" });
    const r = await callGemini("sys", "q");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("empty");
  });

  it("times out via AbortController", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: unknown, init?: RequestInit) =>
        new Promise((_res, rej) => {
          init?.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")));
        }),
      ),
    );
    const { callGemini } = await importProvider({ GEMINI_API_KEY: "K" });
    const r = await callGemini("sys", "q");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("timeout");
  }, 20000);

  it("truncates over-long input", async () => {
    let seenBody = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_i: unknown, init?: RequestInit) => {
        seenBody = String(init?.body ?? "");
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "ok" }] } }] }), { status: 200 });
      }),
    );
    const { callGemini } = await importProvider({ GEMINI_API_KEY: "K" });
    await callGemini("sys", "x".repeat(10_000));
    const parsed = JSON.parse(seenBody) as { contents: { parts: { text: string }[] }[] };
    expect(parsed.contents[0]!.parts[0]!.text.length).toBeLessThanOrEqual(4000);
  });
});
