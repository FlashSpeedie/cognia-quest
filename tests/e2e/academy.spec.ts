import { test, expect, type Page } from "@playwright/test";
import { LESSONS } from "../../content/academy/module-1/lessons";
import { LESSON_QUIZZES } from "../../content/academy/module-1/questions";
import type { AcademyLesson, AcademyQuestion } from "../../content/academy/types";

/**
 * E2E coverage for the two coexisting Academy experiences:
 *
 *  ACADEMY (original)      - untouched legacy text/quiz academy at /academy/...
 *  ACADEMY (NEW)           - the Module 1 course at /academy-new/..., now a
 *                            SEQUENTIAL lesson system: every lesson walks
 *                            through four sections (Video -> Lesson Sheet ->
 *                            References -> Quiz) selected with ?section=,
 *                            with a collapsible course sidebar, in-video
 *                            checkpoints, server-enforced locking and an
 *                            80% quiz pass mark.
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
 * boundaries, lesson-local timeline, custom controls) from the DOM, and
 * the in-video checkpoints are reached through the checkpoint strip.
 */

const ACADEMY_NEW = "/academy-new";
const LESSON1 = "/academy-new/module/1/lesson/welcome-to-machine-learning";
const LESSON2 = "/academy-new/module/1/lesson/the-ml-roadmap";
const LESSON3 = "/academy-new/module/1/lesson/supervised-vs-unsupervised";
const MODULE_TEST_URL = "/academy-new/module/1/test";
const REFERENCES_URL = "/academy-new/references";

// Lesson 1 quiz auto-graded answers (repo-versioned content - q ids are stable).
const L1_QUIZ: { id: string; kind: "mcq" | "multi"; correct: number[] }[] = [
  { id: "q-m1-l1-1", kind: "mcq", correct: [1] },
  { id: "q-m1-l1-2", kind: "mcq", correct: [2] },
  { id: "q-m1-l1-3", kind: "mcq", correct: [1] },
  { id: "q-m1-l1-4", kind: "multi", correct: [0, 1, 3] },
  { id: "q-m1-l1-5", kind: "mcq", correct: [1] },
  { id: "q-m1-l1-6", kind: "mcq", correct: [1] },
];

// Lesson 1 checkpoints: id -> index of the correct option.
const L1_CHECKPOINTS: { id: string; correct: number }[] = [
  { id: "m1-l1-cp1", correct: 1 },
  { id: "m1-l1-cp2", correct: 1 },
  { id: "m1-l1-cp3", correct: 0 },
];

const FRQ_SAMPLE =
  "A machine learns by finding patterns in examples instead of following only rules someone " +
  "wrote. My music app probably learned from data about listening and skipping, so it can " +
  "predict and recommend what I will like next.";

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

/** Open a checkpoint from the strip inside the player, answer, continue. */
async function answerCheckpoint(page: Page, cpId: string, optionIndex: number) {
  await page.locator(`[data-checkpoint-chip="${cpId}"]`).click();
  const overlay = page.locator(`[data-checkpoint-overlay="${cpId}"]`);
  await expect(overlay).toBeVisible();
  await overlay.getByRole("radio").nth(optionIndex).click();
  await overlay.getByRole("button", { name: "Check my answer" }).click();
  await expect(overlay.getByText(/Exactly right\.|Not quite\./)).toBeVisible();
  await overlay.getByRole("button", { name: "Continue video" }).click();
  await expect(overlay).toHaveCount(0);
}

/** Perfect answers for a quiz, computed from the repo-versioned content. */
function perfectAnswers(questions: AcademyQuestion[]): number[][] {
  return questions.map((q) => (q.kind === "mcq" ? [q.correct] : [...q.correct]));
}

/** Fully complete one lesson over the progress + quiz APIs (page session). */
async function seedLessonCompletion(page: Page, lesson: AcademyLesson) {
  const quiz = LESSON_QUIZZES.find((q) => q.id === lesson.quizId)!;
  const steps = lesson.requiredSectionIds.filter((id) => id !== `${lesson.meta.id}-quiz`);
  for (const sectionId of steps) {
    const res = await page.request.post("/api/academy/progress", {
      data: { lessonId: lesson.meta.id, sectionId },
    });
    expect(res.ok()).toBeTruthy();
  }
  const res = await page.request.post("/api/academy/quiz", {
    data: { quizId: quiz.id, answers: perfectAnswers(quiz.questions) },
  });
  expect(res.ok()).toBeTruthy();
}

/** Walk the whole UI flow through one lesson's Video section gates. */
async function passVideoSection(page: Page) {
  for (const cp of L1_CHECKPOINTS) {
    await answerCheckpoint(page, cp.id, cp.correct);
  }
  await expect(page.locator("[data-checkpoint-strip]")).toContainText("3 of 3 answered");
  await page.locator("[data-section-nav] a[data-next-section]").click();
  await expect(page).toHaveURL(new RegExp(`${LESSON1}\\?section=lesson$`));
}

async function passWrittenReasoning(page: Page) {
  for (let i = 0; i < 4; i++) {
    const section = page.locator("[data-quiz-phase='written']");
    await section.locator("textarea").fill(FRQ_SAMPLE);
    await section.getByRole("button", { name: /Submit for feedback/ }).click();
    await expect(section.getByText("Feedback score (0-100)")).toBeVisible();
    if (i < 3) {
      await section.getByRole("button", { name: "Next question" }).click();
    }
  }
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

    await page.goto(REFERENCES_URL);
    await expect(page.getByText("LunarTech").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Watch on YouTube/ })).toBeVisible();
    await expect(page.getByText("freeCodeCamp.org").first()).toBeVisible();
  });

  test("a lesson is four separate sections; the video is first", async ({ page }) => {
    // Default lesson URL lands on the video - and ONLY the video.
    await page.goto(LESSON1);
    const player = page.locator("[data-video-id]");
    await expect(player).toBeVisible();
    await expect(page.locator("[data-video-credit]")).toContainText("Video source: LunarTech");
    await expect(page.locator("[data-section-indicator]")).toContainText("Section 1 of 4");
    await expect(page.getByRole("heading", { name: "What You Will Learn" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Lesson Quiz" })).toHaveCount(0);
    // The full source record is NOT repeated under the video.
    await expect(page.locator("[data-references-section]")).toHaveCount(0);

    // Lesson Sheet is its own section (Step 2 of 4), no player on it.
    await page.goto(`${LESSON1}?section=lesson`);
    await expect(page.locator("[data-section-indicator]")).toContainText("Section 2 of 4");
    await expect(page.getByRole("heading", { name: "What You Will Learn" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Core Idea" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Key Vocabulary" })).toBeVisible();
    await expect(page.locator("[data-video-id]")).toHaveCount(0);

    // References is its own section (Step 3 of 4): the one full citation.
    await page.goto(`${LESSON1}?section=references`);
    await expect(page.locator("[data-section-indicator]")).toContainText("Section 3 of 4");
    await expect(page.getByRole("heading", { name: "References" })).toBeVisible();
    await expect(page.locator("[data-references-section]")).toBeVisible();
    await expect(page.getByText("Primary video", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Watch on YouTube" })).toHaveCount(1);
    await expect(page.getByText("9:09\u201317:23").first()).toBeVisible();

    // Quiz is its own section (Step 4 of 4).
    await page.goto(`${LESSON1}?section=quiz`);
    await expect(page.locator("[data-section-indicator]")).toContainText("Section 4 of 4");
    await expect(page.getByRole("heading", { name: "Lesson Quiz" })).toBeVisible();
    await expect(
      page.getByText("10 questions: six auto-graded (1-6), four written-reasoning (7-10)"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Begin the quiz" })).toBeVisible();
    await expect(page.locator("[data-video-id]")).toHaveCount(0);
  });

  test("lesson 1 player shows the custom shell with the exact segment - never the full video", async ({ page }) => {
    await page.goto(LESSON1);
    const player = page.locator("[data-video-id]");

    // The exact source segment is configured - Lesson 1 starts at 09:09
    // (549s), not at the beginning of the 11-hour source.
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
    await expect(page.getByText("9:09\u201317:23").first()).toBeVisible();

    // Compact creator credit sits directly below the video.
    await expect(page.locator("[data-video-credit]")).toContainText("Video source: LunarTech");
  });

  test("checkpoints live inside the video flow - no duplicate list below it", async ({ page }) => {
    await page.goto(LESSON1);

    // No standalone checkpoint section anywhere on the section page.
    await expect(page.getByRole("heading", { name: "Checkpoints", exact: true })).toHaveCount(0);
    await expect(page.getByText("Review later")).toHaveCount(0);

    // The strip inside the player carries one chip per checkpoint.
    const strip = page.locator("[data-checkpoint-strip]");
    await expect(strip).toContainText("0 of 3 answered");
    await expect(page.locator("[data-checkpoint-chip='m1-l1-cp1']")).toBeVisible();

    // Opening a checkpoint pauses the video: dialog, question, feedback.
    await page.locator("[data-checkpoint-chip='m1-l1-cp1']").click();
    const overlay = page.locator("[data-checkpoint-overlay='m1-l1-cp1']");
    await expect(overlay).toBeVisible();
    await expect(overlay.getByText("Paused · Checkpoint")).toBeVisible();
    await expect(
      overlay.getByText("Which sentence best describes how a machine learning system gets its behavior?"),
    ).toBeVisible();
    await expect(overlay.getByRole("button", { name: "Check my answer" })).toBeDisabled();
    await expect(overlay.getByRole("button", { name: "Rewatch segment" })).toBeVisible();

    // Answer wrong first: feedback + Try again + Rewatch, no bypass.
    await overlay.getByRole("radio").nth(0).click();
    await overlay.getByRole("button", { name: "Check my answer" }).click();
    await expect(overlay.getByText("Not quite.")).toBeVisible();
    await overlay.getByRole("button", { name: "Try again" }).click();
    await expect(overlay.getByText("Not quite.")).toHaveCount(0);

    // Now answer correctly and continue the video.
    await overlay.getByRole("radio").nth(1).click();
    await overlay.getByRole("button", { name: "Check my answer" }).click();
    await expect(overlay.getByText("Exactly right.")).toBeVisible();
    await expect(overlay.getByText(/learning from examples/).first()).toBeVisible();
    await overlay.getByRole("button", { name: "Continue video" }).click();
    await expect(overlay).toHaveCount(0);

    // The strip reflects the answer (chip marked answered).
    await expect(strip).toContainText("1 of 3 answered");
    await expect(page.locator("[data-checkpoint-chip='m1-l1-cp1']")).toHaveAttribute("aria-label", /answered/);

    // The player timeline carries checkpoint markers for every checkpoint.
    expect(await page.locator("[data-video-id] span.bg-volt-400, [data-video-id] span.bg-mint-400").count()).toBeGreaterThanOrEqual(3);
  });

  test("keyboard navigation completes a checkpoint without a mouse", async ({ page }) => {
    await page.goto(LESSON1);
    await page.locator("[data-checkpoint-chip='m1-l1-cp1']").focus();
    await page.keyboard.press("Enter");
    const overlay = page.locator("[data-checkpoint-overlay='m1-l1-cp1']");
    await expect(overlay).toBeFocused();

    // Tab reaches the options; select + submit entirely by keyboard.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await overlay.getByRole("button", { name: "Check my answer" }).focus();
    await page.keyboard.press("Enter");
    await expect(overlay.getByText(/Not quite\.|Exactly right\./)).toBeVisible();
  });

  test("guest lesson quiz: sequential flow with honest guest feedback", async ({ page }) => {
    await page.goto(`${LESSON1}?section=quiz`);
    await page.getByRole("button", { name: "Begin the quiz" }).click();

    // One question at a time, 10 total; questions 1-6 are auto-graded.
    await expect(page.locator("[data-quiz-phase='auto']")).toContainText("Question 1 of 10");
    for (const q of L1_QUIZ) {
      await answerQuizQuestion(page, q);
      if (q !== L1_QUIZ[L1_QUIZ.length - 1]) {
        await page.getByRole("button", { name: "Next question" }).click();
      }
    }
    await page.getByRole("button", { name: "Submit answers" }).click();
    await expect(page.getByText("Passed: 6/6 correct (100%)")).toBeVisible();
    await expect(page.getByText("Guest attempt, not saved.")).toBeVisible();

    // Continue into the written-reasoning half (question 7 of 10).
    await page.getByRole("button", { name: "Continue to written reasoning" }).click();
    const written = page.locator("[data-quiz-phase='written']");
    await expect(written).toContainText("Question 7 of 10");
    await written.locator("textarea").fill("x".repeat(400));
    await written.getByRole("button", { name: /Submit for feedback/ }).click();
    await expect(written.getByText("Feedback score (0-100)")).toBeVisible();
  });

  test("module test works in guest mode with full feedback", async ({ page }) => {
    await page.goto(MODULE_TEST_URL);
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
    const pill = page.locator("[data-tutor-open]");
    await expect(pill).toBeVisible();
    await pill.click();
    const panel = page.getByRole("dialog", { name: "Lesson learning assistant" });
    await expect(panel.getByText("Need a hand?")).toBeVisible();
    await panel.getByRole("button", { name: "Explain this simply" }).first().click();
    await expect(
      panel.getByText(/isn't enabled on this server right now|could not be answered right now/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test("mobile: course sidebar collapses to a drawer and the app stays usable at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ACADEMY_NEW);
    await expect(page.getByRole("heading", { name: "Academy", exact: true })).toBeVisible();
    await page.goto(LESSON1);
    await expect(page.getByRole("button", { name: /^Lessons$/ })).toBeVisible();
    await page.getByRole("button", { name: /^Lessons$/ }).click();
    const drawer = page.getByRole("dialog", { name: "Module 1 lessons" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("AI & Machine Learning Foundations")).toBeVisible();
    await expect(drawer.getByText("Bias and Variance")).toBeVisible();
    // The current lesson's four sections are expanded inside the drawer.
    await expect(drawer.locator("[data-section-link='video']")).toBeVisible();
    await expect(drawer.locator("[data-section-link='quiz']")).toBeVisible();

    // Custom controls fit and remain visible on mobile.
    await expect(page.getByRole("button", { name: "Back 10 seconds" })).toBeVisible();

    // Need a hand? stays anchored bottom-right, above the bottom nav.
    const pill = page.locator("[data-tutor-open]");
    await expect(pill).toBeVisible();
    const vp = page.viewportSize()!;
    const box = (await pill.boundingBox())!;
    expect(box.x + box.width).toBeGreaterThan(vp.width - 24);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
    expect(box.y).toBeGreaterThan(vp.height / 2);

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

  test("no console errors across all 8 lessons and all 4 sections of each", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(ACADEMY_NEW);
    await page.goto("/academy-new/module/1");
    const LESSON_SLUGS = LESSONS.map((l) => l.meta.slug);
    for (const slug of LESSON_SLUGS) {
      const base = `/academy-new/module/1/lesson/${slug}`;
      await page.goto(base);
      await expect(page.locator("[data-video-id]")).toBeVisible();
      await expect(page.locator("[data-video-credit]")).toContainText("Video source: LunarTech");
      await page.goto(`${base}?section=lesson`);
      await expect(page.getByRole("heading", { name: "What You Will Learn" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Core Idea" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Key Takeaways" })).toBeVisible();
      await page.goto(`${base}?section=references`);
      await expect(page.getByRole("heading", { name: "References" })).toBeVisible();
      await page.goto(`${base}?section=quiz`);
      await expect(page.getByRole("heading", { name: "Lesson Quiz" })).toBeVisible();
      expect(await page.getByText(/Module 2|Coming next/i).count()).toBe(0);
    }
    await page.goto(MODULE_TEST_URL);
    await page.goto(REFERENCES_URL);
    expect(errors).toEqual([]);
  });
});

// ── Authenticated students: sequential course + saved progress ────────────

test.describe("Academy (New) - sequential lesson system", () => {
  test("global app shell + collapsible course sidebar; locks until prerequisites complete", async ({ page }) => {
    await registerAndOnboard(page, "sidebar");

    await page.goto(LESSON1);
    // Global app shell stays visible (spec §3).
    const sidebar = page.getByRole("navigation", { name: "Primary" });
    await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Academy (New)" })).toHaveAttribute("aria-current", "page");

    // Course sidebar: module tree with all 8 lessons + the locked test.
    const courseNav = page.getByRole("complementary", { name: "Course navigation" });
    await expect(courseNav.getByText("AI & Machine Learning Foundations")).toBeVisible();
    await expect(courseNav.getByText("0 / 8 lessons complete")).toBeVisible();

    // Future lessons are locked (aria-disabled, no links).
    const l2 = courseNav.locator("[data-locked-lesson='the-ml-roadmap']");
    await expect(l2).toHaveAttribute("aria-disabled", "true");
    await expect(courseNav.locator("[data-locked-lesson='supervised-vs-unsupervised']")).toBeVisible();
    await expect(courseNav.locator("[data-locked-module-test]")).toHaveAttribute("aria-disabled", "true");

    // The current lesson is expanded with its four sections; quiz is locked.
    await expect(courseNav.locator("[data-section-link='video']")).toBeVisible();
    await expect(courseNav.locator("[data-locked-section='lesson']")).toHaveAttribute("aria-disabled", "true");
    await expect(courseNav.locator("[data-locked-section='quiz']")).toHaveAttribute("aria-disabled", "true");

    // Module tree collapses and expands.
    const moduleToggle = courseNav.locator("[data-module-toggle]");
    await expect(moduleToggle).toHaveAttribute("aria-expanded", "true");
    await moduleToggle.click();
    await expect(moduleToggle).toHaveAttribute("aria-expanded", "false");
    await expect(courseNav.locator("[data-locked-lesson='the-ml-roadmap']")).toHaveCount(0);
    await moduleToggle.click();
    await expect(courseNav.locator("[data-locked-lesson='the-ml-roadmap']")).toBeVisible();

    // The current lesson's section list collapses and expands too.
    const lessonToggle = courseNav.locator("[data-current-lesson-toggle]");
    await expect(lessonToggle).toHaveAttribute("aria-expanded", "true");
    await lessonToggle.click();
    await expect(lessonToggle).toHaveAttribute("aria-expanded", "false");
    await expect(courseNav.locator("[data-section-link='video']")).toHaveCount(0);
    await lessonToggle.click();
    await expect(courseNav.locator("[data-section-link='video']")).toBeVisible();
  });

  test("full sequential flow: video gates, sections, quiz pass, unlock next lesson", async ({ page }) => {
    test.slow();
    await registerAndOnboard(page, "flow");
    await page.goto(LESSON1);
    const courseNav = page.getByRole("complementary", { name: "Course navigation" });

    // 1. Video first: Next is gated until every checkpoint is answered.
    await expect(page.locator("[data-gated-next]")).toBeVisible();
    await expect(page.locator("[data-section-nav]")).toContainText("Answer every checkpoint during the video (0 of 3)");
    await passVideoSection(page);

    // 2. Lesson Sheet (Step 2): study material, then Next marks it done.
    await expect(page.getByRole("heading", { name: "What You Will Learn" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Key Takeaways" })).toBeVisible();
    // The optional enrichment exercise lives at the end of the sheet.
    await expect(page.getByRole("region", { name: /Spot the machine learning/ })).toBeVisible();

    await page.locator("[data-section-nav] a[data-next-section]").click();
    await expect(page).toHaveURL(new RegExp(`${LESSON1}\\?section=references$`));

    // Browser back returns to the Lesson Sheet (spec §38), forward to References.
    await page.goBack();
    await expect(page.getByRole("heading", { name: "What You Will Learn" })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole("heading", { name: "References" })).toBeVisible();

    // 3. References (Step 3): the one canonical citation.
    await expect(page.getByRole("heading", { name: "References" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Watch on YouTube" })).toHaveCount(1);
    await expect(page.getByText("LunarTech").first()).toBeVisible();

    await page.locator("[data-section-nav] a[data-next-section]").click();
    await expect(page).toHaveURL(new RegExp(`${LESSON1}\\?section=quiz$`));

    // 4. Quiz (Step 4): fail first - "Review and try again", lesson stays locked.
    await page.getByRole("button", { name: "Begin the quiz" }).click();
    for (const q of L1_QUIZ) {
      // Deliberately wrong answers for questions 1 and 2 (0-indexed 0, 1).
      if (q.id === "q-m1-l1-1" || q.id === "q-m1-l1-2") {
        await page.locator(`#q-${q.id}`).getByRole("radio").nth(0).click();
      } else {
        await answerQuizQuestion(page, q);
      }
      if (q.id !== "q-m1-l1-6") {
        await page.getByRole("button", { name: "Next question" }).click();
      }
    }
    await page.getByRole("button", { name: "Submit answers" }).click();
    await expect(page.getByText(/Not yet: 4\/6 correct \(67%\)/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Review and try again" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Show answer review" })).toBeVisible();
    await expect(courseNav.locator("[data-locked-lesson='the-ml-roadmap']")).toBeVisible();
    await expect(page.locator("[data-completion-panel]")).toHaveCount(0);

    // Review answers are shown with explanations.
    await page.getByRole("button", { name: "Show answer review" }).click();
    await expect(page.getByText("Review this:", { exact: false }).first()).toBeVisible();

    // 5. Retry and pass: 6/6.
    await page.getByRole("button", { name: "Review and try again" }).click();
    await expect(page.locator("[data-quiz-phase='auto']")).toContainText("Question 1 of 10");
    for (const q of L1_QUIZ) {
      await answerQuizQuestion(page, q);
      if (q.id !== "q-m1-l1-6") {
        await page.getByRole("button", { name: "Next question" }).click();
      }
    }
    await page.getByRole("button", { name: "Submit answers" }).click();
    await expect(page.getByText("Passed: 6/6 correct (100%)")).toBeVisible();

    // 6. Written reasoning (7-10), then the lesson-complete pass screen.
    await page.getByRole("button", { name: "Continue to written reasoning" }).click();
    await passWrittenReasoning(page);

    const panel = page.locator("[data-completion-panel]");
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Lesson complete")).toBeVisible();
    await expect(panel.getByText("+50 XP")).toBeVisible();
    await expect(panel.getByRole("link", { name: /Next lesson: The Machine Learning Roadmap/ })).toBeVisible();

    // The sidebar flips live: current lesson complete, next lesson unlocked,
    // 1/8 done, later lessons still locked, module test still locked.
    await expect(courseNav.getByText("1 / 8 lessons complete")).toBeVisible();
    await expect(courseNav.locator("[data-lesson-link='the-ml-roadmap']")).toBeVisible();
    await expect(courseNav.locator("[data-locked-lesson='supervised-vs-unsupervised']")).toBeVisible();
    await expect(courseNav.locator("[data-locked-module-test]")).toBeVisible();

    // 7. Next lesson is reachable and shows its own video section.
    await panel.getByRole("link", { name: /Next lesson/ }).click();
    await expect(page.locator("[data-video-id]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "The Machine Learning Roadmap" })).toBeVisible();

    // 8. Deep-linking a locked lesson shows the friendly lock screen.
    await page.goto(LESSON3);
    await expect(page.locator("[data-locked-screen]")).toBeVisible();
    await expect(page.getByText("This lesson is locked for now")).toBeVisible();
    await expect(page.getByText(/Complete Lesson 2/)).toBeVisible();
    await expect(page.locator("[data-video-id]")).toHaveCount(0);
    await page.getByRole("link", { name: "Back to current lesson" }).click();
    await expect(page).toHaveURL(new RegExp("the-ml-roadmap"));
    await expect(page.locator("[data-video-id]")).toBeVisible();

    // 9. Refresh at the quiz deep link: completed state persists.
    await page.goto(`${LESSON1}?section=quiz`);
    await expect(page.locator("[data-completion-panel]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retake the quiz for practice" })).toBeVisible();
    await expect(courseNav.getByText("1 / 8 lessons complete")).toBeVisible();
    // Reviewing the completed lesson keeps every section open.
    await page.goto(`${LESSON1}?section=video`);
    await expect(page.locator("[data-video-id]")).toBeVisible();
    await expect(page.locator("[data-section-nav] a[data-next-section]")).toBeVisible();
  });

  test("module test stays locked until all 8 lessons are completed, then passes", async ({ page }) => {
    test.slow();
    await registerAndOnboard(page, "test");

    // Locked for a fresh student: friendly screen, no test content.
    await page.goto(MODULE_TEST_URL);
    await expect(page.locator("[data-locked-screen]")).toBeVisible();
    await expect(page.getByText("The test unlocks when every lesson is complete")).toBeVisible();
    await expect(page.getByText("You have finished 0 of 8 lessons.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Begin the test" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Back to current lesson" })).toBeVisible();

    // Complete every lesson over the API (page session, in teaching order).
    for (const lesson of LESSONS) {
      await seedLessonCompletion(page, lesson);
    }

    // Now the test opens.
    await page.goto(MODULE_TEST_URL);
    await page.getByRole("button", { name: /Begin the test/ }).click();

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
    // All lessons are complete and reviewable links.
    await expect(page.locator("[data-locked-lesson]")).toHaveCount(0);
  });
});
