import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Supabase Auth callback: exchanges the `code` from signup-confirmation and
 * password-recovery emails for a session, then forwards the user on.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  // Only same-site paths may be redirect targets.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const origin = url.origin;

  const env = getSupabaseEnv();
  if (!env || !code) return NextResponse.redirect(new URL("/login", origin));

  const response = NextResponse.redirect(new URL(target, origin));
  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        for (const c of list) response.cookies.set(c.name, c.value, c.options);
      },
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[ai-quest] auth/callback exchange failed:", error.message);
    return NextResponse.redirect(new URL("/login?error=auth-callback", origin));
  }
  return response;
}
