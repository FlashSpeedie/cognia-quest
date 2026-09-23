import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Keeps Supabase sessions alive across requests: when the access token is
 * expired or close to it, @supabase/ssr rotates it using the refresh-token
 * cookie and re-emits fresh cookies on the response (and the request, so
 * server components rendered by this same request see the new token).
 *
 * Inert when Supabase isn't configured (local dev/test auth instead).
 */
export async function middleware(req: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) return NextResponse.next();

  let response = NextResponse.next({ request: req });
  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        for (const c of list) req.cookies.set(c.name, c.value);
        response = NextResponse.next({ request: req });
        for (const c of list) response.cookies.set(c.name, c.value, c.options);
      },
    },
  });
  // Triggers a refresh when needed; result deliberately unused here -
  // authorization decisions are made by layouts/route handlers.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon\\.svg|favicon|robots|sitemap|manifest|sw\\.js).*)"],
};
