# AI Quest — Known Issues

## 1. Dev-toolchain advisories (accepted risk, not shipped to users)
`npm audit` still flags `vitest`/`vite`/`esbuild` (test-only tooling) and the `postcss@8.4.31` bundled inside `next` (build-time only; we never process untrusted CSS). None of this code runs in the production server bundle. The Next.js RCE/DoS criticals were resolved by upgrading to `next@15.5.25`.
**Decision:** deliberately accepted; upgrading further would require `next@16` + `vitest@5` major jumps that break compatibility.

## 2. Rate limiting is in-memory, single instance
Fine for single-node deploys; multi-instance production should swap `lib/ratelimit.ts` for a shared store (e.g. Upstash Redis). Interface is already swap-ready.

## 3. Local JSON datastore is single-process
Development/judging fallback only (zero-config offline operation). Production auto-switches to Supabase whenever `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + `SUPABASE_SECRET_KEY` are set.

## 4. Test-suite env isolation
`vitest.config.ts` clears Supabase/Gemini env at setup so unit+integration tests always exercise the local backend deterministically — no matter what's in `.env.local`. The live RLS suite (`tests/integration/rls.test.ts`) deliberately bypasses this by reading `.env.local` from disk, so it goes live exactly when a real project exists.
