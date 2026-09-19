import { promises as fs } from "fs";
import path from "path";
import type { Schema, TableName } from "@/lib/types";
import type { Db, Table } from "./db";

/**
 * Self-contained development datastore: a single JSON document persisted
 * atomically (write tmp + rename). All rows are plain objects.
 * Serializes all access through a promise queue to avoid torn writes.
 */

type StoreShape = { [K in TableName]: Array<Schema[K]> };

const EMPTY: StoreShape = {
  users: [],
  sessions: [],
  xp_events: [],
  badge_states: [],
  lesson_progress: [],
  mission_progress: [],
  quiz_attempts: [],
  challenge_attempts: [],
  prompt_attempts: [],
  sim_runs: [],
  streaks: [],
  activity: [],
  notifications: [],
  final_results: [],
  audit_log: [],
};

function matches<T extends { id: string }>(row: T, pred: Partial<T>): boolean {
  return Object.entries(pred).every(
    ([k, v]) => (row as Record<string, unknown>)[k] === v,
  );
}

export async function createLocalDb(dbPath?: string): Promise<Db> {
  const file = path.resolve(
    process.cwd(),
    dbPath ?? process.env.LOCAL_DB_PATH ?? "data/dev-db.json",
  );

  let data: StoreShape | null = null;
  let queue: Promise<unknown> = Promise.resolve();
  /** >0 while executing inside tx() — inner ops run directly (re-entrant). */
  let depth = 0;
  let tmpCounter = 0;

  async function load(): Promise<StoreShape> {
    if (data) return data;
    try {
      const raw = await fs.readFile(file, "utf8");
      const parsed = JSON.parse(raw) as Partial<StoreShape>;
      data = { ...structuredClone(EMPTY), ...parsed };
    } catch {
      data = structuredClone(EMPTY);
      await persist();
    }
    return data!;
  }

  async function persist(): Promise<void> {
    if (!data) return;
    await fs.mkdir(path.dirname(file), { recursive: true });
    // Unique tmp per call: Next.js can bundle this module into multiple
    // chunks (one per route), each with its own copy of this store; a shared
    // static tmp filename caused cross-writer ENOENT collisions on rename.
    const tmp = `${file}.${process.pid}.${++tmpCounter}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data));
    await fs.rename(tmp, file);
  }

  function enqueue<R>(fn: () => Promise<R>): Promise<R> {
    if (depth > 0) return fn(); // re-entrant: already inside the queue
    const run = queue.then(fn);
    queue = run.catch(() => {});
    return run;
  }

  function makeTable<K extends TableName>(name: K): Table<Schema[K]> {
    type Row = Schema[K];
    return {
      all: () => enqueue(async () => [...(await load())[name]] as Row[]),
      find: (pred) =>
        enqueue(async () =>
          (await load())[name].filter((r) => matches(r as Row, pred as Partial<Row>)),
        ) as Promise<Row[]>,
      first: async (pred) =>
        enqueue(
          async () =>
            ((await load())[name].find((r) =>
              matches(r as Row, pred as Partial<Row>),
            ) as Row | undefined) ?? null,
        ),
      get: (id) =>
        enqueue(
          async () =>
            ((await load())[name].find((r) => r.id === id) as Row | undefined) ?? null,
        ),
      insert: (row) =>
        enqueue(async () => {
          const d = await load();
          if (d[name].some((r) => r.id === row.id)) {
            throw new Error(`Duplicate id in ${name}: ${row.id}`);
          }
          (d[name] as Row[]).push(row);
          await persist();
          return row;
        }),
      update: (id, patch) =>
        enqueue(async () => {
          const d = await load();
          const i = d[name].findIndex((r) => r.id === id);
          if (i === -1) return null;
          const merged = { ...d[name][i], ...patch } as Row;
          (d[name] as Row[])[i] = merged;
          await persist();
          return merged;
        }),
      remove: (id) =>
        enqueue(async () => {
          const d = await load();
          const i = d[name].findIndex((r) => r.id === id);
          if (i !== -1) {
            d[name].splice(i, 1);
            await persist();
          }
        }),
    };
  }

  return {
    table: makeTable,
    tx: (fn) =>
      enqueue(async () => {
        depth++;
        try {
          return await fn();
        } finally {
          depth--;
        }
      }),
  };
}
