# AI QUEST

**Learn AI. Question AI. Use AI Responsibly.**

An interactive AI literacy platform for grades 9–12. Students become *AI Apprentices*: they train models on data they control, investigate AI hallucinations as detectives, sit in judgment in the Ethics Court, master prompting against a real rubric, and prove it all in a capstone - earning XP, levels, badges, and a printable certificate. Every simulation is honest about being a simulation; every reward is validated server-side.

## Demo in 60 seconds

> Demo accounts exist only in the local development/judging path. A production
> deployment (Supabase configured) never exposes demo login - public users
> always register real accounts.

```bash
npm install
npm run seed        # creates demo + admin accounts and a rich demo world (local store)
npm run build
npm start           # http://localhost:3000
```

Then click **"Try demo"** on the landing page, or sign in:

| Account | Email | Password | Purpose |
|---|---|---|---|
| Demo student | `demo@aiquest.dev` | `demo1234` | Pre-loaded progress (Level 6, badges, missions mid-flight) |
| Admin | `admin@aiquest.dev` | `admin1234` | Admin console at `/admin` |

> These are fake, documented development credentials for a local demo. Never use them in production.

Suggested judge walk-through (3–5 min): Landing → **Try demo** → Dashboard → **Train the Machine** (lab) → **AI Detective** (solve case #0001) → **Ethics Court** → dashboard XP/badge updates → Quest Map → **Final Challenge**.

## Features

- **Academy** - 7 modules, 18+ interactive lessons ("What is a model?" you can click to retrain, overfitting lab, token visualizer, confidence lab, claim triage…), sticky lesson nav, server-graded quizzes, breadcrumbs, **per-lesson AI tutor** (Gemini, optional).
- **AI Lab** - *Train the Machine* (a real deterministic classifier with dataset editor, noise, train/test split, decision boundary, confusion matrix), *Prompt Lab* + *Prompt Battle* (8-dimension rubric, fully deterministic; optional **AI coach** feedback after the score), *Bias Simulation*, *Dataset Explorer*, *AI Tool Selector*.
- **AI Detective** - 15 case files with evidence lockers; verdicts validated server-side.
- **Ethics Center** - Ethics Court (10 deployment scenarios scored on reasoning *coverage*), Privacy Challenge (10 data-minimization scenarios), classroom Policy Builder, academic-integrity module.
- **Gamification** - XP as server-side transactions with anti-farming (one-time sources dedupe, repeatable sources decay + daily caps), 10 levels, 12 badges with server-checked conditions, streaks, notifications, toasts, level-ups.
- **Missions** - 10-mission campaign with objective tracking that unlocks sequentially; Mission 10 is the Final AI Challenge (data → bias → prompt → output review → deployment call).
- **Command center dashboard** - level ring, XP history chart, skills radar, recommendations engine, continue-learning, mission cards, activity feed.
- **Search + command palette** (`Ctrl/Cmd+K`), glossary (23 terms), career explorer, quest map, printable certificate.
- **Admin console** - aggregate metrics, quiz difficulty, detective solve rates, mission funnel, badge distribution, user roster, audit logging.
- **Accessibility** - semantic HTML, labeled controls, visible focus rings, keyboard-navigable everything, reduced-motion support (OS setting or toggle), light/dark themes, WCAG-conscious contrast.

## Tech stack

- **Next.js 15 (App Router) + TypeScript (strict)** - server components, route handlers.
- **Tailwind CSS** with a custom design-token system (dark-first, light theme, reduced-motion).
- **Zod** for input validation on every API.
- **Supabase Auth + Postgres** in production; deterministic local fallback for dev/tests (see below).
- **Gemini** for the optional live-AI features (lesson tutor, prompt coach) - server-side only.
- **Vitest** for unit/integration tests; **Playwright** for end-to-end.

## Architecture

```
app/                    routes (App Router)
  (public)              landing, about, preview, privacy, login, register
  (app)/                authenticated shell (dashboard, academy, lab, …)
  admin/                admin console (role-guarded)
  api/                  all mutation endpoints (zod-validated)
components/             design system, shell, per-area UI, widgets
content/                ALL learning content as structured TS data (data-driven engine)
lib/                    shared types, levels, helpers
server/
  auth/                 password hashing, signed session cookies
  db/                   Db interface + local store + Supabase adapter
  services/             ALL business logic (awardXP, badges, missions, scoring…)
scripts/seed.ts         seeds by exercising the real services
supabase/migrations/    Postgres schema + RLS for production
tests/                  unit (services) · integration (flows) · e2e (Playwright)
```

### Why XP can't be forged

The API never accepts arbitrary XP amounts. Client → `POST /api/...` with activity IDs only → server re-derives the reward from rules (`server/services/rules.ts`), checks for duplicates, writes an immutable `xp_events` row, updates the cached total inside a transaction, then recomputes badges. Same for badges, missions, quiz answers, and the final challenge: the server re-grades everything.

## Development

```bash
npm run dev         # local dev server (local JSON DB)
npm run seed        # (re)seed demo data
npm run typecheck
npm run lint
npm run test        # vitest: 40 unit + integration tests
npm run test:e2e    # playwright (requires prior build + seeded db)
npm run build       # production build
```

## Backends: production vs development

The app boots in one of two modes, decided by environment:

| Mode | When | What happens |
|---|---|---|
| **Production** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + `SUPABASE_SECRET_KEY` are all set | Supabase Auth owns credentials/sessions (httpOnly cookies; `middleware.ts` refreshes expiring tokens). Postgres via the server's secret key; RLS stays enabled as defense-in-depth. Demo login is **disabled** (route 404s, button hidden). |
| **Local** | Supabase vars absent | Self-contained: JSON file store (`data/dev-db.json`), scrypt hashes + HMAC-signed cookie sessions, `npm run seed` provides demo accounts for offline judging. In a production build this prints a loud "not a real deployment" warning. |

All pages, APIs, and services are backend-agnostic - they go through `server/db` and `server/auth`; no route knows which mode it's in.

## Environment variables (`.env.example`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | production | publishable (anon) key - Auth flow initiation |
| `SUPABASE_SECRET_KEY` | production | server-side service key (never shipped to browsers) |
| `GEMINI_API_KEY` | optional | enables `/api/ai/tutor` + `/api/ai/coach` |
| `GEMINI_MODEL` | no | default `gemini-2.5-flash` |
| `NEXT_PUBLIC_APP_URL` | production | absolute links (metadata, reset-email redirects) |
| `AUTH_SECRET` | local mode only | HMAC key for local session cookies |
| `LOCAL_DB_PATH` | local only | dev datastore file (`data/dev-db.json`) |
| `AQ_DISABLE_RATE_LIMIT` | **test-only** | set exclusively by the Playwright webserver; force-ignored whenever Supabase is configured |

## Deploying

1. Create a Supabase project; in the SQL editor run `supabase/migrations/0001_init.sql`, then `0002_hardening.sql`, then `0003_grants_repair.sql` - in that order (0003 is safe to run even after a previously applied 0001/0002).
2. Set the env vars above. Redirect/URLs: add `<app-url>/auth/callback` to Supabase Auth allowed redirect URLs (for email confirm + password recovery).
3. `npm ci && npm run build && npm start` (or any Node/Vercel host).
4. Bootstrap the first admin - user registers normally first, then an operator runs with the secret key in their local env:
   ```bash
   npm run make-admin -- teacher@school.org
   ```
5. Verify RLS (attempts real cross-user reads/writes):
   ```bash
   npm run verify-rls
   ```

### Email confirmation / password reset

Register and forgot-password flows send real Supabase emails. If a project has "Confirm email" enabled users must click the link before first login - the app handles both modes. Password reset lives at `/forgot-password` → email link → `/auth/callback` → `/reset-password`.

## Testing status

`npm run validate` runs typecheck + lint + unit/integration tests + build. Playwright e2e (35 tests) covers: landing, preview interactivity, register→onboarding→dashboard, lesson+quiz with XP, detective verdict, prompt battle scoring, admin gating, Train the Machine (train → model report), Ethics Court coverage scoring, mission gating, certificate gating, anonymous-access rejection on every mutation API, XP/role forging, malformed payloads, XSS rejection in registration, responsive spot-checks at 320/768/1280px, and honest 503s from the AI endpoints when Gemini isn't configured. `npm run verify-rls` runs live cross-user RLS attacks when a production Supabase project is configured.

## A note on honesty

- The prompt scorer, ML trainer, and "confidence" meter are **educational heuristics**, and the UI says so. They are deterministic by design: the point is how models behave, not pretending a rules engine is a giant LLM.
- Certificates are **learning achievements**, not accredited certifications - again, labeled as such.
