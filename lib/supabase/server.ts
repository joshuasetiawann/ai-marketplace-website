import { cache } from "react";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Reads/writes the session from httpOnly cookies via @supabase/ssr.
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSSRClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where cookies are read-only.
            // The middleware refreshes the session cookie instead.
          }
        },
      },
    },
  );
}

/**
 * The signed-in user, memoised for the duration of one request.
 *
 * getUser() is a network round-trip to the auth server — that is the point, it
 * revalidates the JWT instead of trusting the cookie — but the shell, the
 * layout and the page each used to make their own call, so a single navigation
 * cost three or four sequential round-trips before any HTML was streamed.
 * React's cache() collapses them into one per request.
 *
 * Server Components only: Server Actions run outside this render scope and
 * should keep calling supabase.auth.getUser() directly.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
