import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  retries: 0,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3199",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- -p 3199",
    url: "http://localhost:3199",
    reuseExistingServer: false,
    timeout: 120_000,
    // Test-only: make request limiting deterministic for the suite.
    env: { ...process.env, AQ_DISABLE_RATE_LIMIT: "1" } as Record<string, string>,
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
});
