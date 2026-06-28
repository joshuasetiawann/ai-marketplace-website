"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export type ProductState = { error?: string };

async function requireSeller() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sell/products");
  return { supabase, user };
}

/** Create (no id) or update (id present) a product. intent=submit sends it to review. */
export async function saveProduct(_prev: ProductState, formData: FormData): Promise<ProductState> {
  const { supabase, user } = await requireSeller();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const price = Number(formData.get("price") || 0);
  const category = String(formData.get("category") || "");
  if (!name) return { error: "Nama produk wajib diisi." };
  if (!category) return { error: "Pilih kategori." };
  if (Number.isNaN(price) || price < 0) return { error: "Harga tidak valid." };

  const intent = String(formData.get("intent") || "draft");
  const status = intent === "submit" ? "under_review" : "draft";

  const record = {
    owner_id: user.id,
    name,
    tagline: String(formData.get("tagline") || "").trim(),
    category,
    tier: String(formData.get("tier") || "Free"),
    price_usd: price,
    description: String(formData.get("description") || "").trim(),
    icon: String(formData.get("icon") || "apps"),
    art: [String(formData.get("art0") || "#0b3a44"), String(formData.get("art1") || "#00e5ff")],
    use_cases: formData.getAll("use_cases").map(String),
    use_case_tags: String(formData.get("use_case_tags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    status,
  };

  if (id) {
    const { error } = await supabase.from("products").update(record).eq("id", id).eq("owner_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("products").insert(record);
    if (error) return { error: error.message };
  }

  revalidatePath("/sell/products");
  redirect("/sell/products");
}

/** Submit a draft for moderation. */
export async function submitForReview(id: string) {
  const { supabase, user } = await requireSeller();
  await supabase.from("products").update({ status: "under_review" }).eq("id", id).eq("owner_id", user.id);
  revalidatePath("/sell/products");
}

/** Pull a listing back to draft. */
export async function withdrawProduct(id: string) {
  const { supabase, user } = await requireSeller();
  await supabase.from("products").update({ status: "draft" }).eq("id", id).eq("owner_id", user.id);
  revalidatePath("/sell/products");
}

/** Delete a listing. */
export async function deleteProduct(id: string) {
  const { supabase, user } = await requireSeller();
  await supabase.from("products").delete().eq("id", id).eq("owner_id", user.id);
  revalidatePath("/sell/products");
}
