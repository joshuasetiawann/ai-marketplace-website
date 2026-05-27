import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

/** Supabase client for Client Components (browser). */
export const createBrowserClient = () =>
  createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
