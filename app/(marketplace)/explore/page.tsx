import ExploreClient from "@/components/ExploreClient";
import { createServerClient } from "@/lib/supabase/server";
import { PRODUCT_COLUMNS, mapProduct } from "@/lib/catalog";

export const metadata = { title: "Jelajahi Model — Nexora AI" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; use?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: rows }, wishlistRes] = await Promise.all([
    supabase.from("products").select(PRODUCT_COLUMNS).eq("status", "published"),
    user
      ? supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { product_id: string }[] }),
  ]);

  const models = (rows ?? []).map(mapProduct);
  const wishlistedIds = (wishlistRes.data ?? []).map((w) => w.product_id);

  return (
    <ExploreClient
      models={models}
      wishlistedIds={wishlistedIds}
      loggedIn={!!user}
      initialQuery={sp.q ?? ""}
      initialCategory={sp.cat ?? "all"}
      initialUseCase={sp.use ?? ""}
    />
  );
}
