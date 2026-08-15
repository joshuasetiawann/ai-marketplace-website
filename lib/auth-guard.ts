import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Has this session cleared the second factor it is supposed to?
 *
 * The middleware enforces AAL2 by path, but a Server Action is a POST to
 * whatever route it was imported into — including public ones — so an AAL1
 * session could still drive the actions that move money or change the address
 * a recovery mail goes to. Call this in those actions, not in every action:
 * the point is to cover what an attacker holding only a password would target.
 *
 * Fails open when the lookup itself errors: a transient auth-server hiccup must
 * not lock someone out of their own settings.
 */
export async function hasRequiredAal(supabase: SupabaseClient): Promise<boolean> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!data) return true;
  return !(data.nextLevel === "aal2" && data.currentLevel !== "aal2");
}

/** Message shown when hasRequiredAal() says no. */
export const AAL_REQUIRED =
  "Selesaikan verifikasi 2 langkah dulu sebelum mengubah data ini.";
