"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { safeNext } from "@/lib/nav";
import { allow } from "@/lib/ratelimit";
import { field, LIMITS } from "@/lib/form";

export type AuthState = { error?: string; ok?: boolean };

/**
 * Supabase Auth returns English strings; the UI is Indonesian. Map the errors a
 * user can actually trigger and fall back to a generic line so a raw GoTrue
 * message never reaches the screen.
 */
function authMessage(error: { code?: string }): string {
  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return "Email ini sudah terdaftar. Silakan masuk.";
    case "weak_password":
      return "Password terlalu lemah. Gunakan minimal 8 karakter.";
    case "email_address_invalid":
    case "validation_failed":
      return "Format email tidak valid.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
    case "email_not_confirmed":
      return "Email belum diverifikasi. Cek kotak masuk kamu.";
    case "same_password":
      return "Password baru harus berbeda dari yang lama.";
    default:
      return "Terjadi kesalahan. Coba lagi sebentar lagi.";
  }
}

/**
 * Register a new account. Supabase Auth hashes the password (Argon2). With email
 * confirmations enabled it sends a verification link and returns no session, so
 * we land on /verify-email; with them off (local dev) signup returns a session
 * and the user goes straight to the dashboard.
 */
export async function registerUser(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = field(formData, "name", LIMITS.short);
  const email = field(formData, "email", LIMITS.short);
  const password = String(formData.get("password") || "");

  if (!name || !email) return { error: "Nama dan email wajib diisi." };
  if (password.length < 8)
    return { error: "Password minimal 8 karakter." };
  if (!(await allow("auth:register", 5, 60_000)))
    return { error: "Terlalu banyak pendaftaran. Coba lagi sebentar." };

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${env.SITE_URL}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: authMessage(error) };
  // With confirmations on, Supabase hides "already registered" behind a success
  // response carrying an empty identities array. Say so, instead of parking the
  // user on a verification screen waiting for a mail that never comes.
  if (data.user && data.user.identities?.length === 0)
    return { error: "Email ini sudah terdaftar. Silakan masuk." };

  // Confirmations off (local dev) ⇒ signUp already returned a session.
  if (data.session) redirect("/dashboard");
  redirect("/verify-email");
}

/** Sign in with email + password. On success, go where the user was headed. */
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email dan password wajib diisi." };
  if (!(await allow("auth:signin", 10, 60_000)))
    return { error: "Terlalu banyak percobaan masuk. Coba lagi sebentar." };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // "not confirmed" is also a 400, so it has to be checked before the
    // credentials fallback below or it would be reported as a wrong password.
    if (error.code === "email_not_confirmed") return { error: authMessage(error) };
    // Wrong email and wrong password share one message on purpose — telling them
    // apart would let anyone probe which addresses have accounts.
    if (error.code === "invalid_credentials" || error.status === 400)
      return { error: "Email atau password salah." };
    return { error: authMessage(error) };
  }

  // Step up to AAL2 when the account has a verified 2FA factor — a password
  // alone must not grant a fully-privileged session.
  const next = safeNext(formData.get("next"));
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    // carry the destination through the challenge — a 2FA user who clicked a
    // product link should land on that product, not on the dashboard
    redirect(`/login/2fa?next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

/** Sign out and return to the login screen. */
export async function signOut(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Send a password-reset email with a link back to /reset-password. */
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Email wajib diisi." };
  if (!(await allow("auth:reset", 4, 60_000)))
    return { error: "Terlalu banyak permintaan. Coba lagi nanti." };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.SITE_URL}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: authMessage(error) };
  return { ok: true };
}

/**
 * Set a new password (used after following the reset link).
 *
 * A Server Action is a public POST endpoint, so this one is reachable by ANY
 * live session — not just the recovery session the reset page hands it. Without
 * the check below, a hijacked session could set a new password without knowing
 * the old one, walking straight around changePassword()'s re-authentication.
 *
 * The gate is phrased as a denylist on purpose: a recovery link produces an
 * `otp` (older flows: `magiclink`) amr entry, never `password` — and GoTrue's
 * method vocabulary has changed before, so allow-listing the recovery method
 * would silently break the whole reset flow the day it is renamed. Rejecting
 * password-derived sessions closes the actual hole and survives that rename.
 */
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { error: "Password minimal 8 karakter." };

  const supabase = await createServerClient();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const methods = (aal?.currentAuthenticationMethods ?? []).map((m) =>
    typeof m === "string" ? m : m.method,
  );
  if (methods.includes("password"))
    return {
      error:
        "Halaman ini hanya untuk reset lewat tautan email. Untuk mengganti password akun yang sedang masuk, buka Pengaturan.",
    };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authMessage(error) };
  redirect("/dashboard");
}
