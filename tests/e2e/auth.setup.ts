import { test as setup, expect } from "@playwright/test";
import { DEMO_STATE as demoFile, ADMIN_STATE as adminFile } from "./states";

/** Reusable auth states: log in ONCE per role per suite run (spec-friendly:
 * avoids hammering the login rate limiter and speeds the suite). */

setup("authenticate demo student", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@aiquest.dev");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: /Log in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  await page.context().storageState({ path: demoFile });
});

setup("authenticate admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@aiquest.dev");
  await page.getByLabel("Password").fill("admin1234");
  await page.getByRole("button", { name: /Log in/i }).click();
  // The server decides the destination from the authenticated record:
  // an admin must land on the admin console, never the student dashboard.
  await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
  await page.context().storageState({ path: adminFile });
});
