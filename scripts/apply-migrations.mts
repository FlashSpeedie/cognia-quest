#!/usr/bin/env tsx
/**
 * Applies supabase/migrations/*.sql in filename order against the project.
 *
 * PostgREST cannot run DDL, so this needs ONE of:
 *   SUPABASE_DB_URL     - direct pooler/postgres connection string
 *                         (Dashboard → Project Settings → Database)
 *   npx supabase db push --project-ref <ref>  (CLI, logged in)
 * or run the SQL manually in the Supabase SQL Editor, then:
 *   npx tsx scripts/verify-schema.ts
 *
 * Usage:
 *   npx tsx scripts/apply-migrations.mts                # all migrations, in order (fresh database)
 *   npx tsx scripts/apply-migrations.mts 0004_academy_module_results.sql
 *                                                        # just the named file(s) - for
 *                                                        # already-provisioned databases.
 *                                                        # NEVER re-run 0001/0002 there:
 *                                                        # their CREATE POLICY statements
 *                                                        # fail against existing policies.
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error(
    "SUPABASE_DB_URL is not set.\n\n" +
      "PostgREST cannot run DDL, so migrations must go through SQL. Do ONE of:\n" +
      "  1. Supabase Dashboard → SQL Editor → run each new supabase/migrations/*.sql (Run)\n" +
      "  2. npx supabase db push --project-ref <ref>  (Supabase CLI, logged in)\n" +
      "  3. Set SUPABASE_DB_URL=postgres://postgres.<ref>:<password>@... in the environment and re-run this script\n\n" +
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

// All migration files in filename order, or exactly the files passed as args
// (for applying a later migration to an already-provisioned database).
const dir = join(process.cwd(), "supabase", "migrations");
const all = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const requested = process.argv.slice(2);
const files = requested.length > 0 ? requested : all;
for (const f of files) {
  if (!existsSync(join(dir, f))) {
    console.error(`Unknown migration file: ${f} (looked in supabase/migrations)`);
    process.exit(1);
  }
}

for (const f of files) {
  const sql = readFileSync(join(dir, f), "utf8");
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
