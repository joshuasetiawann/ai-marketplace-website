"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { dbMessage } from "@/lib/db-error";
import { TAG_PRODUCTS, productTag } from "@/lib/cache-tags";
import { field, tagList, LIMITS } from "@/lib/form";
import { MAX_PRICE_USD } from "@/lib/pricing";

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
  // Capped via field(): these land in `text` columns that are re-served on the
  // cached public catalog, and the form's maxlength does not survive a direct
  // Server Action POST.
  const name = field(formData, "name", LIMITS.short);
  const price = Number(formData.get("price") || 0);
  const category = field(formData, "category", LIMITS.short);
  if (!name) return { error: "Nama produk wajib diisi." };
  if (!category) return { error: "Pilih kategori." };
  // Upper bound as well as lower: price_usd and orders.total_usd are both
  // numeric(10,2), so price × MAX_QTY × PPN has to stay under 100 million or a
  // listing priced high enough makes checkout fail for whoever carts it.
  if (Number.isNaN(price) || price < 0 || price > MAX_PRICE_USD)
    return { error: "Harga tidak valid." };

  const intent = String(formData.get("intent") || "draft");
  const status = intent === "submit" ? "under_review" : "draft";

  const gallery = Math.min(6, Math.max(1, Math.trunc(Number(formData.get("gallery"))) || 3));
  const capabilities = parseCapabilities(formData.get("capabilities"));
  const specs = parseSpecs(formData.get("specs"));

  const record = {
    owner_id: user.id,
    name,
    tagline: field(formData, "tagline", LIMITS.line),
    category,
    tier: field(formData, "tier", LIMITS.short) || "Free",
    price_usd: price,
    description: field(formData, "description", LIMITS.long),
    icon: field(formData, "icon", LIMITS.short) || "apps",
    art: [
      field(formData, "art0", LIMITS.short) || "#0b3a44",
      field(formData, "art1", LIMITS.short) || "#00e5ff",
    ],
    use_cases: formData.getAll("use_cases").map((v) => String(v).slice(0, LIMITS.short)).slice(0, 20),
    use_case_tags: tagList(formData, "use_case_tags"),
    gallery,
    capabilities,
    specs,
    status,
  };

  let productId = id;
  if (id) {
    const { error } = await supabase.from("products").update(record).eq("id", id).eq("owner_id", user.id);
    if (error) return { error: dbMessage(error) };
  } else {
    const { data, error } = await supabase.from("products").insert(record).select("id").single();
    if (error) return { error: dbMessage(error) };
    productId = data.id;
  }

  // Editing a published product pulls it back to draft/under_review — drop it
  // from the cached catalog right away.
  updateTag(TAG_PRODUCTS);
  if (productId) updateTag(productTag(productId));

  // Fulfillment lives in product_assets (entitlement-gated). Upsert when set.
  const assetUrl = field(formData, "asset_url", LIMITS.line);
  const accessNote = field(formData, "access_note", LIMITS.body);
  // This value is rendered as the href of the buyer's download button, so a
  // `javascript:`/`data:` URL would execute in their session. type="url" on the
  // input is a browser courtesy — a direct Server Action call skips it.
  if (assetUrl && !isHttpUrl(assetUrl))
    return { error: "Tautan unduhan harus diawali http:// atau https://." };
  if (productId && (assetUrl || accessNote)) {
    const { error } = await supabase.from("product_assets").upsert(
      { product_id: productId, asset_url: assetUrl || null, access_note: accessNote || null },
      { onConflict: "product_id" },
    );
    if (error) return { error: dbMessage(error) };
  }

  revalidatePath("/sell/products");
  redirect("/sell/products");
}

/** Only web URLs may be stored — see the call site in saveProduct(). */
function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

type Capability = { icon: string; title: string; text: string };

function parseCapabilities(raw: FormDataEntryValue | null): Capability[] {
  try {
    const arr = JSON.parse(String(raw || "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((c) => c && typeof c.title === "string" && c.title.trim())
      .slice(0, 20) // JSON arrives whole from a public POST — bound it
      .map((c) => ({
        icon: String(c.icon || "bolt").slice(0, LIMITS.short),
        title: String(c.title).trim().slice(0, LIMITS.short),
        text: String(c.text || "").trim().slice(0, LIMITS.line),
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
    for (const [k, v] of Object.entries(obj).slice(0, 30)) {
      if (k.trim() && v != null && String(v).trim())
        out[k.trim().slice(0, LIMITS.short)] = String(v).trim().slice(0, LIMITS.line);
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
  updateTag(TAG_PRODUCTS);
  updateTag(productTag(id));
}

/** Pull a listing back to draft. */
export async function withdrawProduct(id: string) {
  const { supabase, user } = await requireSeller();
  await supabase.from("products").update({ status: "draft" }).eq("id", id).eq("owner_id", user.id);
  revalidatePath("/sell/products");
  updateTag(TAG_PRODUCTS);
  updateTag(productTag(id));
}

/** Delete a listing. */
export async function deleteProduct(id: string) {
  const { supabase, user } = await requireSeller();
  await supabase.from("products").delete().eq("id", id).eq("owner_id", user.id);
  revalidatePath("/sell/products");
  updateTag(TAG_PRODUCTS);
  updateTag(productTag(id));
}
