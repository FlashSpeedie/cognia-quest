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
| Tests | Vitest unit+integration (40), Playwright e2e (8) | Full loop coverage |

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
| `npx playwright test` | ✅ 8/8 e2e |
| `npm run build` | ✅ clean production build |
| Route sweep | ✅ 46 app routes + 3 admin = all HTTP 200 |
| Manual API probes | register/login/demo/quiz/prompt/final flow all verified |

## Content inventory (spec §56 ≥)
- Modules: 7 · Lessons: 20 · Quiz questions: 40
- Missions: 10 · Badges: 12 · Detective cases: 15 · Ethics cases: 10
- Privacy scenarios: 10 · Prompt battles: 10 · Tool scenarios: 8
- Glossary terms: 23 · Careers: 9 · Final challenge stages: 8

## Known issues
See KNOWN_ISSUES.md (password-reset seam; single-process local store by design; in-memory rate limit).
