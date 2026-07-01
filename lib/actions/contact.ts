"use server";

import { createServerClient } from "@/lib/supabase/server";
import { allow } from "@/lib/ratelimit";
import { logError } from "@/lib/log";

export type ContactState = { error?: string; ok?: boolean };

/** Store an inbound support/contact message (readable only by admins). */
export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!name || !email) return { error: "Nama dan email wajib diisi." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Email tidak valid." };
  if (body.length < 10) return { error: "Pesan terlalu pendek (min. 10 karakter)." };
  if (!(await allow("contact", 5, 60_000)))
    return { error: "Terlalu banyak pesan. Coba lagi sebentar." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("contact_messages")
    .insert({ user_id: user?.id ?? null, name, email, subject, body });
  if (error) {
    logError("contact insert failed", error);
    return { error: "Gagal mengirim pesan. Coba lagi." };
  }
  return { ok: true };
}
