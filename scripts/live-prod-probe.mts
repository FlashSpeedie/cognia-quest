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

// Reuse/confirm one stable live account - avoids tripping Supabase's
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
const probeId = await ensureAccount(email, password);
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

// ── 11. Academy (Module 1) against the real database ─────────────────────
// academy_module_results powers the module test; before migration 0004 these
// requests crashed with "Could not find the table ... in the schema cache".
{
  const h = await fetch("http://localhost:3220/academy-new", { headers: { cookie: cookies3 } });
  ok("academy home renders for a signed-in student", h.status === 200, `status=${h.status}`);

  const m = await fetch("http://localhost:3220/academy-new/module/1", { headers: { cookie: cookies3 } });
  const mBody = await m.text();
  ok("module 1 overview renders (module result read OK)", m.status === 200 && !mBody.includes("Something went wrong"), `status=${m.status}`);

  const l = await fetch("http://localhost:3220/academy-new/module/1/lesson/welcome-to-machine-learning", { headers: { cookie: cookies3 } });
  ok("lesson page renders", l.status === 200, `status=${l.status}`);

  const t = await fetch("http://localhost:3220/academy-new/module/1/test", { headers: { cookie: cookies3 } });
  ok("module test page renders", t.status === 200, `status=${t.status}`);

  // Free response: the flow whose stack trace surfaced the missing table.
  const fr = await fetch("http://localhost:3220/api/academy/free-response", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookies3 },
    body: JSON.stringify({
      lessonId: "m1-l1",
      response:
        "A machine learns by finding patterns in examples rather than following rules someone wrote by hand. " +
        "My music app probably learned from data about what I listen to and skip, so it can predict and recommend new songs I will like.",
    }),
  });
  const frBody = await fr.json().catch(() => ({}));
  ok("free response submits + returns feedback", fr.ok && typeof frBody?.feedback?.score === "number", `status=${fr.status}`);

  // Module test with perfect answers, straight from the repo content.
  const { MODULE_TEST } = await import("@/content/academy/module-1/module-test");
  const answers = MODULE_TEST.questions.map((q) => (q.kind === "mcq" ? [q.correct] : [...q.correct]));
  const submit = (cookie: string) =>
    fetch("http://localhost:3220/api/academy/quiz", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ quizId: MODULE_TEST.id, answers }),
    });
  const t1 = await (await submit(cookies3)).json().catch(() => ({}));
  ok("module test graded + passed + XP awarded", t1?.ok === true && t1?.passed === true && t1?.pct === 100 && (t1?.xp?.awarded ?? 0) > 0, `pct=${t1?.pct} xp=${t1?.xp?.awarded}`);

  // Retake: same content again - best score kept, attempts tracked, no new row.
  const t2 = await (await submit(cookies3)).json().catch(() => ({}));
  ok("module test retake tracks attempts without resetting best", t2?.ok === true && t2?.bestScore === 100 && t2?.attempts === 2, `best=${t2?.bestScore} attempts=${t2?.attempts}`);

  // Server-side truth: exactly ONE result row for this student, bestScore 100.
  const { createClient: createAdmin } = await import("@supabase/supabase-js");
  const adminClient = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
  const { data: rows } = await adminClient.from("academy_module_results").select("data").eq("data->>userId", probeId);
  const row = (rows ?? [])[0] as { data: { bestScore?: number; passed?: boolean; attempts?: number } } | undefined;
  ok("exactly one persisted module result row (no duplicates)", (rows ?? []).length === 1 && row?.data?.bestScore === 100 && row?.data?.passed === true, `rows=${(rows ?? []).length}`);

  // Sign out / sign in: a fresh session still sees the result on the overview.
  await fetch("http://localhost:3220/api/auth/logout", { method: "POST", headers: { cookie: cookies3 } });
  const login4 = await fetch("http://localhost:3220/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookies4 = (login4.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  const m2 = await fetch("http://localhost:3220/academy-new/module/1", { headers: { cookie: cookies4 } });
  const m2Body = await m2.text();
  ok("re-login still shows the stored module result", m2.status === 200 && m2Body.includes("module test passed"), `status=${m2.status}`);

  // Another student must not see this result anywhere on their own view.
  const emailB = process.env.PROBE_EMAIL_B ?? "final-live-b@outlook.com";
  await ensureAccount(emailB, password);
  const loginB = await fetch("http://localhost:3220/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: emailB, password }),
  });
  const cookiesB = (loginB.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  const mB = await fetch("http://localhost:3220/academy-new/module/1", { headers: { cookie: cookiesB } });
  const mBBody = await mB.text();
  ok("another student sees no trace of the first result", mB.status === 200 && !mBBody.includes("module test passed") && !mBBody.includes("best: 100%"), `status=${mB.status}`);
}

console.log(failures === 0 ? "\nLIVE PRODUCTION PROBE: ALL PASS" : `\n${failures} LIVE FAILURE(S)`);
srv.kill();
process.exit(failures === 0 ? 0 : 1);
