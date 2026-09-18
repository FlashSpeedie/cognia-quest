import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { getSessionUser } from "@/server/auth/session";
import { rateLimit, sweepBuckets } from "@/lib/ratelimit";
import type { User } from "@/lib/types";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Parse + validate a JSON body against a zod schema. */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: error("Invalid JSON body") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: error(parsed.error.issues[0]?.message ?? "Invalid input", 422) };
  }
  return { ok: true, data: parsed.data };
}

/** Rate-limit by IP + route key → 429 response when exceeded. */
export function throttle(req: Request, key: string, limit: number, windowMs?: number): NextResponse | null {
  sweepBuckets();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const r = rateLimit(`${key}:${ip}`, limit, windowMs);
  if (!r.ok) return error("Too many requests — slow down a moment.", 429);
  return null;
}

/** Require an authenticated user or return a 401 response. */
export async function requireUser(): Promise<{ user: User } | { response: NextResponse }> {
  const user = await getSessionUser();
  if (!user) return { response: error("Authentication required", 401) };
  return { user };
}

/** Require an admin user or return 403. */
export async function requireAdmin(): Promise<{ user: User } | { response: NextResponse }> {
  const got = await requireUser();
  if ("response" in got) return got;
  if (got.user.role !== "admin") return { response: error("Admin access required", 403) };
  return { user: got.user };
}
