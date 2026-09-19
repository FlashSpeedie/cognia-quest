import type { Schema, TableName } from "@/lib/types";

/**
 * Minimal table abstraction over either the local JSON dev store or
 * Supabase Postgres. Queries are simple equality filters; richer logic
 * lives in server/services (loaded rows are plain objects).
 */
export interface Table<T extends { id: string }> {
  all(): Promise<T[]>;
  find(pred: Partial<T>): Promise<T[]>;
  first(pred: Partial<T>): Promise<T | null>;
  get(id: string): Promise<T | null>;
  insert(row: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<void>;
}

export interface Db {
  table<K extends TableName>(name: K): Table<Schema[K]>;
  /** Serializes writes (local store flushes; supabase is a passthrough). */
  tx<R>(fn: () => Promise<R>): Promise<R>;
}

// Next.js bundles the same module into separate chunks per route, so a plain
// module-level singleton is NOT unique per process. globalThis is.
const g = globalThis as unknown as { __aqDb?: Db };

export async function getDb(): Promise<Db> {
  if (g.__aqDb) return g.__aqDb;
  const useSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (useSupabase) {
    const { createSupabaseDb } = await import("./supabase");
    g.__aqDb = createSupabaseDb();
  } else {
    const { createLocalDb } = await import("./local");
    g.__aqDb = await createLocalDb();
  }
  return g.__aqDb;
}

/** Test hook: reset the cached Db so tests can point at a temp file. */
export function __resetDbForTests() {
  delete g.__aqDb;
}

export function newId(): string {
  return globalThis.crypto.randomUUID();
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
