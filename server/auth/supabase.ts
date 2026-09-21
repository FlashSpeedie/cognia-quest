import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Supabase Auth server access.
 *
 * - `authClientForCookies()` reads/writes the browser session stored in
 *   httpOnly cookies (names managed by @supabase/ssr, "sb-*" prefixed).
 *   Writable only where Next.js allows cookie mutation (route handlers,
 *   server actions, middleware); in server components it is read-only.
 * - `adminClient()` uses the secret key for account provisioning. It never
 *   reaches the browser and never sees client-supplied role claims.
 */

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/** A Supabase client bound to the current request's cookie store. */
export async function authClientForCookies(options?: { writable?: boolean }) {
  const env = getSupabaseEnv();
  if (!env) throw new Error("Supabase is not configured");
  const writable = options?.writable ?? true;
  const jar = await cookies();
  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll: () => jar.getAll(),
      // RSC renders cannot set cookies; token refresh before render is the
      // middleware's job, so a no-op here is correct.
      setAll: writable
        ? (list: CookieToSet[]) => {
            for (const c of list) jar.set(c.name, c.value, c.options);
          }
        : () => {},
    },
  });
}

let adminSingleton: SupabaseClient | null = null;

/** Service-level client (secret key). Server-only. */
export function adminClient(): SupabaseClient {
  const env = getSupabaseEnv();
  if (!env) throw new Error("Supabase is not configured");
  if (!adminSingleton) {
    adminSingleton = createClient(env.url, env.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminSingleton;
}
