import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Auth callback: exchanges the `code` from a Supabase email link (signup
 * confirmation, password recovery) for a session cookie, then forwards to
 * `next`. Without this handler the PKCE code is never exchanged, so password
 * reset and email verification silently fail.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  // only allow same-origin relative redirects
  const dest = next.startsWith("/") ? next : "/dashboard";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${dest}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
