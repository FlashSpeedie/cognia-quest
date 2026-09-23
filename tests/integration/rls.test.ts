import { describe, it, expect, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Live RLS policy tests. Runs whenever a real Supabase project is present.
 * Credentials are read from .env.local directly (never from the test
 * environment) so the suite-wide env isolation in vitest setup can't
 * accidentally neutralize it - live RLS verification is part of the test
 * suite whenever a real Supabase project is linked.
 */

function loadLocalEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const raw of readFileSync(join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      const m = raw.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]!] = m[2]!.trim();
    }
  } catch { /* no .env.local */ }
  return out;
}

const env = loadLocalEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const pub = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const RUN = Boolean(url && pub && secret);
const run = RUN ? describe : describe.skip;

const mk = (key?: string): SupabaseClient | null =>
  url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

run("Supabase RLS (live)", () => {
  const stamp = Date.now();
  const emailA = `rls-a-${stamp}@verify.dev`;
  const emailB = `rls-b-${stamp}@verify.dev`;

  async function makeUser(email: string, password: string) {
    const admin = mk(secret)!;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    const c = mk(pub)!;
    const { data: s, error: sErr } = await c.auth.signInWithPassword({ email, password });
    if (sErr || !s.session) throw new Error(`signIn: ${sErr?.message ?? "no session"}`);
    return { id: data.user.id, client: c };
  }

  it("cross-user reads denied, writes forged rewards denied, no role self-elevation", { timeout: 60_000 }, async () => {
    const a = await makeUser(emailA, `Pw-${stamp}-a`);
    const b = await makeUser(emailB, `Pw-${stamp}-b`);
    const admin = mk(secret)!;
    const anon = mk(pub)!;

    const base = {
      displayName: "RLS", passwordHash: null, role: "student", title: "AI Rookie", avatarId: "🧪",
      createdAt: new Date().toISOString(), onboarding: { completed: false },
      preferences: { theme: "dark", reducedMotion: false, sound: false, leaderboardOptIn: false, notifications: { achievements: true, missions: true } },
      xpTotal: 0, isDemo: false,
    };
    const insU = await admin.from("users").insert([
      { data: { ...base, id: a.id, email: emailA } },
      { data: { ...base, id: b.id, email: emailB } },
    ]);
    expect(insU.error).toBeNull();
    const insX = await admin.from("xp_events").insert({
      data: { id: `xp-rls-${stamp}`, userId: a.id, amount: 50, sourceType: "lesson", sourceId: "rls", day: "2026-01-01", createdAt: new Date().toISOString() },
    });
    expect(insX.error).toBeNull();

    // B cannot read A's profile; A reads own profile
    const readAbyB = await b.client.from("users").select("data").eq("data->>id", a.id);
    expect(readAbyB.data ?? []).toHaveLength(0);
    const readOwn = await a.client.from("users").select("data").eq("data->>id", a.id);
    expect((readOwn.data ?? []).length).toBe(1);

    // B cannot read A's rewards; forged XP insert denied; role escalation denied
    expect((await b.client.from("xp_events").select("data").eq("data->>userId", a.id)).data ?? []).toHaveLength(0);
    const forge = await a.client.from("xp_events").insert({ data: { id: "forged-rls", userId: a.id, amount: 99999, sourceType: "lesson", sourceId: "hack", day: "2026-01-01", createdAt: new Date().toISOString() } });
    expect(forge.error).not.toBeNull();
    const esc = await a.client.from("users").update({ data: { ...base, id: a.id, email: emailA, role: "admin" } }).eq("data->>id", a.id);
    expect(esc.error).not.toBeNull();

    // Anonymous gets nothing
    expect((await anon.from("users").select("data").limit(5)).data ?? []).toHaveLength(0);
  });
});

// Clean up test users even on failure so reruns never accumulate accounts.
afterAll(async () => {
  if (!RUN) return;
  const admin = mk(secret!);
  if (!admin) return;
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const victims = data.users.filter((u) => u.email?.startsWith("rls-"));
  for (const u of victims) await admin.auth.admin.deleteUser(u.id).catch(() => {});
});
