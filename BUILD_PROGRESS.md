# AI QUEST — Build Progress

> Living document. Updated throughout the build so work can resume from any interruption.

## Current Phase
**Phase 2 — Data layer** (types, repository interface, local store, Supabase SQL migrations, seed)

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
- [ ] **Phase 2 — Data layer** ← IN PROGRESS
- [ ] Phase 3 — Core services
- [ ] Phase 4 — Auth + onboarding
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
