# AI Quest — Known Issues

## 1. Password reset flow is architecture-only
Registration/login/logout/session lifecycle is fully implemented (scrypt hashing, signed httpOnly cookies, expiry). A self-serve "forgot password" flow additionally requires a mail provider (SMTP/transactional email) which this environment doesn't provide credentials for. The seams are ready: sessions are server-stored (reset = invalidate), and the spec allows "if practical". For a real deployment, wire a provider (e.g. Resend/Postmark) into a `POST /api/auth/reset-request` handler.
**Severity:** low for demo; required before production launch.

## 2. Local JSON datastore is single-process
The default dev backend persists to `data/dev-db.json` with queued writes — perfect for demos/tests, not horizontally-scalable. Production path is the Supabase adapter (`supabase/migrations`** + RLS). This is intentional per the architecture.

## 3. Rate limiting is in-memory, single instance
Fine for single-node deploys; multi-instance production should move `lib/ratelimit.ts` to a shared store (e.g. Upstash Redis). Interface is swap-ready.
