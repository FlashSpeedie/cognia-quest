import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

/**
 * Live RLS policy tests. These run ONLY when a real Supabase project is
 * configured in the environment (url + publishable key + secret key);
 * otherwise the file is skipped so the offline suite stays deterministic.
 *
 * They prove, against real Postgres RLS, that:
 *  - a student can read ONLY their own rows,
 *  - no client can write to reward-bearing tables,
 *  - a student cannot elevate their own role,
 *  - the anonymous key gets nothing.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const pub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const RUN = Boolean(url && pub && secret);
const run = RUN ? describe : describe.skip;

run("Supabase RLS (live)", { timeout: 60_000 }, () => {
  // Vitest evaluates describe bodies even when skipped — only create
  // clients when the suite actually runs.
  const stamp = Date.now();
const emailA = `rls-a-${stamp}@verify.dev`;
  const emailB = `rls-b-${stamp}@verify.dev`;
  const anon = RUN ? createClient(url!, pub!, { auth: { persistSession: false } }) : (null as never);
  const service = RUN ? createClient(url!, secret!, { auth: { persistSession: false } }) : (null as never);

  async function signedUpUser(email: string, password: string) {
    const c = createClient(url!, pub!, { auth: { persistSession: false } });
    const { data, error } = await c.auth.signUp({ email, password });
    if (error || !data.user) throw new Error(`signup: ${error?.message}`);
    return { client: c, id: data.user.id, jwt: data.session?.access_token ?? null };
  }

  it("cross-user reads are denied and forged writes rejected", async () => {
    const a = await signedUpUser(emailA, `Pw-${stamp}-a`);
    const b = await signedUpUser(emailB, `Pw-${stamp}-b`);

    // Provision profiles + one reward row as the server would.
    const base = {
      displayName: "RLS", passwordHash: null, role: "student", title: "AI Rookie", avatarId: "🧪",
      createdAt: new Date().toISOString(), onboarding: { completed: false },
      preferences: { theme: "dark", reducedMotion: false, sound: false, leaderboardOptIn: false, notifications: { achievements: true, missions: true } },
      xpTotal: 0, isDemo: false,
    };
    await service.from("users").insert([{ data: { ...base, id: a.id, email: emailA } }, { data: { ...base, id: b.id, email: emailB } }]);
    await service.from("xp_events").insert({ data: { id: `xp-rls-${stamp}`, userId: a.id, amount: 50, sourceType: "lesson", sourceId: "rls", day: "2026-01-01", createdAt: new Date().toISOString() } });

    // B cannot read A's profile.
    const readAbyB = await b.client.from("users").select("data").eq("data->>id", a.id);
    expect(readAbyB.data ?? []).toHaveLength(0);

    // A reads own profile.
    const readOwn = await a.client.from("users").select("data").eq("data->>id", a.id);
    expect((readOwn.data ?? []).length).toBe(1);

    // B cannot read A's rewards.
    const xpByB = await b.client.from("xp_events").select("data").eq("data->>userId", a.id);
    expect(xpByB.data ?? []).toHaveLength(0);

    // A cannot award herself XP directly.
    const forge = await a.client.from("xp_events").insert({ data: { id: "forged-rls", userId: a.id, amount: 99999, sourceType: "lesson", sourceId: "hack", day: "2026-01-01", createdAt: new Date().toISOString() } });
    expect(forge.error).not.toBeNull();

    // A cannot promote herself to admin.
    const esc = await a.client.from("users").update({ data: { ...base, id: a.id, email: emailA, role: "admin" } }).eq("data->>id", a.id);
    expect(esc.error).not.toBeNull();

    // Anonymous reads get nothing.
    const anonUsers = await anon.from("users").select("data").limit(5);
    expect(anonUsers.data ?? []).toHaveLength(0);

    expect(b.client).toBeTruthy();
  });
});
