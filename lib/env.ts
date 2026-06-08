/**
 * Validated environment access. Throws a clear error at first use if a required
 * variable is missing, instead of failing deep inside a request with a cryptic
 * "undefined" error. NEXT_PUBLIC_* values are inlined at build time.
 */
function req(name: string, value: string | undefined): string {
  if (!value) throw new Error(`[env] Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  SUPABASE_URL: req("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  SUPABASE_ANON_KEY: req("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

/** Service-role key — server-only. Never reference from client code. */
export function serviceRoleKey(): string {
  return req("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}
