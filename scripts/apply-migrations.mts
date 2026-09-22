#!/usr/bin/env tsx
/**
 * Applies supabase/migrations/*.sql in filename order against the project.
 *
 * PostgREST cannot run DDL, so this needs ONE of:
 *   SUPABASE_DB_URL     — direct pooler/postgres connection string
 *                         (Dashboard → Project Settings → Database)
 * or run the SQL manually in the Supabase SQL Editor, then:
 *   npx tsx scripts/verify-schema.ts
 */
import { readFileSync } from "fs";
import { join } from "path";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error(
    "SUPABASE_DB_URL is not set.\n\n" +
      "PostgREST cannot run DDL, so migrations must go through SQL. Do ONE of:\n" +
      "  1. Supabase Dashboard → SQL Editor → paste supabase/migrations/0001_init.sql (Run), then 0002_hardening.sql (Run)\n" +
      "  2. Set SUPABASE_DB_URL=postgres://postgres.<ref>:<password>@... in the environment and re-run this script\n\n" +
      "After applying, verify with: npx tsx scripts/verify-schema.ts",
  );
  process.exit(1);
}

const { Client } = await import("pg").catch(() => {
  console.error("The 'pg' package is not installed. Run: npm i -D pg");
  process.exit(1);
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

const files = ["0001_init.sql", "0002_hardening.sql"];
for (const f of files) {
  const sql = readFileSync(join(process.cwd(), "supabase", "migrations", f), "utf8");
  console.log(`Applying ${f}...`);
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("commit");
    console.log(`  ✓ ${f} applied`);
  } catch (e) {
    await client.query("rollback");
    throw new Error(`${f} failed: ${(e as Error).message}`);
  }
}
await client.end();
console.log("Migrations applied.");
