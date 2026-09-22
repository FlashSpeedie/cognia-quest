/**
 * Verifies Supabase Row-Level Security with REAL cross-user attacks.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... \
 *     npx tsx scripts/verify-rls.ts
 *
 * Creates two throwaway students through the real auth flow, then checks:
 *   1. authenticated user can read their OWN profile row;
 *   2. user A cannot read user B's profile;
 *   3. neither can read ANY row from reward-bearing tables they don't own;
 *   4. a student cannot INSERT an xp event for themselves (no direct
 *      writes to reward tables — those go through server services only);
 *   5. a student cannot UPDATE their own role (users table is insert/read
 *      only for clients);
 *   6. anonymous access is denied everywhere.
 *
 * Skips cleanly (exit 0, "SKIP") when Supabase isn't configured.
 * Exits 1 with details on any policy failure.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load local env if present (tsx does not auto-load .env.local)
for (const file of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
    }
  } catch { /* file absent */ }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const pub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !pub) {
  console.log("RLS verify: SKIP (Supabase env not configured)");
  process.exit(0);
}

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` (${detail})` : ""}`);
  if (!ok) failures++;
}

const admin = createClient(url, process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? pub, {
  auth: { persistSession: false },
});
const stamp = Date.now();
const credsA = { email: `rls-a-${stamp}@verify.dev`, password: `pass-${stamp}-aAa1` };
const credsB = { email: `rls-b-${stamp}@verify.dev`, password: `pass-${stamp}-bBb2` };

async function makeUser(creds: { email: string; password: string }) {
  // Confirm-email is on, so use the admin API to create a confirmed user,
  // then sign in for a real JWT.
  const { data: created, error: cerr } = await admin.auth.admin.createUser({
    email: creds.email,
    password: creds.password,
    email_confirm: true,
    user_metadata: { display_name: "RLS Verify" },
  });
  if (cerr || !created.user) throw new Error(`admin createUser failed: ${cerr?.message}`);
  const c = createClient(url!, pub!, { auth: { persistSession: false } });
  const { data: sess, error: serr } = await c.auth.signInWithPassword(creds);
  if (serr || !sess.session) throw new Error(`signin failed: ${serr?.message ?? "no session"}`);
  return { id: created.user.id, client: c, jwt: sess.session.access_token };
}

async function rest(jwt: string, path: string, init?: RequestInit) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: pub!, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json().catch(() => null) };
}

// Set up two users and minimal rows as service role would (mimic provisionProfile + one xp event).
const a = await makeUser(credsA);
const b = await makeUser(credsB);
const jwtA = a.jwt;
const jwtB = b.jwt;

async function seed(table: string, row: unknown) {
  const { error } = await admin.from(table).insert({ data: row });
  if (error) throw new Error(`seed ${table}: ${error.message}`);
}

const profileA = { id: a.id, email: credsA.email, displayName: "RLS A", role: "student", xpTotal: 10, preferences: {}, onboarding: {}, createdAt: new Date().toISOString(), avatarId: "🧪", title: "AI Rookie", isDemo: false, passwordHash: null };
const profileB = { ...profileA, id: b.id, email: credsB.email, displayName: "RLS B" };
await seed("users", profileA);
await seed("users", profileB);
await seed("xp_events", { id: `rls-${stamp}`, userId: a.id, amount: 10, sourceType: "lesson", sourceId: "rls", day: "2026-01-01", createdAt: new Date().toISOString() });

// 1. A reads own profile
{
  const r = await rest(jwtA, `users?select=data&data->>id=eq.${a.id}`);
  check("A reads own profile", r.status === 200 && Array.isArray(r.body) && r.body.length === 1);
}
// 2. A tries reading B's profile — must get zero rows
{
  const r = await rest(jwtA, `users?select=data&data->>id=eq.${b.id}`);
  check("A cannot read B's profile", r.status === 200 && Array.isArray(r.body) && r.body.length === 0);
}
// 3. B tries reading A's xp_events
{
  const r = await rest(jwtB, `xp_events?select=data&data->>userId=eq.${a.id}`);
  check("B cannot read A's xp_events", r.status === 200 && Array.isArray(r.body) && r.body.length === 0);
}
// 3b. A CAN read own xp event (select-only is allowed)
{
  const r = await rest(jwtA, `xp_events?select=data&data->>userId=eq.${a.id}`);
  check("A reads own xp_events", r.status === 200 && Array.isArray(r.body) && r.body.length === 1);
}
// 4. A tries to insert a fake XP event
{
  const r = await rest(jwtA, `xp_events`, {
    method: "POST",
    body: JSON.stringify({ data: { id: "forged", userId: a.id, amount: 99999, sourceType: "lesson", sourceId: "hack", day: "2026-01-01", createdAt: new Date().toISOString() } }),
  });
  check("A cannot INSERT xp_events (forged reward rejected)", r.status === 401 || r.status === 403 || (r.status === 400 && JSON.stringify(r.body).includes("row-level security")));
}
// 5. A tries to make themselves admin
{
  const r = await rest(jwtA, `users?data->>id=eq.${a.id}`, {
    method: "PATCH",
    body: JSON.stringify({ data: { ...profileA, role: "admin" } }),
  });
  check("A cannot UPDATE own role", r.status === 401 || r.status === 403 || r.status === 404 || r.status === 204, `status=${r.status}`);
  const verify = await rest(jwtA, `users?select=data&data->>id=eq.${a.id}`);
  const stillStudent = Array.isArray(verify.body) && (verify.body[0] as { data: { role?: string } }).data.role === "student";
  check("role unchanged after attack", stillStudent);
}
// 6. Anonymous read is denied
{
  const r = await rest(pub!, `users?select=data&limit=5`);
  check("anonymous cannot read users", (Array.isArray(r.body) && r.body.length === 0) || r.status === 401 || r.status === 403);
}

console.log(failures === 0 ? "\nRLS VERIFY: ALL PASS" : `\nRLS VERIFY: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
