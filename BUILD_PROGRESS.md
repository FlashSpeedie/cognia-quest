# AI QUEST — Build Progress

> Living document. All 10 phases complete; see final audit at bottom.

## Status: ✅ PROJECT COMPLETE

## Architecture Decisions
| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14.2.35 (App Router, patched), TypeScript strict | SSR + API routes + ecosystem; matches spec |
| Styling | Tailwind 3.4 + CSS-variable design tokens | Dark-first, light theme via `.light` class, reduced-motion support |
| Backend | Repository abstraction; **Supabase** (migration SQL + RLS) for production; **local JSON store** default | Fully runnable offline; no external dependency for judging |
| Auth | scrypt + HMAC-signed httpOnly session cookies; role-guarded layouts | Server-authoritative; dev-safe; prod warns if secret unset |
| Rewards | Server-side only: `xp_events` immutable transactions, dedupe + decay + daily caps | Spec §31/§84 |
| Content | All curriculum in `content/*.ts` (typed, data-driven) | §40/§86 content management without UI rewrites |
| ML sim | Deterministic logistic regression (seeded) | Honest "educational simulation", reproducible, testable |
| Tests | Vitest unit+integration (40), Playwright e2e (14) | Full loop coverage |

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
| `npm run test` | ✅ 40/40 unit + integration |
| `npx playwright test` | ✅ 14/14 e2e; repeat `--repeat-each=2` → 26/26 (earlier `--repeat-each=3`: 38/38) |
| `npm run build` | ✅ clean production build |
| Route sweep | ✅ 9 public + 25 app + 3 admin routes HTTP 200; 28 protected routes redirect anon to /login; 31-page browser sweep (incl. dynamic lesson/mission/case/battle detail) with zero console/page errors; dashboard's 21 internal links all resolve |
| Rate limiter proof | ✅ prod: 30×200 then 429 on sim/train; `AQ_DISABLE_RATE_LIMIT` only wired into Playwright's test server |
| Data export | ✅ `/api/me/export` → JSON attachment; 401 anonymous |
| Anti-forgery | ✅ no XP-accepting endpoint exists (404s); `/api/profile` strips unknown keys — XP unchanged after forge attempts; malformed quiz payload → 422 |
| Authorization | ✅ student → /admin = 307 to /dashboard; admin console only for admin role |

*Final audit (this session): all suites re-run green; no code changes required — implementation was already complete. Housekeeping: removed 13 stale pre-fix `data/*.tmp` artifacts from git and added `data/*.tmp` to .gitignore.*

## Incidents found & fixed during validation
1. **JSON store write race (500 on /api/sim/train under concurrency)** — Next.js bundles modules per route chunk; two store instances shared one `.tmp` name. Fixed with unique temp filenames + `globalThis` Db singleton (`b5c98d5`).
2. **Seed-vs-server race / Playwright parallel login storms** — solved with a `setup` project producing storage states once per run (`b5c98d5`), and a test-only rate-limit bypass env var set only by the Playwright webServer (`bf38eca`).

## Content inventory (spec §56 ≥)
- Modules: 7 · Lessons: 20 · Quiz questions: 40
- Missions: 10 · Badges: 12 · Detective cases: 15 · Ethics cases: 10
- Privacy scenarios: 10 · Prompt battles: 10 · Tool scenarios: 8
- Glossary terms: 23 · Careers: 9 · Final challenge stages: 8

## Known issues
See KNOWN_ISSUES.md (password-reset seam; single-process local store by design; in-memory rate limit).
