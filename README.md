# AI QUEST

**Learn AI. Challenge AI. Use AI Responsibly.**

An interactive AI literacy platform for grades 9–12. Students become *AI Apprentices*: they train models on data they control, investigate AI hallucinations as detectives, sit in judgment in the Ethics Court, master prompting against a real rubric, and prove it all in a capstone — earning XP, levels, badges, and a printable certificate. Every simulation is honest about being a simulation; every reward is validated server-side.

## Demo in 60 seconds

```bash
npm install
npm run seed        # creates demo + admin accounts and a rich demo world
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

- **Academy** — 7 modules, 18+ interactive lessons ("What is a model?" you can click to retrain, overfitting lab, token visualizer, confidence lab, claim triage…), sticky lesson nav, server-graded quizzes, breadcrumbs.
- **AI Lab** — *Train the Machine* (a real deterministic classifier with dataset editor, noise, train/test split, decision boundary, confusion matrix), *Prompt Lab* + *Prompt Battle* (8-dimension rubric, fully deterministic), *Bias Simulation*, *Dataset Explorer*, *AI Tool Selector*.
- **AI Detective** — 15 case files with evidence lockers; verdicts validated server-side.
- **Ethics Center** — Ethics Court (10 deployment scenarios scored on reasoning *coverage*), Privacy Challenge (10 data-minimization scenarios), classroom Policy Builder, academic-integrity module.
- **Gamification** — XP as server-side transactions with anti-farming (one-time sources dedupe, repeatable sources decay + daily caps), 10 levels, 12 badges with server-checked conditions, streaks, notifications, toasts, level-ups.
- **Missions** — 10-mission campaign with objective tracking that unlocks sequentially; Mission 10 is the Final AI Challenge (data → bias → prompt → output review → deployment call).
- **Command center dashboard** — level ring, XP history chart, skills radar, recommendations engine, continue-learning, mission cards, activity feed.
- **Search + command palette** (`Ctrl/Cmd+K`), glossary (23 terms), career explorer, quest map, printable certificate.
- **Admin console** — aggregate metrics, quiz difficulty, detective solve rates, mission funnel, badge distribution, user roster, audit logging.
- **Accessibility** — semantic HTML, labeled controls, visible focus rings, keyboard-navigable everything, reduced-motion support (OS setting or toggle), light/dark themes, WCAG-conscious contrast.

## Tech stack

- **Next.js 14 (App Router) + TypeScript (strict)** — server components, route handlers.
- **Tailwind CSS** with a custom design-token system (dark-first, light theme, reduced-motion).
- **Zod** for input validation on every API.
- **Vitest** for unit/integration tests; **Playwright** for end-to-end.
- **Backend**: repository abstraction with two drivers:
  - **Supabase (production)** — `supabase/migrations/0001_init.sql` defines tables + row-level security; the server uses the service role only on the server.
  - **Local JSON datastore (default)** — zero-config file store (`data/dev-db.json`) so the whole product runs and tests offline. Atomic writes, queued mutations.
- **Auth** — scrypt password hashing + HMAC-signed, httpOnly session cookies; Supabase Auth adapter architecture.

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

## Environment variables (`.env.example`)

| Variable | Required | Purpose |
|---|---|---|
| `AUTH_SECRET` | production | HMAC key signing local session cookies |
| `NEXT_PUBLIC_APP_URL` | no | absolute metadata URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | enables the Supabase backend |
| `SUPABASE_SERVICE_ROLE_KEY` | optional* | server-side DB access (server-only!) |
| `LOCAL_DB_PATH` | dev | override the JSON datastore location |
| `OPENAI_API_KEY` | never required | Optional real-LLM seam (`server/ai/provider.ts`) — server-only, graceful fallback; the product is fully functional without it |

If the Supabase variables are absent, the app runs fully on the local datastore — all features work; it's the canonical development path.

## Deploying

- **Local/demo**: `npm ci && npm run seed && npm run build && npm start`.
- **Production**: provision a Supabase project, run `supabase/migrations/0001_init.sql`, set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL`, then deploy to any Next.js-capable host (Vercel/Node/Docker). Keep the service-role key server-side only.

## Testing status

`npm run validate` runs typecheck + lint + unit/integration tests + build. Playwright e2e covers: landing, preview interactivity, register→onboarding→dashboard, lesson+quiz with XP, detective verdict, prompt battle scoring, admin gating.

## A note on honesty

- The prompt scorer, ML trainer, and "confidence" meter are **educational heuristics**, and the UI says so. They are deterministic by design: the point is how models behave, not pretending a rules engine is a giant LLM.
- Certificates are **learning achievements**, not accredited certifications — again, labeled as such.
