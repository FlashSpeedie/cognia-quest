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
    // E2E runs against the deterministic LOCAL backend: even if .env.local
    // configures Supabase/Gemini for development, the test server ignores
    // them (process env wins over .env.local in Next.js).
    env: {
      ...process.env,
      AQ_DISABLE_RATE_LIMIT: "1", // test-only: deterministic request limiting
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      SUPABASE_SECRET_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      GEMINI_API_KEY: "",
    } as Record<string, string>,
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
