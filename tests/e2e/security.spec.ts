import { test, expect } from "@playwright/test";
import { DEMO_STATE } from "./states";

/**
 * Production-security E2E: not "does the page render" - does the server
 * refuse hostile input.
 */

test.describe("unauthenticated attacks", () => {
  const FORGEABLE = [
    "/api/quiz",
    "/api/sim/train",
    "/api/sim/record",
    "/api/detective",
    "/api/ethics",
    "/api/privacy",
    "/api/prompt/analyze",
    "/api/final",
    "/api/me/export",
    "/api/leaderboard",
    "/api/notifications",
  ];

  for (const path of FORGEABLE) {
    test(`anonymous request to ${path} is rejected`, async ({ request }) => {
      const res = await request.fetch(path, { method: "POST", data: {}, failOnStatusCode: false });
      expect([401, 405]).toContain(res.status());
      const body = await res.text();
      expect(body).not.toContain("stack"); // no stack traces leak
    });
  }
});

test.describe("forging with a valid student session", () => {
  test.use({ storageState: DEMO_STATE });

  test("no endpoint accepts client-supplied XP", async ({ request }) => {
    for (const path of ["/api/xp", "/api/gamification", "/api/rewards", "/api/me/xp"]) {
      const res = await request.fetch(path, {
        method: "POST",
        data: { xp: 999999, amount: 999999, source: "hack" },
        failOnStatusCode: false,
      });
      expect([404, 405]).toContain(res.status());
    }
  });

  test("profile PATCH cannot change role or XP", async ({ request }) => {
    const before = await (await request.fetch("/api/me")).json();
    const res = await request.fetch("/api/profile", {
      method: "PATCH",
      data: { role: "admin", xpTotal: 9999999, isAdmin: true, preferences: { theme: "dark" } },
    });
    expect(res.ok()).toBeTruthy();
    const after = await (await request.fetch("/api/me")).json();
    expect(after.user.role).toBe("student");
    expect(after.user.xpTotal).toBe(before.user.xpTotal);
  });

  test("quiz rejects malformed payloads", async ({ request }) => {
    for (const bad of [
      { answers: "not-an-array" },
      { quizId: "../../../etc", answers: [] },
      { quizId: "quiz-fund-1", answers: Array(50).fill([0]) },
      { quizId: "quiz-fund-1", answers: [[-5, 99]] },
    ]) {
      const res = await request.fetch("/api/quiz", { method: "POST", data: bad });
      expect([400, 422]).toContain(res.status());
    }
  });

  test("XSS-style display names are rejected at registration", async ({ request }) => {
    const res = await request.fetch("/api/auth/register", {
      method: "POST",
      data: { email: `xss-${Date.now()}@t.dev`, displayName: "<img src=x onerror=alert(1)>", password: "password123" },
    });
    expect(res.status()).toBe(422); // zod displayName charset rejects <>
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("<img");
  });

  test("student cannot hit admin APIs or pages", async ({ page, request }) => {
    const res = await request.fetch("/admin/users", { failOnStatusCode: false, maxRedirects: 0 });
    expect([307, 403, 404]).toContain(res.status());
    expect(res.headers()["location"] ?? "").not.toBe("/admin/users");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("responsive sanity", () => {
  const PAGES = ["/dashboard", "/academy", "/lab/train-the-machine", "/missions", "/settings"];
  test.use({ storageState: DEMO_STATE });

  for (const width of [320, 768, 1280]) {
    test(`no horizontal scroll on key pages at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const p of PAGES) {
        await page.goto(p);
        await page.waitForLoadState("networkidle");
        const report = await page.evaluate(() => {
          const docW = document.documentElement.clientWidth;
          const bad: string[] = [];
          document.querySelectorAll("*").forEach((el) => {
            const r = (el as HTMLElement).getBoundingClientRect();
            const sw = (el as HTMLElement).scrollWidth;
            if (r.width > docW + 1 || r.right > docW + 1 || sw > docW + 1) {
              bad.push(`${el.tagName}.${String((el as HTMLElement).className).slice(0, 70)} w=${Math.round(r.width)} sw=${sw} right=${Math.round(r.right)} text=${String((el as HTMLElement).firstChild && (el as HTMLElement).firstChild!.nodeType === 3 ? (el as HTMLElement).firstChild!.textContent : "").slice(0, 30)}`);
            }
          });
          return { overflow: document.documentElement.scrollWidth - docW, bad: bad.slice(0, 12) };
        });
        if (report.overflow > 1) {
          const cols = await page.evaluate(() => {
            const col = document.querySelector(".lg\\:col-span-2");
            if (!col) return ["no col found"];
            return Array.from(col.children).map((c) => `${c.tagName} w=${Math.round(c.getBoundingClientRect().width)} sw=${(c as HTMLElement).scrollWidth}`);
          });
          console.log("COLUMN PROBE @320:", cols.join("\n"));
        }
        expect(report.overflow, `${p} overflows at ${width}px; culprits: ${report.bad.join(" | ")}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("AI features degrade honestly when unconfigured", () => {
  test.use({ storageState: DEMO_STATE });

  test("tutor endpoint answers 503 without a Gemini key", async ({ request }) => {
    // The Playwright server runs with GEMINI_API_KEY cleared (see playwright.config.ts)
    const res = await request.fetch("/api/ai/tutor", {
      method: "POST",
      data: { lessonId: "fund-what-is-ai", question: "What is a model?" },
    });
    expect(res.status()).toBe(503);
    const body = await res.json();
    expect(body.reason).toBe("unconfigured");
  });

  test("coach endpoint answers 503 without a Gemini key", async ({ request }) => {
    const res = await request.fetch("/api/ai/coach", {
      method: "POST",
      data: { prompt: "explain cells to a 9th grader" },
    });
    expect(res.status()).toBe(503);
  });
});
