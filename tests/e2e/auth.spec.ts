import { test, expect } from "@playwright/test";
import { DEMO_STATE, ADMIN_STATE } from "./states";

/**
 * Authentication contract E2E (runs against the deterministic local e2e
 * backend; credentials come from the seed script, never real accounts):
 *
 *  - one shared /login page for both roles (no /admin/login exists)
 *  - the SERVER decides the post-login destination from the user record
 *  - admins -> /admin, students -> /dashboard, anonymous -> /login
 *  - a client cannot promote itself by sending a role field
 */

const STUDENT = { email: "demo@aiquest.dev", password: "demo1234" };
const ADMIN = { email: "admin@aiquest.dev", password: "admin1234" };

test.describe("login page", () => {
  test("serves one shared form for both roles at /login", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.status()).toBe(200);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    // No role selector, no admin-only login surface.
    expect(await page.locator("select, [name=role]").count()).toBe(0);
    const res2 = await page.request.get("/admin/login", { maxRedirects: 0, failOnStatusCode: false });
    expect([404, 307]).toContain(res2.status());
  });

  test("invalid credentials show an error and stay on /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@aiquest.dev");
    await page.getByLabel("Password").fill("totally-wrong-pass");
    await page.getByRole("button", { name: /Log in/i }).click();
    await expect(page.locator("[role=alert]")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("student login redirects to /dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(STUDENT.email);
    await page.getByLabel("Password").fill(STUDENT.password);
    await page.getByRole("button", { name: /Log in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("admin login redirects to /admin", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(ADMIN.email);
    await page.getByLabel("Password").fill(ADMIN.password);
    await page.getByRole("button", { name: /Log in/i }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await expect(page.getByText("Admin Overview")).toBeVisible();
  });

  test("login endpoint ignores a client-supplied role field", async ({ request }) => {
    const res = await request.fetch("/api/auth/login", {
      method: "POST",
      data: { email: STUDENT.email, password: STUDENT.password, role: "admin" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.redirect).toBe("/dashboard"); // student stays a student
    const me = await (await request.fetch("/api/me")).json();
    expect(me.user.role).toBe("student");
  });
});

test.describe("anonymous protection", () => {
  test("/admin redirects anonymous visitors to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("protected student pages redirect anonymous visitors to /login", async ({ page }) => {
    for (const path of ["/dashboard", "/academy", "/missions"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe("student session", () => {
  test.use({ storageState: DEMO_STATE });

  test("cannot reach /admin (redirected to student area)", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("admin APIs reject students server-side", async ({ request }) => {
    const res = await request.fetch("/api/admin/users", { failOnStatusCode: false });
    expect([403, 404, 405]).toContain(res.status());
  });

  test("session survives reload and cross-page navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/missions");
    await expect(page).toHaveURL(/\/missions/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("logout", () => {
  // These tests log in through the form themselves instead of reusing the
  // shared storageState cookie: destroying the shared session would 401
  // every parallel test that depends on it.
  test("student logout ends the session and re-arms protection", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(STUDENT.email);
    await page.getByLabel("Password").fill(STUDENT.password);
    await page.getByRole("button", { name: /Log in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("button", { name: /Log out/i }).click();
    await expect(page).toHaveURL((u) => u.pathname === "/" || u.pathname === "/login", { timeout: 15000 });

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin logout ends the session and protects /admin again", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(ADMIN.email);
    await page.getByLabel("Password").fill(ADMIN.password);
    await page.getByRole("button", { name: /Log in/i }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("button", { name: /Log out/i }).click();
    await expect(page).toHaveURL((u) => u.pathname === "/" || u.pathname === "/login", { timeout: 15000 });

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("admin session", () => {
  test.use({ storageState: ADMIN_STATE });

  test("/admin survives a full page refresh", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Admin Overview")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Admin Overview")).toBeVisible();
    await expect(page).toHaveURL(/\/admin/);
  });

  test("admin pages and another authenticated page share the session", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByText("Users").first()).toBeVisible();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/admin/analytics");
    await expect(page).toHaveURL(/\/admin\/analytics/);
  });
});

test.describe("login page responsive sanity", () => {
  for (const width of [1280, 768, 390]) {
    test(`/login renders without overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/login");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.getByRole("button", { name: /Log in/i })).toBeVisible();
    });
  }
});
