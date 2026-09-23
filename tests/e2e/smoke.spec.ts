import { test, expect } from "@playwright/test";
import { DEMO_STATE, ADMIN_STATE } from "./states";

test.describe("public site", () => {
  test("landing renders hero, pillars, CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /BECOME AN/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /START YOUR QUEST/i }).first()).toBeVisible();
    await expect(page.getByText(/AI Detective/).first()).toBeVisible();
  });

  test("preview page has a playable widget", async ({ page }) => {
    await page.goto("/preview");
    await expect(page.getByRole("heading", { name: /AI or Not/i })).toBeVisible();
  });

  test("protected routes redirect anonymous users", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("student journey (spec §78)", () => {
  test.slow();
  test("register → onboarding → dashboard → lesson → quiz → XP", async ({ page }) => {
    const email = `e2e-${Date.now()}@test.dev`;
    // register
    await page.goto("/register");
    await page.getByLabel("Display name").fill("E2E Runner");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL(/\/onboarding/);

    // onboarding: welcome → type → goal → roadmap
    await page.getByRole("button", { name: /Begin setup/i }).click();
    await page.getByRole("button", { name: /Coding Enthusiast/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Learn machine learning/ }).click();
    await page.getByRole("button", { name: /See your roadmap/i }).click();
    await page.getByRole("button", { name: /Enter Cognia Quest/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Welcome back, E2E/i)).toBeVisible();

    // first lesson
    await page.goto("/academy/ai-fundamentals/what-is-ai");
    await expect(page.getByRole("heading", { name: "What Is AI?" })).toBeVisible();

    // complete concept section
    await page.getByRole("button", { name: "Got it", exact: true }).click();
    // browse to the quiz via the sticky section nav
    await page.getByRole("button", { name: "Knowledge check" }).click();

    // answer the quiz correctly (quiz-fund-1 answers: [0],[1],[0])
    const correct = [0, 1, 0];
    for (let qi = 0; qi < 3; qi++) {
      const group = page.locator('[role="radiogroup"]').nth(qi);
      await group.locator('[role="radio"]').nth(correct[qi]!).click();
    }
    await page.getByRole("button", { name: /Submit answers/i }).click();
    await expect(page.getByText(/correct/).first()).toBeVisible();

    // dashboard shows XP progress
    await page.goto("/dashboard");
    await expect(page.getByText(/XP/).first()).toBeVisible();
  });

  test.describe("demo flows", () => {
    test.use({ storageState: DEMO_STATE });

    test("detective case flow: inspect → verdict → feedback", async ({ page }) => {
    await page.goto("/detective/case-001");
    await expect(page.getByText(/CASE #0001/)).toBeVisible();
    // inspect evidence
    await page.getByRole("tab", { name: "Context" }).click();
    await expect(page.getByText(/no human-made object/i)).toBeVisible();
    // correct verdict
    await page.getByRole("radio", { name: "Hallucination" }).click();
    await page.getByRole("button", { name: /Submit investigation/i }).click();
    await expect(page.getByText(/Case closed/i)).toBeVisible();
  });

  test("prompt lab scores weak vs strong", async ({ page }) => {
    await page.goto("/lab/prompt-battle/pb-bio-study");
    const editor = page.getByLabel(/Prompt editor/i);
    await editor.fill("study cells");
    await expect(page.getByText(/live preview/i)).toBeVisible();
    // submit strong prompt
    await editor.fill(
      "I'm a 9th grade student studying for my biology exam Friday. Create a study guide on cell structure: a 2-column table of organelles (name, function), then 5 flashcards, under 300 words, no jargon, one real-world analogy, and flag anything you're unsure about.",
    );
    await page.getByRole("button", { name: /Analyze & submit/i }).click();
    await expect(page.getByText(/official score/i)).toBeVisible();
  });

    test("students cannot reach /admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });
  });

  test("admin sees analytics", async ({ browser }) => {
    const adminCtx = await browser.newContext({ storageState: ADMIN_STATE });
    const page = await adminCtx.newPage();
    await page.goto("/admin");
    await expect(page.getByText("Admin Overview")).toBeVisible();
    await expect(page.getByText("Students").first()).toBeVisible();
    await expect(page.getByText("Badge distribution")).toBeVisible();
    await adminCtx.close();
  });
});
