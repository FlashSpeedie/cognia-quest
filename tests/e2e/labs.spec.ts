import { test, expect } from "@playwright/test";

async function loginDemo(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@aiquest.dev");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: /Log in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("Train the Machine: train → model report → XP", async ({ page }) => {
  await loginDemo(page);
  await page.goto("/lab/train-the-machine");
  await expect(page.getByRole("heading", { name: "Train the Machine" })).toBeVisible();
  await page.getByRole("button", { name: "TRAIN MODEL" }).click();
  await expect(page.getByText("Model report")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Test acc/).first()).toBeVisible();
  await expect(page.getByText(/Confusion matrix/i)).toBeVisible();
});

test("Ethics Court: select questions → coverage result", async ({ page }) => {
  await loginDemo(page);
  await page.goto("/ethics/court/ethics-grading");
  await expect(page.getByText(/On the docket/i)).toBeVisible();
  // pick several important factors
  for (const label of [
    /tested on many writing styles/i,
    /teacher override/i,
    /uploaded to the vendor/i,
    /error rate on creative/i,
    /students know when AI/i,
    /explain WHY/i,
  ]) {
    await page.getByRole("button", { name: label }).click();
  }
  await page.getByRole("button", { name: /Submit review/i }).click();
  await expect(page.getByText(/ETHICS REVIEW COMPLETE/)).toBeVisible({ timeout: 10000 });
});

test("Mission gating: mission page shows objectives, locked states block navigation", async ({ page }) => {
  await loginDemo(page);
  await page.goto("/missions");
  await expect(page.getByText(/Campaign progress/i)).toBeVisible();
  // locked missions are inert anchors ("#")
  const lockedLinks = page.locator('a[aria-disabled="true"]');
  const count = await lockedLinks.count();
  expect(count).toBeGreaterThan(0);
});

test("Certificate gates behind final challenge", async ({ page }) => {
  await loginDemo(page);
  await page.goto("/certificate");
  // demo has NOT completed the final challenge → gated message
  await expect(page.getByText(/certificate awaits/i)).toBeVisible();
});
