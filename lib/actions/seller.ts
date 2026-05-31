"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export type SellerState = { error?: string };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "toko";

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

  const { error: pErr } = await supabase.from("profiles").update({ is_seller: true }).eq("id", user.id);
  if (pErr) return { error: pErr.message };

  const base = { owner_id: user.id, name, tagline, category };
  let handle = slug(name);
  let { error } = await supabase.from("stores").upsert({ ...base, handle }, { onConflict: "owner_id" });
  if (error && error.code === "23505") {
    // handle already taken by another store — disambiguate with the user id
    handle = `${handle}-${user.id.slice(0, 4)}`;
    ({ error } = await supabase.from("stores").upsert({ ...base, handle }, { onConflict: "owner_id" }));
  }
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
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
  if (error) return { error: error.message };
  revalidatePath("/sell");
  return {};
}
