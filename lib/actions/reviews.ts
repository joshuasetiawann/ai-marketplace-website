"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { dbMessage } from "@/lib/db-error";
import { TAG_PRODUCTS, productTag } from "@/lib/cache-tags";
import { field, LIMITS } from "@/lib/form";

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
  // reviews.rating is an int column: the star picker only ever sends whole
  // numbers, but a direct Server Action call sending 3.7 would reach Postgres
  // as a type error instead of a message the reviewer can act on.
  const rating = Math.round(Number(formData.get("rating") || 0));
  const body = field(formData, "body", LIMITS.body);

  if (!productId) return { error: "Produk tidak valid." };
  if (!Number.isFinite(rating) || rating < 1 || rating > 5)
    return { error: "Pilih rating 1–5 bintang." };

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
  if (error) return { error: dbMessage(error) };

  revalidatePath(`/model/${productId}`);
  // New review changes the list AND the product's live rating/reviews_count
  // (DB trigger), which drive card badges and trending order.
  updateTag(productTag(productId));
  updateTag(TAG_PRODUCTS);
  return { ok: true };
}
