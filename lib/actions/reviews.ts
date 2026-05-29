"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

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

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    author_id: user.id,
    rating,
    body,
  });
  if (error) return { error: error.message };

  revalidatePath(`/model/${productId}`);
  return { ok: true };
}
