import { test, expect, type Page } from "@playwright/test";

/**
 * E2E coverage for the two coexisting Academy experiences:
 *
 *  ACADEMY (original)      - untouched legacy text/quiz academy at /academy/...
 *  ACADEMY (NEW)           - the Module 1 course at /academy-new/...
 *
 * Navigation contract (global sidebar, palette, mobile): exactly one
 * "Academy" item -> /academy, immediately followed by exactly one
 * "Academy (New)" item -> /academy-new. No "Academy New"/"New Academy"
 * labels, no duplicates, and the two highlight states never bleed into
 * each other.
 *
 * Runs against the production build with the deterministic local backend
 * and no GEMINI_API_KEY (tutor tests exercise the honest "unavailable"
 * path). The YouTube player is never actually played in CI: the segment
 * regression tests verify the player shell's configuration (exact segment
 * boundaries, lesson-local timeline, custom controls) from the DOM.
 */

const ACADEMY_NEW = "/academy-new";
const LESSON1 = "/academy-new/module/1/lesson/welcome-to-machine-learning";
const LESSON2 = "/academy-new/module/1/lesson/the-ml-roadmap";

// Lesson 1 quiz auto-graded answers (repo-versioned content - q ids are stable).
const L1_QUIZ: { id: string; kind: "mcq" | "multi"; correct: number[] }[] = [
  { id: "q-m1-l1-1", kind: "mcq", correct: [1] },
  { id: "q-m1-l1-2", kind: "mcq", correct: [2] },
  { id: "q-m1-l1-3", kind: "mcq", correct: [1] },
  { id: "q-m1-l1-4", kind: "multi", correct: [0, 1, 3] },
  { id: "q-m1-l1-5", kind: "mcq", correct: [1] },
  { id: "q-m1-l1-6", kind: "mcq", correct: [1] },
];

async function answerQuizQuestion(
  page: Page,
  q: { id: string; kind: "mcq" | "multi" | "order" | "match"; correct: number[] },
) {
  const box = page.locator(`#q-${q.id}`);
  const role = q.kind === "multi" ? "checkbox" : "radio";
  for (const idx of q.correct) {
    await box.getByRole(role).nth(idx).click();
  }
}

/** Register a throwaway student + complete onboarding (returns to /dashboard). */
async function registerAndOnboard(page: Page, tag: string) {
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

// ── Navigation contract: one Academy + one Academy (New) ──────────────────

test.describe("Academy navigation contract", () => {
  test("sidebar shows Academy then Academy (New) - exactly once each, correctly linked", async ({ page }) => {
    await registerAndOnboard(page, "nav");
    await page.goto("/academy-new");

    const sidebar = page.getByRole("navigation", { name: "Primary" });
    const academy = sidebar.getByRole("link", { name: "Academy", exact: true });
    const academyNew = sidebar.getByRole("link", { name: "Academy (New)" });
    await expect(academy).toHaveAttribute("href", "/academy");
    await expect(academyNew).toHaveAttribute("href", "/academy-new");

    // Exactly one of each: no duplicate Academy items anywhere in the nav.
    expect(await sidebar.getByRole("link", { name: /^Academy/ }).count()).toBe(2);

    // Academy (New) sits immediately below Academy in the list.
    const links = await sidebar.getByRole("link").all();
    const hrefs = await Promise.all(links.map((l) => l.getAttribute("href")));
    const academyIdx = hrefs.indexOf("/academy");
    expect(academyIdx).toBeGreaterThan(-1);
    expect(hrefs[academyIdx + 1]).toBe("/academy-new");

    // The command palette agrees - one action for each Academy.
    await page.keyboard.press("Control+k");
    const palette = page.getByRole("listbox");
    await page.getByRole("combobox").fill("academy");
    await expect(palette.getByText("Open Academy", { exact: true })).toBeVisible();
    await expect(palette.getByText("Open Academy (New)", { exact: true })).toBeVisible();
    expect(await palette.getByText(/^Open Academy/).count()).toBe(2);
  });

  test("active state distinguishes the two academies and never double-highlights", async ({ page }) => {
    await registerAndOnboard(page, "active");
    const sidebar = page.getByRole("navigation", { name: "Primary" });
    const academy = sidebar.getByRole("link", { name: "Academy", exact: true });
    const academyNew = sidebar.getByRole("link", { name: "Academy (New)" });

    // On /academy-new/module/1 -> only Academy (New) is active.
    await page.goto("/academy-new/module/1");
    await expect(academyNew).toHaveAttribute("aria-current", "page");
    expect(await academy.getAttribute("aria-current")).toBeNull();

    // On an Academy (New) lesson -> still only Academy (New).
    await page.goto(LESSON1);
    await expect(academyNew).toHaveAttribute("aria-current", "page");
    expect(await academy.getAttribute("aria-current")).toBeNull();

    // On the legacy /academy -> only Academy is active.
    await page.goto("/academy");
    await expect(academy).toHaveAttribute("aria-current", "page");
    expect(await academyNew.getAttribute("aria-current")).toBeNull();

    // Mobile bottom bar carries both entries too.
    await page.setViewportSize({ width: 390, height: 844 });
    const bottom = page.getByRole("navigation", { name: "Quick" });
    await expect(bottom.getByRole("link", { name: "Academy", exact: true })).toBeVisible();
    await expect(bottom.getByRole("link", { name: "Academy (New)" })).toBeVisible();
  });

  test("legacy Academy remains the original text/quiz experience at /academy", async ({ page }) => {
    await registerAndOnboard(page, "legacy");
    await page.goto("/academy");
    // The original module hub, unchanged by the Academy (New) rollout.
    await expect(page.getByRole("heading", { name: "Academy", exact: true })).toBeVisible();
    await expect(page.getByText("Seven modules", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: /AI Fundamentals/ }).first()).toBeVisible();
    // A legacy lesson renders the original LessonView (step-based, text first).
    await page.goto("/academy/ai-fundamentals/what-is-ai");
    await expect(page.getByRole("heading", { name: "What Is AI?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Got it", exact: true })).toBeVisible();
  });
});

// ── Anonymous (public learning experience) ────────────────────────────────

test.describe("Academy (New) - anonymous visitors", () => {
  test("academy home, module overview and references load without an account", async ({ page }) => {
    await page.goto(ACADEMY_NEW);
    await expect(page.getByRole("heading", { name: "Academy", exact: true })).toBeVisible();
    await expect(page.getByText("AI & Machine Learning Foundations").first()).toBeVisible();
    // No Module 2 or "coming next" teasers anywhere (Module 1 only).
    expect(await page.getByText(/Module 2|Coming next/i).count()).toBe(0);

    await page.goto("/academy-new/module/1");
    await expect(page.getByRole("heading", { name: /AI & Machine Learning Foundations/ })).toBeVisible();
    for (const title of [
      "Welcome to Machine Learning",
      "The Machine Learning Roadmap",
      "Supervised vs. Unsupervised Learning",
      "Regression vs. Classification",
      "How Do We Know a Model Is Working?",
      "Training, Validation, and Testing",
      "Bias and Variance",
      "Overfitting and Generalization",
    ]) {
      await expect(page.getByRole("link", { name: new RegExp(title) }).first()).toBeVisible();
    }
    await expect(page.getByRole("link", { name: /the test/i }).first()).toBeVisible();
    expect(await page.getByText(/Module 2/i).count()).toBe(0);

    await page.goto("/academy-new/references");
    await expect(page.getByText("LunarTech").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Watch on YouTube/ })).toBeVisible();
    await expect(page.getByText("freeCodeCamp.org").first()).toBeVisible();
  });

  test("lesson 1 shows the custom player shell with the exact segment - never the full video", async ({ page }) => {
    await page.goto(LESSON1);
    const player = page.locator("[data-video-id]");

    // §56 regression: the exact source segment is configured - Lesson 1
    // starts at 09:09 (549s), not at the beginning of the 11-hour source.
    await expect(player).toHaveAttribute("data-video-id", "0oyDqO8PjIg");
    await expect(player).toHaveAttribute("data-segment-count", "1");
    await expect(player).toHaveAttribute("data-current-start", "549");
    await expect(player).toHaveAttribute("data-current-end", "1043");
    await expect(player).toHaveAttribute("data-lesson-seconds", "494");

    // The learner-facing timeline represents the lesson segment (8m 14s),
    // never the source video's full runtime.
    await expect(page.getByText("Lesson video · 8m 14s")).toBeVisible();
    expect(await page.getByText(/hours|11:|11h/i).count()).toBe(0);

    // No iframe is mounted before the student presses play.
    expect(await page.locator("iframe").count()).toBe(0);

    // Cognia's custom controls exist (disabled until playback starts).
    await expect(page.getByRole("button", { name: "Play the lesson video segments" })).toBeVisible();
    for (const name of [
      "Play",
      "Back 10 seconds",
      "Forward 10 seconds",
      "Previous segment",
      "Next segment",
      "Mute",
      "Fullscreen",
    ]) {
      await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /Playback speed 1 times/ })).toBeVisible();

    // Segment identity + source time are visible.
    await expect(page.getByText("What is Machine Learning?").first()).toBeVisible();
    await expect(page.getByText("9:09–17:23").first()).toBeVisible();

    // Creator credit sits directly below the video.
    const attribution = page.getByRole("complementary", { name: "Video source attribution" });
    await expect(attribution.getByText("LunarTech").first()).toBeVisible();
    await expect(attribution.getByRole("link", { name: /Watch original video/ })).toBeVisible();
  });

  test("lesson 2 is a five-segment playlist with per-segment attribution", async ({ page }) => {
    await page.goto(LESSON2);
    const player = page.locator("[data-video-id]");
    await expect(player).toHaveAttribute("data-segment-count", "5");
    await expect(player).toHaveAttribute("data-current-start", "1043");
    await expect(player).toHaveAttribute("data-current-end", "1335");
    // Segment 1 of 5 identity is shown; the total lesson timeline covers
    // all five segments (18:21 total = 1104s).
    await expect(page.getByText("Segment 1 of 5", { exact: false })).toBeVisible();
    await expect(page.getByText("Mathematics foundation").first()).toBeVisible();
    // Attribution lists every segment with its exact source time.
    const attribution = page.getByRole("complementary", { name: "Video source attribution" });
    for (const label of ["Mathematics foundation", "Statistics foundation", "Machine learning fundamentals", "Python foundation", "Introductory NLP"]) {
      await expect(attribution.getByText(label).first()).toBeVisible();
    }
  });

  test("checkpoints answer with explanations; video-tied data is present", async ({ page }) => {
    await page.goto(LESSON1);
    const cp = page.locator("#m1-l1-cp1");
    // The checkpoint is anchored to the video timeline.
    await expect(cp.getByText(/at 02:/)).toBeVisible();
    await expect(cp.getByText("Exactly right.")).toHaveCount(0);
    await cp.getByRole("radio").nth(1).click();
    await cp.getByRole("button", { name: "Check my answer" }).click();
    await expect(cp.getByText("Exactly right.")).toBeVisible();
    await expect(cp.getByText(/learning from examples/).first()).toBeVisible();
    await expect(cp.getByText("Answered correctly")).toBeVisible();

    // The player timeline carries checkpoint markers for every checkpoint.
    const player = page.locator("[data-video-id]");
    expect(await player.locator("span.bg-volt-400, span.bg-mint-400").count()).toBeGreaterThanOrEqual(3);
  });

  test("guest lesson quiz (6 auto-graded) gets honest feedback but is not saved", async ({ page }) => {
    await page.goto(LESSON1);
    for (const q of L1_QUIZ) {
      await answerQuizQuestion(page, q);
    }
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(page.getByText(/6\/6 correct/)).toBeVisible();
    await expect(page.getByText("Guest attempt — not saved.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
  });

  test("module test works in guest mode with full feedback", async ({ page }) => {
    await page.goto("/academy-new/module/1/test");
    await expect(page.getByRole("heading", { name: /Module 1 Test/ })).toBeVisible();
    await page.getByRole("button", { name: "Begin the test" }).click();
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
    await expect(page.getByText(/Guest attempts aren't recorded/i)).toBeVisible();
  });

  test("the AI tutor degrades gracefully when unavailable on this server", async ({ page }) => {
    await page.goto(LESSON1);
    await page.getByRole("button", { name: /Need a hand/i }).first().click();
    const panel = page.getByRole("dialog", { name: "Lesson learning assistant" });
    await expect(panel.getByText("Need a hand?")).toBeVisible();
    await panel.getByRole("button", { name: "Explain this simply" }).first().click();
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

  test("mobile: course sidebar collapses to a drawer and the app stays usable at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ACADEMY_NEW);
    await expect(page.getByRole("heading", { name: "Academy", exact: true })).toBeVisible();
    await page.goto(LESSON1);
    await expect(page.getByRole("button", { name: /^Lessons$/ })).toBeVisible();
    await page.getByRole("button", { name: /^Lessons$/ }).click();
    await expect(page.getByRole("dialog", { name: "Module 1 lessons" })).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Module 1 lessons" }).getByText("Bias and Variance"),
    ).toBeVisible();
    // Custom controls fit and remain visible on mobile.
    await expect(page.getByRole("button", { name: "Back 10 seconds" })).toBeVisible();
    // No horizontal overflow.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("academy API contracts: strict validation, safe failures, no anonymous mutations", async ({ request }) => {
    const r1 = await request.post("/api/academy/tutor", {
      data: { moduleId: "module-1", lessonId: "m1-l3", question: "What is supervised learning?" },
    });
    expect(r1.status()).toBe(503);
    const d1 = await r1.json();
    expect(d1.reason).toBe("unconfigured");
    expect(JSON.stringify(d1)).not.toContain("GROUNDING RULES");
    expect(JSON.stringify(d1)).not.toContain("system");

    const r2 = await request.post("/api/academy/tutor", {
      data: { moduleId: "module-9", question: "What is supervised learning?" },
    });
    expect(r2.status()).toBe(422);

    const r3 = await request.post("/api/academy/quiz", {
      data: { quizId: "quiz-m1-l1", answers: [[0]] },
    });
    expect(r3.status()).toBe(422);

    const r4 = await request.post("/api/academy/progress", {
      data: { lessonId: "m1-l1", sectionId: "m1-l1-cp1" },
    });
    expect(r4.status()).toBe(401);

    // Free responses require a valid, repo-versioned FRQ id. Anonymous
    // visitors get the graded feedback (guest mode) but nothing is saved.
    const r5 = await request.post("/api/academy/free-response", {
      data: { lessonId: "m1-l1", frqId: "fr-m1-l1-1", response: "too short" },
    });
    expect(r5.status()).toBe(422);
    const r6 = await request.post("/api/academy/free-response", {
      data: { lessonId: "m1-l1", frqId: "fr-m1-l1-1", response: "x".repeat(400) },
    });
    expect(r6.status()).toBe(200);
    const d6 = await r6.json();
    expect(d6.guest).toBe(true);
    expect(typeof d6.feedback?.score).toBe("number");
    // And an unknown FRQ id is rejected outright.
    const r7 = await request.post("/api/academy/free-response", {
      data: { lessonId: "m1-l1", frqId: "fr-m1-l1-99", response: "x".repeat(400) },
    });
    expect(r7.status()).toBe(404);
  });

  test("no console errors across all 8 lessons + module pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(ACADEMY_NEW);
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
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("Video source: LunarTech")).toBeVisible();
      await expect(page.getByRole("heading", { name: "References" })).toBeVisible();
      // The lesson sheet, checkpoint cards, quiz and FRQ all mount cleanly.
      await expect(page.getByRole("heading", { name: "What You Will Learn" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Core Idea" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Key Vocabulary" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Key Takeaways" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Checkpoints" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Lesson Quiz" })).toBeVisible();
      await expect(page.locator("[data-video-id]")).toBeVisible();
      expect(await page.getByText(/Module 2|Coming next/i).count()).toBe(0);
    }
    await page.goto("/academy-new/module/1/test");
    await page.goto("/academy-new/references");
    expect(errors).toEqual([]);
  });
});

// ── Authenticated students: shell + course sidebar + saved progress ──────

test.describe("Academy (New) - authenticated student", () => {
  test("global app shell + course sidebar are both visible; completion banks XP once", async ({ page }) => {
    await registerAndOnboard(page, "complete");

    await page.goto(LESSON1);
    // Global app shell stays visible (spec §5).
    const sidebar = page.getByRole("navigation", { name: "Primary" });
    await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Academy (New)" })).toHaveAttribute("aria-current", "page");
    // Course sidebar shows module progress + all 8 lessons + the test.
    const courseNav = page.getByRole("complementary", { name: "Course navigation" });
    await expect(courseNav.getByText("AI & Machine Learning Foundations")).toBeVisible();
    await expect(courseNav.getByText("0 / 8 lessons")).toBeVisible();
    await expect(courseNav.getByRole("link", { name: "Module Test" })).toBeVisible();

    // 1. Checkpoints (3 cards).
    for (const [cpId, correctIdx] of [
      ["m1-l1-cp1", 1],
      ["m1-l1-cp2", 1],
      ["m1-l1-cp3", 0],
    ] as const) {
      const cp = page.locator(`#${cpId}`);
      await cp.getByRole("radio").nth(correctIdx).click();
      await cp.getByRole("button", { name: "Check my answer" }).click();
      await expect(cp.getByText(/Answered/)).toBeVisible();
    }

    // 2. Quiz: perfect 6/6.
    for (const q of L1_QUIZ) {
      await answerQuizQuestion(page, q);
    }
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(page.getByText(/6\/6 correct/)).toBeVisible();

    // 3. Written reasoning: all four FRQs.
    for (let i = 0; i < 4; i++) {
      const section = page.getByRole("region", { name: "Written reasoning questions" });
      await section.locator("textarea").fill(
        "A machine learns by finding patterns in examples instead of following only rules someone " +
          "wrote. My music app probably learned from data about listening and skipping, so it can " +
          "predict and recommend what I will like next.",
      );
      await section.getByRole("button", { name: /Submit for feedback/ }).click();
      await expect(section.getByText("Feedback score (0-100)")).toBeVisible();
      if (i < 3) await section.getByRole("button", { name: "Next question" }).click();
    }

    // 4. Completion panel: XP banked exactly once.
    await expect(page.getByText("Lesson complete").first()).toBeVisible();
    await expect(page.getByText("+50 XP").first()).toBeVisible();

    // 5. Refresh: progress persists, no duplicate XP toast/award.
    await page.reload();
    await expect(page.getByText("Lesson complete").first()).toBeVisible();
    await expect(page.locator("#m1-l1-cp1").getByText(/Answered/)).toBeVisible();
    // Course sidebar now reflects 1/8 lessons.
    await expect(page.getByRole("complementary", { name: "Course navigation" }).getByText("1 / 8 lessons")).toBeVisible();
  });

  test("module test: a passing attempt shows the module completion state", async ({ page }) => {
    await registerAndOnboard(page, "test");
    await page.goto("/academy-new/module/1/test");
    await page.getByRole("button", { name: /Begin the test|Retake the test/ }).click();

    const mcqCorrect: Record<string, number> = {
      "t-m1-1": 1, "t-m1-2": 1, "t-m1-4": 2, "t-m1-5": 1, "t-m1-6": 2, "t-m1-7": 1,
      "t-m1-8": 1, "t-m1-9": 0, "t-m1-10": 1, "t-m1-12": 0, "t-m1-13": 1, "t-m1-14": 1,
      "t-m1-15": 1, "t-m1-17": 1, "t-m1-18": 1, "t-m1-20": 2,
    };
    for (const [qid, idx] of Object.entries(mcqCorrect)) {
      await page.locator(`#q-${qid}`).getByRole("radio").nth(idx).click();
    }
    for (const idx of [0, 1, 3]) await page.locator("#q-t-m1-3").getByRole("checkbox").nth(idx).click();
    for (const idx of [0, 1, 2, 3]) await page.locator("#q-t-m1-19").getByRole("checkbox").nth(idx).click();
    const selects = page.locator("#q-t-m1-11 select");
    for (let i = 0; i < 4; i++) {
      await selects.nth(i).selectOption({ index: i + 1 });
    }
    const orderBox = page.locator("#q-t-m1-16");
    const downBtn = orderBox.getByRole("button", { name: /Move "Evaluate once on the untouched test set" down/ });
    await downBtn.click();
    await downBtn.click();
    await downBtn.click();

    await page.getByRole("button", { name: "Submit test" }).click();
    await expect(page.getByText("Module test passed.")).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("Module complete")).toBeVisible();
    await expect(page.getByText("+150 XP earned for passing Module 1.")).toBeVisible();
    expect(await page.getByText(/Module 2/i).count()).toBe(0);

    await page.goto("/academy-new/module/1");
    await expect(page.getByText("module test passed", { exact: false }).first()).toBeVisible();
  });
});
