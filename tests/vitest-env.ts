/**
 * Vitest setup: unit + integration tests always exercise the LOCAL backend,
 * regardless of what the developer's .env.local contains. The live RLS
 * suite (tests/integration/rls.test.ts) reads .env.local itself, so clearing
 * here does not stop it from going live.
 */
for (const k of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
]) {
  delete process.env[k];
}
