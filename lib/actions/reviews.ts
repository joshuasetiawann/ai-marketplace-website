"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { TAG_PRODUCTS, productTag } from "@/lib/cache-tags";

export type ReviewState = { error?: string; ok?: boolean };

export type ReviewItem = {
  id: string;
  rating: number;
  body: string;
  created_at: string;
  authorName: string;
};

/** Post a review for a product. Logged-in users only (RLS: author = auth.uid()). */
export async function postReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const productId = String(formData.get("productId") || "");
  const rating = Number(formData.get("rating") || 0);
  const body = String(formData.get("body") || "").trim();

  if (!productId) return { error: "Produk tidak valid." };
  if (rating < 1 || rating > 5) return { error: "Pilih rating 1–5 bintang." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk dulu untuk menulis ulasan." };

  // Upsert on (product_id, author_id): one review per user, editable. The DB
  // guard enforces verified-purchase + no self-review and surfaces a friendly
  // message on violation.
  const { error } = await supabase.from("reviews").upsert(
    { product_id: productId, author_id: user.id, rating, body },
    { onConflict: "product_id,author_id" },
  );
  if (error) return { error: error.message };

  revalidatePath(`/model/${productId}`);
  // New review changes the list AND the product's live rating/reviews_count
  // (DB trigger), which drive card badges and trending order.
  updateTag(productTag(productId));
  updateTag(TAG_PRODUCTS);
  return { ok: true };
}
