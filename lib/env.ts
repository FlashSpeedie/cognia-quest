/**
 * Runtime configuration decisions, centralized so every module agrees on
 * what "production mode" means. Rules:
 *  - Supabase (Auth + Postgres) is the production backend. When configured,
 *    local-only conveniences (demo login, HMAC-cookie auth, JSON store,
 *    rate-limit bypass) are inert.
 *  - The local datastore + scrypt auth exist for development and tests only.
 */

export interface SupabaseEnv {
  url: string;
  publishableKey: string;
  /** New-format sb_secret_ key, or legacy service_role JWT. */
  secretKey: string;
}

const supabaseUrl = () => (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = supabaseUrl();
  const publishableKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  ).trim();
  if (!url || !publishableKey || !secretKey) return null;
  return { url, publishableKey, secretKey };
}

/** True when the real production backend is wired up. */
export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/** Parsed with URL validation so a malformed value can't half-break boot. */
export function supabaseApiBase(): string | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  try {
    return new URL(env.url).origin;
  } catch {
    return null;
  }
}

// ── Gemini ────────────────────────────────────────────────────────────────
export function getGeminiConfig(): { apiKey: string; model: string } | null {
  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  if (!apiKey) return null;
  return {
    apiKey,
    model: (process.env.GEMINI_MODEL ?? "").trim() || "gemini-2.5-flash",
  };
}

// ── Demo mode ─────────────────────────────────────────────────────────────
/**
 * The shared demo account exists purely for local development, offline
 * judging and the E2E suite. It is deliberately unavailable whenever the
 * real production backend (Supabase) is configured.
 */
export function isDemoEnabled(): boolean {
  return !isSupabaseConfigured();
}

/** Refuse to let the test-only limiter bypass weaken a real deployment. */
export function isRateLimitBypassActive(): boolean {
  if (process.env.AQ_DISABLE_RATE_LIMIT !== "1") return false;
  if (isSupabaseConfigured()) {
    console.error(
      "[ai-quest] AQ_DISABLE_RATE_LIMIT is set but Supabase is configured — ignoring the bypass so production limits stay on.",
    );
    return false;
  }
  return true;
}
