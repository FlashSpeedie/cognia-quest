/**
 * Tiny in-memory sliding-window rate limiter (spec §31).
 * Suitable for single-instance deployments; swap for Redis/Upstash at scale.
 *
 * Test-only escape hatch: if AQ_DISABLE_RATE_LIMIT=1 (set by the Playwright
 * webServer process), limiting is a no-op so E2E runs are deterministic.
 * Never set in production — the variable only exists server-side.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;

// Evaluated once at server boot; only ever set by the E2E webServer config.
const LIMITS_DISABLED = process.env.AQ_DISABLE_RATE_LIMIT === "1";

export function rateLimit(key: string, limit: number, windowMs = WINDOW_MS): { ok: boolean; remaining: number } {
  if (LIMITS_DISABLED) return { ok: true, remaining: limit };
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { ok: false, remaining: 0 };
  b.count++;
  return { ok: true, remaining: limit - b.count };
}

// prune occasionally to avoid unbounded growth
let lastSweep = 0;
export function sweepBuckets() {
  const now = Date.now();
  if (now - lastSweep < 300_000) return;
  lastSweep = now;
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}
sweepBuckets();
