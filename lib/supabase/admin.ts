import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, serviceRoleKey } from "@/lib/env";

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY in trusted server code
 * for privileged operations (seeding, admin tasks). The `server-only` import
 * makes the build fail if this is ever imported into a Client Component.
 */
export const createAdminClient = () =>
  createClient(
    env.SUPABASE_URL,
    serviceRoleKey(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
