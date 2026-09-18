import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { createLocalDb } from "@/server/db/local";
import type { Db } from "@/server/db/db";

/** Fresh throwaway local store per integration test file. */
export async function freshDb(): Promise<Db> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "aq-test-"));
  return createLocalDb(path.join(dir, "db.json"));
}
