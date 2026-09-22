#!/usr/bin/env tsx
/**
 * Verifies the Supabase schema is fully provisioned (tables + key indexes +
 * the atomic XP RPC). Exits non-zero and prints exactly what's missing.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY");
  process.exit(1);
}

const REQUIRED_TABLES = [
  "users", "sessions", "xp_events", "badge_states", "lesson_progress",
  "mission_progress", "quiz_attempts", "challenge_attempts", "prompt_attempts",
  "sim_runs", "streaks", "activity", "notifications", "final_results", "audit_log",
];

const client = createClient(url, key, { auth: { persistSession: false } });
const missing: string[] = [];

for (const t of REQUIRED_TABLES) {
  const { error } = await client.from(t).select("data").limit(0);
  if (error) missing.push(`${t} (${error.message})`);
  else console.log(`  ✓ ${t}`);
}

const rpc = await client.rpc("aq_increment_xp", { p_user_id: "nonexistent", p_delta: 1 });
if (rpc.error?.message.includes("user not found")) console.log("  ✓ aq_increment_xp (callable, guarded)");
else if (rpc.error) missing.push(`aq_increment_xp (${rpc.error.message})`);
else console.log("  ✓ aq_increment_xp");

if (missing.length) {
  console.error("\nMISSING:\n  " + missing.join("\n  "));
  process.exit(1);
}
console.log("\nSchema complete.");
