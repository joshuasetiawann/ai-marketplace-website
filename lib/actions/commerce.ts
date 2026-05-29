"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export type CommerceResult = { error?: string; ok?: boolean; needsAuth?: boolean };

async function requireUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Add one unit of a product to the current user's cart (increments if present). */
export async function addToCart(productId: string): Promise<CommerceResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { needsAuth: true };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("qty")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const { error } = await supabase.from("cart_items").upsert(
    { user_id: user.id, product_id: productId, qty: (existing?.qty ?? 0) + 1 },
    { onConflict: "user_id,product_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Toggle a product in the current user's wishlist. */
export async function toggleWishlist(productId: string): Promise<CommerceResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { needsAuth: true };

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  }

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ user_id: user.id, product_id: productId });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
