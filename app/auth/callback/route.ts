import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/nav";

/**
 * Auth callback: exchanges the `code` from a Supabase email link (signup
 * confirmation, password recovery) for a session cookie, then forwards to
 * `next`. Without this handler the PKCE code is never exchanged, so password
 * reset and email verification silently fail.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // one shared rule for every post-auth redirect (see lib/nav.ts)
  const dest = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${dest}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
