import { test, expect } from "@playwright/test";

/**
 * E2E coverage for the public Academy (Module 1):
 *  - anonymous visitors can learn, interact and get graded feedback
 *  - authenticated students get saved progress + idempotent XP
 *  - the module test works end to end, including the completion state
 *  - the AI tutor degrades gracefully when Gemini isn't configured
 *  - the pre-existing /academy area keeps working
 *
 * Runs against the production build with the deterministic local backend
 * and no GEMINI_API_KEY, so tutor tests exercise the honest "unavailable"
 * path (see playwright.config.ts).
 */

const ACADEMY = "/academy-new";
const LESSON1 = "/academy-new/module/1/lesson/welcome-to-machine-learning";

// Lesson 1 quiz correct answers (repo-versioned content - q ids are stable).
const L1_QUIZ: { id: string; kind: "mcq" | "multi"; correct: number[] }[] = [
  { id: "q-m1-l1-1", kind: "mcq", correct: [1] },
  { id: "q-m1-l1-2", kind: "mcq", correct: [2] },
  { id: "q-m1-l1-3", kind: "mcq", correct: [1] },
  { id: "q-m1-l1-4", kind: "multi", correct: [0, 1, 3] },
  { id: "q-m1-l1-5", kind: "mcq", correct: [1] },
];

async function answerQuizQuestion(
  page: import("@playwright/test").Page,
  q: { id: string; kind: "mcq" | "multi" | "order" | "match"; correct: number[] },
) {
  const box = page.locator(`#q-${q.id}`);
  if (q.kind === "mcq" || q.kind === "multi") {
    const role = q.kind === "mcq" ? "radio" : "checkbox";
    for (const idx of q.correct) {
      await box.getByRole(role).nth(idx).click();
    }
  }
}

// ── Anonymous (public learning experience) ────────────────────────────────

test.describe("Academy - anonymous visitors", () => {
  test("academy home, module overview and references load without an account", async ({ page }) => {
    await page.goto(ACADEMY);
    await expect(page.getByRole("heading", { name: "Academy", exact: true })).toBeVisible();
    await expect(page.getByText("AI & Machine Learning Foundations")).toBeVisible();
    await expect(page.getByText("Sign in to save progress", { exact: false })).toBeVisible();

    await page.goto("/academy-new/module/1");
    await expect(page.getByRole("heading", { name: /AI & Machine Learning Foundations/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Welcome to Machine Learning/ }).first()).toBeVisible();
    // 8 lesson rows + the module test card
    await expect(page.getByText("Overfitting and Generalization").first()).toBeVisible();

    await page.goto("/academy-new/references");
    await expect(page.getByText("LunarTech").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Watch on YouTube/ })).toBeVisible();
    await expect(page.getByText("freeCodeCamp.org").first()).toBeVisible();
  });

  test("lesson page shows the video facade, creator credit and original explanation", async ({ page }) => {
    await page.goto(LESSON1);
    // Video facade (no iframe until intent).
    await expect(page.getByRole("button", { name: /Play the lesson video segment/ })).toBeVisible();
    expect(await page.locator("iframe").count()).toBe(0);
    // Creator attribution is visible directly under the video block.
    const attribution = page.getByRole("complementary", { name: "Video source attribution" });
    await expect(attribution.getByText("Video source")).toBeVisible();
    await expect(attribution.getByText("LunarTech").first()).toBeVisible();
    await expect(attribution.getByRole("link", { name: /Watch the original video on YouTube/ })).toBeVisible();
    // Original explanation content is present without watching the video.
    await expect(page.getByText("Two ways to teach a computer")).toBeVisible();
    // References section at the bottom.
    await expect(page.getByRole("heading", { name: "References" })).toBeVisible();
  });

  test("checkpoints work for guests: interaction required, explanation after submit", async ({ page }) => {
    await page.goto(LESSON1);
    const cp = page.locator("#m1-l1-cp1");
    // Answer is not shown before the student commits.
    await expect(cp.getByText("Exactly right.")).toHaveCount(0);
    await cp.getByRole("radio").nth(1).click();
    await cp.getByRole("button", { name: "Check my answer" }).click();
    await expect(cp.getByText("Exactly right.")).toBeVisible();
    await expect(cp.getByText(/Machine learning is defined by learning from examples/)).toBeVisible();
    // The step counts as done even for a guest (client-side).
    await expect(cp.getByText("Done")).toBeVisible();
  });

  test("guest quiz submission gets honest feedback but is not saved", async ({ page }) => {
    await page.goto(LESSON1);
    for (const q of L1_QUIZ) {
      await answerQuizQuestion(page, q);
    }
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(page.getByText(/5\/5 correct/)).toBeVisible();
    await expect(page.getByText("Guest attempt — not saved.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
  });

  test("module test works in guest mode with full feedback", async ({ page }) => {
    await page.goto("/academy-new/module/1/test");
    await expect(page.getByRole("heading", { name: /Module 1 Test/ })).toBeVisible();
    await page.getByRole("button", { name: "Begin the test" }).click();
    // Answer every question, then submit. Ordering questions just need one
    // move to count as engaged (the arrangement is the answer).
    const count = await page.locator("li[id^='q-t-m1-']").count();
    expect(count).toBe(20);
    for (let i = 0; i < count; i++) {
      const box = page.locator("li[id^='q-t-m1-']").nth(i);
      const radios = box.getByRole("radio");
      if ((await radios.count()) > 0) await radios.first().click();
      const checks = box.getByRole("checkbox");
      if ((await checks.count()) > 0) await checks.first().click();
      const selects = box.locator("select");
      if ((await selects.count()) > 0) {
        for (let s = 0; s < (await selects.count()); s++) {
          await selects.nth(s).selectOption({ index: 1 });
        }
      }
      const moveBtns = box.getByRole("button", { name: /Move .* down/ });
      if ((await moveBtns.count()) > 0) {
        // click the first enabled "down" button (the top row's down)
        for (let b = 0; b < (await moveBtns.count()); b++) {
          const btn = moveBtns.nth(b);
          if (await btn.isEnabled()) {
            await btn.click();
            break;
          }
        }
      }
    }
    await page.getByRole("button", { name: "Submit test" }).click();
    // Guest attempts are graded but flagged as unsaved.
    await expect(page.getByText(/Guest attempts aren't recorded/i)).toBeVisible();
  });

  test("the AI tutor degrades gracefully when unavailable on this server", async ({ page }) => {
    await page.goto(LESSON1);
    await page.getByRole("button", { name: /Ask about this lesson/ }).click();
    const panel = page.getByLabel("Lesson learning assistant");
    await panel.getByRole("button", { name: "Explain this more simply" }).first().click();
    // No GEMINI_API_KEY on the e2e server -> honest unavailable state.
    await expect(
      panel.getByText(/isn't enabled on this server right now|could not be answered right now/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test("keyboard navigation completes a checkpoint without a mouse", async ({ page }) => {
    await page.goto(LESSON1);
    const cp = page.locator("#m1-l1-cp1");
    await cp.getByRole("radio").nth(0).focus();
    await page.keyboard.press("Enter");
    await expect(cp.getByRole("radio").nth(0)).toHaveAttribute("aria-checked", "true");
    await cp.getByRole("button", { name: "Check my answer" }).focus();
    await page.keyboard.press("Enter");
    await expect(cp.getByText(/Not quite\.|Exactly right\./)).toBeVisible();
  });

  test("mobile layout stays usable at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ACADEMY);
    await expect(page.getByRole("heading", { name: "Academy", exact: true })).toBeVisible();
    await page.goto(LESSON1);
    await expect(page.getByRole("button", { name: /All lessons/ })).toBeVisible();
    await page.getByRole("button", { name: /All lessons/ }).click();
    await expect(page.getByRole("dialog", { name: "Module 1 lessons" })).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Module 1 lessons" }).getByText("Bias and Variance"),
    ).toBeVisible();
  });

  test("academy API contracts: strict validation, safe failures, no anonymous mutations", async ({ request }) => {
    // Tutor without a Gemini key on this server: honest 503, safe message,
    // never an internal prompt or infrastructure detail.
    const r1 = await request.post("/api/academy/tutor", {
      data: { moduleId: "module-1", lessonId: "m1-l3", question: "What is supervised learning?" },
    });
    expect(r1.status()).toBe(503);
    const d1 = await r1.json();
    expect(d1.reason).toBe("unconfigured");
    expect(d1.error).toContain("assistant");
    expect(JSON.stringify(d1)).not.toContain("GROUNDING RULES");
    expect(JSON.stringify(d1)).not.toContain("system");

    // Unknown module -> rejected by the schema (no arbitrary module access).
    const r2 = await request.post("/api/academy/tutor", {
      data: { moduleId: "module-9", question: "What is supervised learning?" },
    });
    expect(r2.status()).toBe(422);

    // Malformed quiz payload -> 422, never a crash or partial grading.
    const r3 = await request.post("/api/academy/quiz", {
      data: { quizId: "quiz-m1-l1", answers: [[0]] },
    });
    expect(r3.status()).toBe(422);

    // Anonymous users can never mutate student progress.
    const r4 = await request.post("/api/academy/progress", {
      data: { lessonId: "m1-l1", sectionId: "m1-l1-cp1" },
    });
    expect(r4.status()).toBe(401);

    // Free-response enforces its length floor before any AI work.
    const r5 = await request.post("/api/academy/free-response", {
      data: { lessonId: "m1-l1", response: "too short" },
    });
    expect(r5.status()).toBe(422);
  });

  test("no console errors across the public academy", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(ACADEMY);
    await page.goto("/academy-new/module/1");
    const LESSON_SLUGS = [
      "welcome-to-machine-learning",
      "the-ml-roadmap",
      "supervised-vs-unsupervised",
      "regression-vs-classification",
      "how-do-we-know-a-model-is-working",
      "training-validation-and-testing",
      "bias-and-variance",
      "overfitting-and-generalization",
    ];
    for (const slug of LESSON_SLUGS) {
      await page.goto(`/academy-new/module/1/lesson/${slug}`);
      // Every lesson renders its title + creator credit + references.
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("Video source: LunarTech")).toBeVisible();
      await expect(page.getByRole("heading", { name: "References" })).toBeVisible();
      // And the interactive exercise + quiz mounts without hydration errors.
      await expect(page.getByRole("button", { name: /Play the lesson video segment/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Check my answer|Begin the test|Submit quiz|Choose/ }).first()).toBeVisible();
    }
    await page.goto("/academy-new/module/1/test");
    await page.goto("/academy-new/references");
    expect(errors).toEqual([]);
  });
});

// ── Authenticated students: saved progress + trusted XP ──────────────────

/**
 * Each authenticated test registers a FRESH user rather than reusing the
 * shared demo account: these tests award XP, and mutating a user that other
 * parallel spec files also read (e.g. security's XP-forging snapshot test)
 * would create cross-worker races.
 */
async function registerAndOnboard(page: import("@playwright/test").Page, tag: string) {
  const email = `academy-${tag}-${Date.now()}@test.dev`;
  await page.goto("/register");
  await page.getByLabel("Display name").fill("Academy E2E");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: /Create account/i }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByRole("button", { name: /Begin setup/i }).click();
  await page.getByRole("button", { name: /Coding Enthusiast/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Learn machine learning/ }).click();
  await page.getByRole("button", { name: /See your roadmap/i }).click();
  await page.getByRole("button", { name: /Enter Cognia Quest/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("Academy - authenticated student", () => {
  test("completing a lesson banks XP once and persists after refresh", async ({ page }) => {
    await registerAndOnboard(page, "lesson");
    await page.goto(LESSON1);

    // 1. Checkpoints (3).
    for (const [cpId, correctIdx] of [
      ["m1-l1-cp1", 1],
      ["m1-l1-cp2", 1],
      ["m1-l1-cp3", 0],
    ] as const) {
      const cp = page.locator(`#${cpId}`);
      await cp.getByRole("radio").nth(correctIdx).click();
      await cp.getByRole("button", { name: "Check my answer" }).click();
      await expect(cp.getByText("Done")).toBeVisible();
    }

    // 2. Activity: six situations, correct choice + Next each time.
    const activity = page.getByLabel(/Spot the machine learning/i);
    const choices = [0, 1, 2, 3, 0, 1];
    for (let i = 0; i < choices.length; i++) {
      await activity.getByRole("radio").nth(choices[i]).click();
      if (i < choices.length - 1) {
        await activity.getByRole("button", { name: /Next situation/ }).click();
      }
    }
    await expect(activity.getByText("Activity complete.")).toBeVisible();

    // 3. Lesson quiz: perfect answers.
    for (const q of L1_QUIZ) {
      await answerQuizQuestion(page, q);
    }
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(page.getByText(/5\/5 correct/)).toBeVisible();

    // 4. Free response (deterministic feedback without a configured AI).
    const fr = page.getByLabel("Free response question");
    await fr.locator("textarea").fill(
      "A machine learns by finding patterns in examples instead of following only rules someone wrote. " +
        "My music app probably learned from data about what I listen to and skip, so it can predict and recommend songs I will like.",
    );
    await fr.getByRole("button", { name: /Submit for feedback/ }).click();
    await expect(fr.getByText("Feedback score (0-100)")).toBeVisible();

    // 5. Completion panel: XP banked exactly once.
    const completion = page.getByText("Lesson complete").first();
    await expect(completion).toBeVisible();
    await expect(page.getByText("+50 XP").first()).toBeVisible();

    // 6. Refresh: progress persists, XP not re-awarded (no duplicate toast).
    await page.reload();
    await expect(page.getByText("Lesson complete").first()).toBeVisible();
    await expect(page.locator("#m1-l1-cp1").getByText("Done")).toBeVisible();
    await expect(page.getByText(/5\/5 correct/)).toBeHidden();
    // The step counter shows 100%.
    await expect(page.getByText("100%").first()).toBeVisible();
  });

  test("module test: a passing attempt shows the module completion state", async ({ page }) => {
    await registerAndOnboard(page, "test");
    await page.goto("/academy-new/module/1/test");
    await page.getByRole("button", { name: /Begin the test|Retake the test/ }).click();

    // Answers for all 20 questions (repo-versioned content).
    const mcqCorrect: Record<string, number> = {
      "t-m1-1": 1, "t-m1-2": 1, "t-m1-4": 2, "t-m1-5": 1, "t-m1-6": 2, "t-m1-7": 1,
      "t-m1-8": 1, "t-m1-9": 0, "t-m1-10": 1, "t-m1-12": 0, "t-m1-13": 1, "t-m1-14": 1,
      "t-m1-15": 1, "t-m1-17": 1, "t-m1-18": 1, "t-m1-20": 2,
    };
    for (const [qid, idx] of Object.entries(mcqCorrect)) {
      await page.locator(`#q-${qid}`).getByRole("radio").nth(idx).click();
    }
    // multi: t-m1-3 [0,1,3], t-m1-19 [0,1,2,3]
    for (const idx of [0, 1, 3]) await page.locator("#q-t-m1-3").getByRole("checkbox").nth(idx).click();
    for (const idx of [0, 1, 2, 3]) await page.locator("#q-t-m1-19").getByRole("checkbox").nth(idx).click();
    // match: t-m1-11 - each left row matches the right option at the same index.
    const selects = page.locator("#q-t-m1-11 select");
    for (let i = 0; i < 4; i++) {
      await selects.nth(i).selectOption({ index: i + 1 }); // +1: first option is the placeholder
    }
    // order: t-m1-16 - move "Evaluate once on the untouched test set" (first
    // item) down 3 times: [0,1,2,3] -> [1,2,3,0] which is the correct order.
    const orderBox = page.locator("#q-t-m1-16");
    const downBtn = orderBox.getByRole("button", { name: /Move "Evaluate once on the untouched test set" down/ });
    await downBtn.click();
    await downBtn.click();
    await downBtn.click();

    await page.getByRole("button", { name: "Submit test" }).click();
    await expect(page.getByText("Module test passed.")).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("Module complete")).toBeVisible();
    await expect(page.getByText("+150 XP earned for passing Module 1.")).toBeVisible();

    // The overview reflects the pass after a reload.
    await page.goto("/academy-new/module/1");
    await expect(page.getByText("module test passed", { exact: false }).first()).toBeVisible();
  });

  test("the pre-existing /academy route still works", async ({ page }) => {
    await registerAndOnboard(page, "legacy");
    await page.goto("/academy");
    await expect(page.getByRole("heading", { name: "Academy" })).toBeVisible();
    await expect(page.getByText("AI Fundamentals").first()).toBeVisible();
  });
});
