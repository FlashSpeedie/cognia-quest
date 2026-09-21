# AI QUEST — Build Progress

> Living document. All 10 phases complete; see final audit at bottom.

## Status: ✅ PROJECT COMPLETE

## Architecture Decisions
| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15.5.25 (App Router), TypeScript strict | Upgraded from 14.2.35 for critical RCE/DoS advisories (GHSA-p293, GHSA-2xp9, …) |
| Styling | Tailwind 3.4 + CSS-variable design tokens | Dark-first, light theme via `.light` class, reduced-motion support |
| Backend | Repository abstraction; **Supabase** (migrations + RLS) automatic when configured, **local JSON store** otherwise | Offline-runnable for judging; production uses real Postgres |
| Auth | **Supabase Auth** in production (ssr cookies, middleware refresh, password reset); scrypt+HMAC signed cookies locally | Role stored server-side in `users` table only |
| Rewards | Server-side only: `xp_events` deterministic one-time ids + atomic `incrementUserXp` RPC | No lost updates under concurrent claims |
| AI | Gemini via `server/ai/provider.ts` (tutor + prompt coach), key never leaves server, timeouts + typed failures | Optional layer; deterministic rubric remains the score |
| Content | All curriculum in `content/*.ts` (typed, data-driven) | §40/§86 content management without UI rewrites |
| ML sim | Deterministic logistic regression (seeded) | Honest "educational simulation", reproducible, testable |
| Tests | Vitest unit+integration (52: 51 active + 1 live-RLS skipped offline), Playwright e2e (35) | Full loop coverage |

## Phase Ledger
- [x] **1 Scaffold** — Next.js+TS+Tailwind, design tokens, UI kit (Button, Card, Chip, Modal, Toast, Progress, Ring, Term tooltip, Input, EmptyState, icons). Build green.
- [x] **2 Data layer** — 15-table schema, Db abstraction, local store (atomic, re-entrant tx), Supabase migration w/ RLS, indexes.
- [x] **3 Services** — XP economy, levels, streaks, badges (12 conditions), quiz grading, mission engine, prompt rubric, ML sim, bias sim, final-challenge scoring, recommendations.
- [x] **4 Auth + onboarding** — register/login/logout/demo APIs (rate-limited), 4-screen onboarding, protected app layout, cookie session.
- [x] **5 Public site** — landing (hero network + pillars + steps + gamification strip), about, preview (playable AI-or-Not), privacy, SEO, favicon, robots, sitemap.
- [x] **6 Shell+dashboard** — sidebar/topbar/mobile nav/bottom nav, command palette (Ctrl+K), notifications, dashboard (level ring, XP spark, skills radar, recs, missions, badges, activity), achievements trophy room, progress analytics, profile editor, settings (theme/motion/sound/notifications/leaderboard opt-in), search API.
- [x] **7 Academy** — module/lesson pages, sticky progress nav, breadcrumbs, quiz runner w/ explanations, 13 interactive widgets, glossary.
- [x] **8 Labs** — Train the Machine (editor + boundary + confusion + problem flags), Prompt Lab, Prompt Battle (10 tasks), Bias Simulation (proxy hunt + re-audit), Dataset Explorer, Tool Selector, API validation.
- [x] **9 Missions/Cases** — Detective (15 cases, evidence UI), Ethics Court (10 cases, coverage scoring), Privacy Challenge (10), Policy Builder (mission 09), missions hub + detail, Final Challenge (8 stages), Certificate (print), Quest Map, Careers.
- [x] **10 Admin + hardening** — admin overview/analytics/users + content inventory + audit log, error/404/loading/offline pages, PWA (manifest + conservative SW), level-up modal + optional chimes, leaderboard (opt-in), light-theme token fix, 3 extra lessons (20 total), detective XP=150, train-config stage in final, prompt draft autosave.

## Tests Performed (all green)
| Suite | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors |
| `npm run lint` | ✅ 0 warnings |
| `npm run test` | ✅ 51/51 unit + integration (RLS live suite skips cleanly offline) |
| `npx playwright test` | ✅ 35/35 e2e |
| `npm run build` | ✅ clean production build (Next 15.5.25) |
| Live Gemini | ✅ tutor + coach 200 via real key; panels render; no page errors |
| Live Supabase probe | ⚠️ signup OK via publishable key; REST/RLS blocked by invalid `SUPABASE_SECRET_KEY` (see KNOWN_ISSUES #1) |
| Route sweep | ✅ 9 public + 25 app + 3 admin routes HTTP 200; 28 protected routes redirect anon to /login; 31-page browser sweep zero console errors |
| Rate limiter proof | ✅ prod: 30×200 then 429 on sim/train; `AQ_DISABLE_RATE_LIMIT` ignored when Supabase configured |
| Data export | ✅ `/api/me/export` → JSON attachment; 401 anonymous |
| Anti-forgery | ✅ e2e: forged XP/role attempts 404/unchanged; malformed quiz → 422; XSS display name → 422 |
| Authorization | ✅ student → /admin = 307 to /dashboard; admin console only for admin role |
| Concurrency | ✅ racing one-time XP claims → one pays, one duplicates; mixed concurrent awards keep totals consistent (`atomicity.test.ts`) |

## Production hardening (final session)
- [x] **Supabase Auth integration** — `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY` env support, `@supabase/ssr` cookie sessions, `middleware.ts` token refresh, register/login/logout through GoTrue, lazy profile provisioning, role stored server-side only.
- [x] **Password reset** — `/forgot-password` page, `/api/auth/reset-request`, `/auth/callback` code exchange, `/reset-password` + `/api/auth/update-password`.
- [x] **Gemini live AI** — `server/ai/provider.ts` (timeout, caps, typed failures), `/api/ai/tutor` + `/api/ai/coach`, TutorPanel on lesson pages, AI-coach button on Prompt Lab. Both verified live with the real key.
- [x] **Demo hard isolation** — `/api/auth/demo` 404s in production mode; "Try demo" button + demo copy hidden from landing/privacy; seed script refuses to see Supabase env; `scripts/make-admin.ts` for admin bootstrap.
- [x] **XP atomicity** — deterministic one-time event ids (`xp:user:type:source` — unique index rejects racing duplicates), `incrementUserXp` atomic RPC (`aq_increment_xp`) on Supabase + serialized queue locally.
- [x] **Migration 0002** — remaining RLS read-own policies (quiz_attempts, challenge_attempts, prompt_attempts, sim_runs, activity), atomic XP RPC with grant to service_role only.
- [x] **Security e2e** — anonymous 401 wall on all 11 mutation routes, XP/role forging, quiz malformed payloads, XSS display-name rejection, admin gating, 320/768/1280 responsive, AI-unavailable 503 honesty.
- [x] **Responsive fix** — grids get `grid-cols-1` (minmax(0,1fr)) on mobile; dashboard columns `min-w-0`.
- [x] **Dependency audit** — `next@14.2.35 → 15.5.25` kills both critical RCEs; `vitest@3.2.7`. Remaining audit items are dev/build-time only (see KNOWN_ISSUES#3).
- [x] **Next 15 compatibility** — typecheck/lint/51 tests/35 e2e all re-verified on the new framework.

## Incidents found & fixed during validation
1. **JSON store write race (500 on /api/sim/train under concurrency)** — Next.js bundles modules per route chunk; two store instances shared one `.tmp` name. Fixed with unique temp filenames + `globalThis` Db singleton (`b5c98d5`).
2. **Seed-vs-server race / Playwright parallel login storms** — solved with a `setup` project producing storage states once per run (`b5c98d5`), and a test-only rate-limit bypass env var set only by the Playwright webServer (`bf38eca`).

## Content inventory (spec §56 ≥)
- Modules: 7 · Lessons: 20 · Quiz questions: 40
- Missions: 10 · Badges: 12 · Detective cases: 15 · Ethics cases: 10
- Privacy scenarios: 10 · Prompt battles: 10 · Tool scenarios: 8
- Glossary terms: 23 · Careers: 9 · Final challenge stages: 8

## Known issues
See KNOWN_ISSUES.md — **blocking for production launch**: the `SUPABASE_SECRET_KEY` currently in `.env.local` is rejected by the project (401 on all endpoints; publishable key works). Migrations are ready (`0001` + `0002`); after a valid secret key is in place: apply migrations → `npm run verify-rls` → done. Non-blocking: in-memory rate limiter (single-instance), dev-only postcss/vite advisories.
