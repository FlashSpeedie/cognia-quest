# AI Quest — Known Issues

## 1. Live Supabase verification is blocked on the project's API keys
As of the final audit, the publishable key in `.env.local` works (user signup succeeded against the real project), but the `SUPABASE_SECRET_KEY` returns HTTP 401 from both GoTrue and PostgREST — indistinguishable from a revoked/mistyped key. Until a valid secret key is in place:
- End-to-end production-mode verification (real DB writes, live RLS checks) can't complete.
- The migration files are ready: apply `supabase/migrations/0001_init.sql` then `0002_hardening.sql` in the Supabase SQL editor, then run `npx tsx scripts/verify-rls.ts` — it performs real cross-user attacks and must report all-pass before launch.
**Severity:** launch-blocking for production; everything else is verified in local mode.

## 2. Rate limiting is in-memory, single instance
Fine for single-node deploys; multi-instance production should move `lib/ratelimit.ts` to a shared store (e.g. Upstash Redis). Interface is swap-ready.

## 3. Dev-toolchain advisories (accepted risk, not shipped to users)
`npm audit` still flags `vite`/`vitest`/`esbuild` (test-only tooling) and `postcss@8.4.31` bundled *inside* `next` (build-time only; we never process untrusted CSS). None of this code runs in the production server bundle. The Next.js RCE/DoS criticals were resolved by upgrading to `next@15.5.25`.
**Decision:** deliberately accepted; upgrading further would require `next@16` (breaking) and `vitest@5` (requires vite 8 + Node type churn), both disproportionate here.

## 4. Local JSON datastore is single-process
Used only in development/judging/E2E runs (zero-config offline operation). In production the Supabase adapter is the source of truth, and a production boot with Supabase vars missing now logs a loud warning.
