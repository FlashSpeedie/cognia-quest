import { test, expect } from "@playwright/test";
import { DEMO_STATE } from "./states";

// Reuse the demo session - one login per suite, no rate-limit pressure.
test.use({ storageState: DEMO_STATE });

test("Train the Machine: train → model report → XP", async ({ page }) => {
  await page.goto("/lab/train-the-machine");
  await expect(page.getByRole("heading", { name: "Train the Machine" })).toBeVisible();
  await page.getByRole("button", { name: "TRAIN MODEL" }).click();
  await expect(page.getByText("Model report")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Test acc/).first()).toBeVisible();
  await expect(page.getByText(/Confusion matrix/i)).toBeVisible();
});

test("Ethics Court: select questions → coverage result", async ({ page }) => {
  await page.goto("/ethics/court/ethics-grading");
  await expect(page.getByText(/On the docket/i)).toBeVisible();
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
  await page.goto("/missions");
  await expect(page.getByText(/Campaign progress/i)).toBeVisible();
  const lockedLinks = page.locator('a[aria-disabled="true"]');
  expect(await lockedLinks.count()).toBeGreaterThan(0);
});

test("Certificate gates behind final challenge", async ({ page }) => {
  await page.goto("/certificate");
  await expect(page.getByText(/certificate awaits/i)).toBeVisible();
});
