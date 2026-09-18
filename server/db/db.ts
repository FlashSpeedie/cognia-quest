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

let cached: { dbView: Db } | null = null;

export async function getDb(): Promise<Db> {
  if (cached) return cached.dbView;
  const useSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (useSupabase) {
    const { createSupabaseDb } = await import("./supabase");
    cached = { dbView: createSupabaseDb() };
  } else {
    const { createLocalDb } = await import("./local");
    cached = { dbView: await createLocalDb() };
  }
  return cached.dbView;
}

/** Test hook: reset the cached Db so tests can point at a temp file. */
export function __resetDbForTests() {
  cached = null;
}

export function newId(): string {
  return globalThis.crypto.randomUUID();
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
