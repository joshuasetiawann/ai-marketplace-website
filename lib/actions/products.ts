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

  const gallery = Math.min(6, Math.max(1, Math.trunc(Number(formData.get("gallery"))) || 3));
  const capabilities = parseCapabilities(formData.get("capabilities"));
  const specs = parseSpecs(formData.get("specs"));

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
    gallery,
    capabilities,
    specs,
    status,
  };

  let productId = id;
  if (id) {
    const { error } = await supabase.from("products").update(record).eq("id", id).eq("owner_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase.from("products").insert(record).select("id").single();
    if (error) return { error: error.message };
    productId = data.id;
  }

  // Fulfillment lives in product_assets (entitlement-gated). Upsert when set.
  const assetUrl = String(formData.get("asset_url") || "").trim();
  const accessNote = String(formData.get("access_note") || "").trim();
  if (productId && (assetUrl || accessNote)) {
    const { error } = await supabase.from("product_assets").upsert(
      { product_id: productId, asset_url: assetUrl || null, access_note: accessNote || null },
      { onConflict: "product_id" },
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/sell/products");
  redirect("/sell/products");
}

type Capability = { icon: string; title: string; text: string };

function parseCapabilities(raw: FormDataEntryValue | null): Capability[] {
  try {
    const arr = JSON.parse(String(raw || "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((c) => c && typeof c.title === "string" && c.title.trim())
      .map((c) => ({
        icon: String(c.icon || "bolt"),
        title: String(c.title).trim(),
        text: String(c.text || "").trim(),
      }));
  } catch {
    return [];
  }
}

function parseSpecs(raw: FormDataEntryValue | null): Record<string, string> {
  try {
    const obj = JSON.parse(String(raw || "{}"));
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.trim() && v != null && String(v).trim()) out[k.trim()] = String(v).trim();
    }
    return out;
  } catch {
    return {};
  }
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
