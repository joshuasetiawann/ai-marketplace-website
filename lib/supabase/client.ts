import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Supabase client for Client Components (browser). */
export const createBrowserClient = () =>
  createSSRBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
