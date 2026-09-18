# AI QUEST — Build Progress

> Living document. Updated throughout the build so work can resume from any interruption.

## Current Phase
**Phase 4 — Auth + onboarding** (API routes, sessions, protected routes, onboarding flow)

## Architecture Decisions
| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14.2.35 (App Router, patched) + TypeScript strict | Spec-compatible, SSR, API routes, strong ecosystem |
| Styling | Tailwind 3.4 + custom design tokens (globals.css) | Fast, consistent, dark-first; light theme via CSS vars |
| Backend | Repository pattern. **Supabase** (Postgres + Auth + RLS) in production via `supabase/migrations`; **local JSON dev store** when Supabase env vars absent | Spec mandates Supabase; repo has no live Supabase project, so local self-contained store keeps product runnable/testable offline |
| Auth | Cookie sessions (HMAC-signed, scrypt password hashing) locally; Supabase Auth adapter when configured | Dev-safe fallback per spec |
| Server authority | All XP/badge/progress mutations go through `server/services/*`; API routes validate with zod | Spec §31 security |
| Tests | Vitest (unit+integration), Playwright (e2e, phase 10) | Fast, no browser needed for logic |
| Charts | Hand-rolled accessible SVG (`components/charts`) | Bundle-light, full a11y control |

## Datastore switches
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set → Supabase (service-role used **server-side only**)
- otherwise → `LOCAL_DB_PATH` (default `data/dev-db.json`), seeded via `npm run seed`

## Phase Status
- [x] **Phase 1 — Scaffold**: Next.js+TS+Tailwind, ESLint, Vitest, design tokens, base UI kit (Button, Card, Chip, Modal, Toast, ProgressBar/Ring, Term tooltip, Input, EmptyState, Icon set). Build green.
- [x] **Phase 2 — Data layer**: typed schema (15 tables), Db abstraction, local JSON store (atomic, re-entrant tx), Supabase adapter + SQL migration with RLS, seed script driving real services. Demo user = Level 6 / 2669 XP / mixed mission state.
- [x] **Phase 3 — Core services**: XP rules (dedupe/decay/daily caps), levels, streaks, badges (12 conditions), quiz grading, mission event engine, prompt rubric (8 dims), deterministic ML sim (logistic regression + imbalance/one-class detection), bias sim w/ crossover metric, detective/ethics/privacy/tool/final services, recommendations. 36 tests green.
- [ ] **Phase 4 — Auth + onboarding** ← IN PROGRESS
- [ ] Phase 5 — Public site
- [ ] Phase 6 — App shell + dashboard + achievements/progress/profile/settings + search/command palette
- [ ] Phase 7 — Academy
- [ ] Phase 8 — Labs & simulations
- [ ] Phase 9 — Detective/Ethics/Missions/Final Challenge/Certificate/Quest Map
- [ ] Phase 10 — Admin, hardening, a11y/responsive pass, PWA, e2e, README, final audit

## Tests Performed
| Phase | Typecheck | Lint | Unit/Integration | Build |
|---|---|---|---|---|
| 1 | ✓ (via build) | ✓ | n/a | ✓ |

## Known Issues
_See KNOWN_ISSUES.md. None currently._
