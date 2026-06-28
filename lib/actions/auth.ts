"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; ok?: boolean };

/**
 * Register a new account. Supabase Auth hashes the password (Argon2) and, with
 * email confirmations enabled, sends a verification link. On success we send the
 * user to /verify-email.
 */
export async function registerUser(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!name || !email) return { error: "Nama dan email wajib diisi." };
  if (password.length < 8)
    return { error: "Password minimal 8 karakter." };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    },
  });
  if (error) return { error: error.message };

  redirect("/verify-email");
}

/** Sign in with email + password. On success, go to the buyer dashboard. */
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email dan password wajib diisi." };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed")
      return { error: "Email belum diverifikasi. Cek kotak masuk kamu." };
    return { error: "Email atau password salah." };
  }
  redirect("/dashboard");
}

/** Sign out and return to the login screen. */
export async function signOut(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
