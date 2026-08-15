"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { dbMessage } from "@/lib/db-error";
import { TAG_STORES } from "@/lib/cache-tags";

export type SellerState = { error?: string };

/** Open a store ("Buka Toko"): flag the profile as a seller + create the store. */
export async function openStore(_prev: SellerState, formData: FormData): Promise<SellerState> {
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "");
  const tagline = String(formData.get("tagline") || "").trim();
  const agree = formData.get("agree") === "on";
  if (!name) return { error: "Masukkan nama toko." };
  if (!category) return { error: "Pilih kategori utama toko." };
  if (!agree) return { error: "Setujui Perjanjian Penjual untuk lanjut." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sell/start");

  // is_seller is server-managed (users can't self-grant it) — open_store() is a
  // SECURITY DEFINER RPC that flips the flag + creates the store atomically,
  // handling handle collisions.
  const { error } = await supabase.rpc("open_store", {
    p_name: name,
    p_category: category,
    p_tagline: tagline,
  });
  if (error) return { error: dbMessage(error) };

  revalidatePath("/", "layout");
  updateTag(TAG_STORES);
  redirect("/sell");
}

/** Update store details from the seller studio. */
export async function saveStore(_prev: SellerState, formData: FormData): Promise<SellerState> {
  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const category = String(formData.get("category") || "");
  if (!name) return { error: "Nama toko wajib diisi." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("stores").update({ name, tagline, category }).eq("owner_id", user.id);
  if (error) return { error: dbMessage(error) };
  revalidatePath("/sell");
  updateTag(TAG_STORES);
  return {};
}
