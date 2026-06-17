import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Cookie-less anon Supabase client for cached public reads — "use cache"
 * scopes can't read request cookies, and cached data must never depend on
 * who is asking. Sees exactly what a logged-out visitor sees (anon RLS):
 * published products, stores, reviews, profile names. Never use it for
 * per-user or privileged data.
 */
export function createPublicClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
