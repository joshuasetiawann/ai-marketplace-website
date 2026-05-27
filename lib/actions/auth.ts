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
