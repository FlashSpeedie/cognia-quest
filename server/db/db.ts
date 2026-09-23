import { isSupabaseConfigured } from "@/lib/env";
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
  /**
   * Atomically add delta to users.xpTotal and return the new total.
   * Local store: serialized queue. Supabase: single-statement RPC.
   */
  incrementUserXp(userId: string, delta: number): Promise<number>;
}

// Next.js bundles the same module into separate chunks per route, so a plain
// module-level singleton is NOT unique per process. globalThis is.
const g = globalThis as unknown as { __aqDb?: Db };

export async function getDb(): Promise<Db> {
  if (g.__aqDb) return g.__aqDb;
  if (isSupabaseConfigured()) {
    const { createSupabaseDb } = await import("./supabase");
    g.__aqDb = createSupabaseDb();
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[ai-quest] Supabase is not configured - running on the LOCAL JSON datastore. " +
          "That store is for development/judging only; do not use it as production state. " +
          "Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY.",
      );
    }
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
