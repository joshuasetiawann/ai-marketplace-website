import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes that require an authenticated session. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/cart",
  "/checkout",
  "/wishlist",
  "/orders",
  "/settings",
  "/sell",
  "/admin",
];

/**
 * Refresh the Supabase session on every request and guard protected routes.
 * Must return the `response` object it builds so refreshed auth cookies are sent.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the JWT against the auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // 2FA enforcement: a logged-in user who has a verified factor but has not
  // stepped up to AAL2 must complete the challenge before reaching any
  // protected route (defense-in-depth beyond the login redirect).
  if (user && needsAuth && !path.startsWith("/login")) {
    try {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel === "aal1") {
        const url = request.nextUrl.clone();
        url.pathname = "/login/2fa";
        url.search = "";
        return NextResponse.redirect(url);
      }
    } catch {
      // transient MFA lookup failure — don't block navigation
    }
  }

  return response;
}
