import ExploreClient from "@/components/ExploreClient";
import { createServerClient } from "@/lib/supabase/server";
import { PRODUCT_COLUMNS, mapProduct } from "@/lib/catalog";

export const metadata = { title: "Jelajahi Model — Nexora AI" };

const PAGE_SIZE = 12;

type SP = {
  q?: string;
  cat?: string;
  use?: string;
  tier?: string;
  rating?: string;
  sort?: string;
  page?: string;
};

export default async function ExplorePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const page = Math.max(1, Number(sp.page) || 1);
  const cat = sp.cat ?? "all";
  const use = sp.use ?? "";
  const tiers = (sp.tier ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const minRating = Number(sp.rating) || 0;
  const sort = sp.sort ?? "trending";
  const q = (sp.q ?? "").trim();

  let query = supabase
    .from("products")
    .select(PRODUCT_COLUMNS, { count: "exact" })
    .eq("status", "published");

  if (cat !== "all") query = query.eq("category", cat);
  if (use) query = query.contains("use_cases", [use]);
  if (tiers.length) query = query.in("tier", tiers);
  if (minRating) query = query.gte("rating", minRating);
  if (q) {
    // search name/tagline/description; sanitize to keep the PostgREST or() grammar intact
    const safe = q.replace(/[,()*%]/g, " ").trim();
    if (safe) query = query.or(`name.ilike.*${safe}*,tagline.ilike.*${safe}*,description.ilike.*${safe}*`);
  }

  switch (sort) {
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "price-low":
      query = query.order("price_usd", { ascending: true });
      break;
    case "price-high":
      query = query.order("price_usd", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default: // trending
      query = query.order("rating", { ascending: false }).order("reviews_count", { ascending: false });
  }

  // cumulative range so "muat lebih banyak" keeps earlier results
  query = query.range(0, page * PAGE_SIZE - 1);

  const [{ data: rows, count }, wishlistRes] = await Promise.all([
    query,
    user
      ? supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { product_id: string }[] }),
  ]);

  const models = (rows ?? []).map(mapProduct);
  const total = count ?? models.length;

  return (
    <ExploreClient
      models={models}
      total={total}
      hasMore={models.length < total}
      wishlistedIds={(wishlistRes.data ?? []).map((w) => w.product_id)}
      loggedIn={!!user}
      params={{ q, cat, use, tiers, minRating, sort, page }}
    />
  );
}
