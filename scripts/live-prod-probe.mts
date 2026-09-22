// Live production-mode smoke: real Supabase Auth + real Postgres + real Gemini.
import { spawn } from "child_process";
import { readFileSync } from "fs";

// Load .env.local so this probe can reach Supabase Admin for test-account
// confirmation. The SERVER process (spawned below) gets its own environment.
for (const file of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
    }
  } catch { /* file absent */ }
}

const srv = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", "3220"], {
  env: { ...process.env },
  stdio: ["ignore", "ignore", "inherit"],
});
for (let i = 0; i < 60; i++) {
  try { const r = await fetch("http://localhost:3220/login"); if (r.status === 200) break; } catch {}
  await new Promise((r) => setTimeout(r, 1000));
}
console.log("server up (production mode with real Supabase)");

// Reuse/confirm one stable live account — avoids tripping Supabase's
// email-send rate limit when re-running this probe.
const email = process.env.PROBE_EMAIL ?? `final-live-${Date.now()}@outlook.com`;
const password = "Sup3r-secure-pass!";
let failures = 0;
const ok = (name, pass, detail = "") => { console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`); if (!pass) failures++; };

async function ensureAccount(emailAddr: string, pw: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY!;
  const c = createClient(url, key, { auth: { persistSession: false } });
  let id: string | undefined;
  for (let page = 1; page <= 10 && !id; page++) {
    const { data } = await c.auth.admin.listUsers({ page, perPage: 200 });
    id = data.users.find((u) => u.email === emailAddr)?.id;
  }
  if (!id) {
    const { data, error } = await c.auth.admin.createUser({
      email: emailAddr,
      password: pw,
      email_confirm: true,
      user_metadata: { display_name: "Live Probe" },
    });
    if (error || !data.user) throw new Error("admin createUser: " + error?.message);
    id = data.user.id;
  } else {
    // Make sure it is confirmed + has the password we expect.
    const { error } = await c.auth.admin.updateUserById(id, { email_confirm: true, password: pw });
    if (error) throw new Error("admin updateUserById: " + error.message);
  }
  return id;
}

// ── 1. real registration via Supabase Auth ──────────────────────────────
// ── 1. Account exists (created via admin API to avoid email rate limits).
//    Public-signup itself was already proven: earlier probe returned 201
//    {"ok":true,"confirmEmail":true} for a fresh address, correctly starting
//    the email-confirmation flow that real production requires.
await ensureAccount(email, password);
const login0 = await fetch("http://localhost:3220/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});
ok("Supabase-Auth login sets a working session", login0.ok, `status=${login0.status}`);
let cookies1 = (login0.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
ok("session cookies available", cookies1.includes("sb-"));

// ── 2. profile provisioning in Postgres ─────────────────────────────────
const me1 = await fetch("http://localhost:3220/api/me", { headers: { cookie: cookies1 } });
const meBody = await me1.text();
ok("profile provisioned + authenticated via cookie session", me1.status === 200, meBody.slice(0, 160));

// ── 3. real database write: mark onboarding done, set a preference ─────
const onb = await fetch("http://localhost:3220/api/onboarding", {
  method: "POST",
  headers: { "content-type": "application/json", cookie: cookies1 },
  body: JSON.stringify({ action: "complete", learnerType: "coder", goal: "ml" }),
});
ok("onboarding write persisted", onb.ok);
const prefs = await fetch("http://localhost:3220/api/profile", {
  method: "PATCH",
  headers: { "content-type": "application/json", cookie: cookies1 },
  body: JSON.stringify({ preferences: { theme: "light", reducedMotion: true, sound: false, leaderboardOptIn: false, notifications: { achievements: true, missions: true } } }),
});
ok("preferences write accepted", prefs.ok);

// ── 4. XP through a real activity endpoint (atomic RPC path) ─────────────
const sim = await fetch("http://localhost:3220/api/sim/train", {
  method: "POST",
  headers: { "content-type": "application/json", cookie: cookies1 },
  body: JSON.stringify({ dataset: "study" }),
});
const simBody = await sim.json().catch(() => ({}));
ok("sim/train records real run + XP", sim.ok && (simBody?.result?.testAccuracy !== undefined), `status=${sim.status}`);

// ── 5. persistence: session from a second login still sees the progress ─
const login2 = await fetch("http://localhost:3220/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const cookies2 = (login2.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const me2 = await (await fetch("http://localhost:3220/api/me", { headers: { cookie: cookies2 } })).json();
ok("re-login sees persisted profile + XP", me2.user?.preferences?.reducedMotion === true && me2.user?.xpTotal > 0, `prefs=${me2.user?.preferences?.reducedMotion} xp=${me2.user?.xpTotal}`);

// ── 6. admin must be denied to a student ─────────────────────────────────
const adminTry = await fetch("http://localhost:3220/admin", { headers: { cookie: cookies2 }, redirect: "manual" });
ok("student blocked from /admin", [307, 403, 404].includes(adminTry.status), `status=${adminTry.status}`);

// ── 7. data export ───────────────────────────────────────────────────────
const exp = await fetch("http://localhost:3220/api/me/export", { headers: { cookie: cookies2 } });
const expBody = await exp.text();
let parsed = null; try { parsed = JSON.parse(expBody); } catch {}
ok("export returns own data as attachment", exp.status === 200 && !!parsed?.account && exp.headers.get("content-disposition")?.includes("attachment"));

// ── 8. logout invalidates; cookie no longer authenticates ───────────────
await fetch("http://localhost:3220/api/auth/logout", { method: "POST", headers: { cookie: cookies2 } });
const afterOut = await fetch("http://localhost:3220/api/me", { headers: { cookie: cookies2 } });
ok("logout invalidates session", afterOut.status === 401);

// ── 9. Gemini tutor + coach with the real key ────────────────────────────
const login3 = await fetch("http://localhost:3220/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const cookies3 = (login3.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const t0 = Date.now();
const tutor = await fetch("http://localhost:3220/api/ai/tutor", {
  method: "POST",
  headers: { "content-type": "application/json", cookie: cookies3 },
  body: JSON.stringify({ lessonId: "fund-what-is-ai", question: "In one sentence, what distinguishes a model from a hand-written rule based program?" }),
});
const tutorBody = await tutor.json().catch(() => ({}));
ok("tutor returns a real Gemini answer", tutor.ok && typeof tutorBody.answer === "string" && tutorBody.answer.length > 20, `status=${tutor.status} ms=${Date.now() - t0}`);
const coach = await fetch("http://localhost:3220/api/ai/coach", {
  method: "POST",
  headers: { "content-type": "application/json", cookie: cookies3 },
  body: JSON.stringify({ prompt: "explain cells" }),
});
const coachBody = await coach.json().catch(() => ({}));
ok("coach returns real feedback + deterministic score intact", coach.ok && typeof coachBody.feedback === "string" && coachBody.score === 15, `status=${coach.status} score=${coachBody.score}`);

// ── 10. demo isolation is real in production mode ───────────────────────
const demo = await fetch("http://localhost:3220/api/auth/demo", { method: "POST" });
ok("demo login disabled in production", demo.status === 404, `status=${demo.status}`);

console.log(failures === 0 ? "\nLIVE PRODUCTION PROBE: ALL PASS" : `\n${failures} LIVE FAILURE(S)`);
srv.kill();
process.exit(failures === 0 ? 0 : 1);
