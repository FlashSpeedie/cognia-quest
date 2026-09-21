/**
 * Secure admin bootstrap for a PRODUCTION (Supabase) deployment.
 *
 *   SUPABASE_SECRET_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
 *     npx tsx scripts/make-admin.ts teacher@school.org
 *
 * The account must already exist (the teacher registers normally first).
 * This promotes their profile to role=admin via the secret key — there is
 * deliberately no "create admin account" UI or API anywhere in the app.
 * Run only from an operator machine; never expose the secret key.
 */
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Usage: tsx scripts/make-admin.ts <email>");
  process.exit(1);
}
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY in the environment.");
  process.exit(1);
}

const client = createClient(url, secret, { auth: { persistSession: false } });

const { data: rows, error: readErr } = await client
  .from("users")
  .select("data")
  .eq("data->>email", email)
  .limit(1);
if (readErr) {
  console.error("[make-admin] lookup failed:", readErr.message);
  process.exit(1);
}
const row = rows?.[0]?.data as { id?: string; role?: string } | undefined;
if (!row?.id) {
  console.error(`[make-admin] No profile for ${email}. Have them register first, then re-run this.`);
  process.exit(1);
}
if (row.role === "admin") {
  console.log(`[make-admin] ${email} is already an admin.`);
  process.exit(0);
}

const { error: updErr } = await client
  .from("users")
  .update({ data: { ...row, role: "admin" } })
  .eq("data->>id", row.id);
if (updErr) {
  console.error("[make-admin] update failed:", updErr.message);
  process.exit(1);
}
console.log(`[make-admin] ${email} promoted to admin.`);
