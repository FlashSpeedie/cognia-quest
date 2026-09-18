import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Schema, TableName } from "@/lib/types";
import type { Db, Table } from "./db";

/**
 * Supabase implementation of the Db abstraction.
 * Uses the SERVICE ROLE key — this module must only be imported on the
 * server (all data access happens in route handlers / server services).
 * RLS remains enabled as defense-in-depth; see supabase/migrations.
 *
 * Rows are stored JSONB-friendly: snake_case table names, columns match
 * the camelCase fields via jsonb payload column "data" plus indexed
 * scalar columns for filtering (id, userId, ...). Simplest robust shape:
 * one jsonb `data` column + generated id; filtering reads `data->>key`.
 */
export function createSupabaseDb(): Db {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const client: SupabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  function makeTable<K extends TableName>(name: K): Table<Schema[K]> {
    type Row = Schema[K];

    async function selectFiltered(pred?: Partial<Row>): Promise<Row[]> {
      let q = client.from(name).select("data");
      if (pred) {
        for (const [k, v] of Object.entries(pred)) {
          if (v === null) q = q.is(`data->>${k}`, null);
          else if (typeof v === "object") throw new Error(`Unsupported filter on ${name}.${k}`);
          else q = q.eq(`data->>${k}`, String(v));
        }
      }
      const { data, error } = await q;
      if (error) throw new Error(`Supabase ${name} select: ${error.message}`);
      return (data ?? []).map((r) => r.data as Row);
    }

    return {
      all: () => selectFiltered(),
      find: (pred) => selectFiltered(pred),
      first: async (pred) => (await selectFiltered(pred))[0] ?? null,
      get: async (id) => {
        const { data, error } = await client
          .from(name)
          .select("data")
          .eq("data->>id", id)
          .maybeSingle();
        if (error) throw new Error(`Supabase ${name} get: ${error.message}`);
        return (data?.data as Row) ?? null;
      },
      insert: async (row) => {
        const { error } = await client.from(name).insert({ data: row });
        if (error) throw new Error(`Supabase ${name} insert: ${error.message}`);
        return row;
      },
      update: async (id, patch) => {
        const current = await (async () => {
          const { data, error } = await client
            .from(name)
            .select("data")
            .eq("data->>id", id)
            .maybeSingle();
          if (error) throw new Error(error.message);
          return (data?.data as Row) ?? null;
        })();
        if (!current) return null;
        const merged = { ...current, ...patch };
        const { error } = await client
          .from(name)
          .update({ data: merged })
          .eq("data->>id", id);
        if (error) throw new Error(`Supabase ${name} update: ${error.message}`);
        return merged;
      },
      remove: async (id) => {
        const { error } = await client.from(name).delete().eq("data->>id", id);
        if (error) throw new Error(`Supabase ${name} delete: ${error.message}`);
      },
    };
  }

  return {
    table: makeTable,
    // PostgREST can't multi-statement; mutation flows use side-effect-safe
    // ordering (check-then-act with deterministic ids) in services.
    tx: (fn) => fn(),
  };
}
