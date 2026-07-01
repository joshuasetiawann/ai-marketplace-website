"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export type AccountState = { error?: string; ok?: boolean };

/** Update the display name on the profile + auth metadata. */
export async function updateProfileName(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Nama tidak boleh kosong." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
  if (error) return { error: error.message };
  await supabase.auth.updateUser({ data: { name } });

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { ok: true };
}

/** Change password from the settings page (stays on settings, unlike the reset flow). */
export async function changePassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const current = String(formData.get("current") || "");
  const password = String(formData.get("password") || "");
  if (!current) return { error: "Masukkan password saat ini." };
  if (password.length < 8) return { error: "Password baru minimal 8 karakter." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  // Re-authenticate with the current password before allowing a change, so a
  // hijacked live session on an unlocked device can't silently take over.
  const { error: reauthErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (reauthErr) return { error: "Password saat ini salah." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { ok: true };
}

/** Change the account email. Supabase double-confirms (old + new address). */
export async function changeEmail(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Email wajib diisi." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (email === user.email) return { error: "Email sama dengan yang sekarang." };

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${env.SITE_URL}/auth/callback?next=/settings` },
  );
  if (error) return { error: error.message };
  return { ok: true };
}

/** Permanently delete the account after re-authentication. */
export async function deleteAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const current = String(formData.get("current") || "");
  if (!current) return { error: "Masukkan password untuk konfirmasi." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const { error: reauthErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
  if (reauthErr) return { error: "Password salah." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    // financial FKs (sales/payouts) are ON DELETE RESTRICT — a seller with a
    // revenue history can't be hard-deleted.
    return {
      error: "Akun tidak bisa dihapus karena punya riwayat penjualan/payout. Hubungi dukungan untuk penutupan toko.",
    };
  }

  await supabase.auth.signOut();
  redirect("/");
}

/** Sign out of every device (global scope). */
export async function signOutEverywhere(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}
