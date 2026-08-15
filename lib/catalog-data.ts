// Cached fetchers for the public catalog ("use cache" + cacheTag/cacheLife,
// enabled via experimental.useCache). All reads go through the cookie-less
// anon client, so entries are shared across visitors and can never leak
// per-user data. Freshness: served ≤1 min as-is, background-refreshed after
// 5 min, hard-expired after 1 h — and invalidated immediately by the
// updateTag() calls in lib/actions/{products,reviews,admin,seller,account}.ts.

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { TAG_PRODUCTS, TAG_STORES, productTag } from "@/lib/cache-tags";
import { PRODUCT_COLUMNS, mapProduct, type Model } from "@/lib/catalog";
import { USD_TO_IDR } from "@/lib/pricing";
import type { ReviewItem } from "@/lib/actions/reviews";

const CATALOG_LIFE = { stale: 60, revalidate: 300, expire: 3600 } as const;

/** Postgres "invalid input syntax" — a malformed id in the URL, not an outage. */
const MALFORMED_INPUT = "22P02";

export type StoreSummary = {
  owner_id: string;
  name: string;
  handle: string;
  tagline: string | null;
  category: string | null;
};

/**
 * The Beranda rails. Two ordered LIMIT queries instead of pulling the entire
 * published catalog and slicing 4 + 4 out of it in JavaScript — the old shape
 * grew its payload linearly with the catalog to render eight cards.
 */
export async function getHomeRails(count = 4): Promise<{ trending: Model[]; fresh: Model[] }> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_PRODUCTS);
  const supabase = createPublicClient();
  const [trendingRes, freshRes] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("status", "published")
      .order("rating", { ascending: false })
      .order("reviews_count", { ascending: false })
      .limit(count),
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(count),
  ]);
  // Throw instead of caching an empty catalog for the whole revalidate window.
  if (trendingRes.error) throw new Error(`getHomeRails/trending: ${trendingRes.error.message}`);
  if (freshRes.error) throw new Error(`getHomeRails/fresh: ${freshRes.error.message}`);
  return {
    trending: (trendingRes.data ?? []).map(mapProduct),
    fresh: (freshRes.data ?? []).map(mapProduct),
  };
}

/** Published-product count per category (Kategori page). */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_PRODUCTS);
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("status", "published");
  if (error) throw new Error(`getCategoryCounts: ${error.message}`);
  const counts: Record<string, number> = {};
  for (const r of data ?? []) counts[r.category] = (counts[r.category] ?? 0) + 1;
  return counts;
}

/**
 * One product, full row. Anon RLS ⇒ published only — callers that must show
 * drafts to their owner (detail-page preview) fall back to the cookie client.
 */
export async function getCatalogProduct(id: string): Promise<Model | null> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_PRODUCTS, productTag(id));
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (error.code === MALFORMED_INPUT) return null; // garbage /model/<id> → 404
    throw new Error(`getCatalogProduct: ${error.message}`);
  }
  return data ? mapProduct(data) : null;
}

export async function getProductReviews(productId: string): Promise<ReviewItem[]> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(productTag(productId));
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id,rating,body,created_at,profiles!reviews_author_id_fkey(name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) {
    if (error.code === MALFORMED_INPUT) return [];
    throw new Error(`getProductReviews: ${error.message}`);
  }
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => {
    const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: String(r.id),
      rating: Number(r.rating),
      body: (r.body as string) ?? "",
      created_at: String(r.created_at),
      authorName: (prof as { name?: string } | null)?.name || "Pengguna",
    };
  });
}

/** Up to 4 published products in the same category ("Mungkin kamu suka"). */
export async function getRelatedProducts(category: string, excludeId: string): Promise<Model[]> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_PRODUCTS);
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "published")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(4);
  if (error) throw new Error(`getRelatedProducts: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

// ── Jelajahi ─────────────────────────────────────────────────────────────────

export const EXPLORE_PAGE_SIZE = 12;

export type ExploreParams = {
  q: string;
  cat: string;
  use: string;
  /** Keep sorted so equivalent filter sets share one cache entry. */
  tiers: string[];
  minRating: number;
  /** Max price in IDR, quantized to PRICE_STEP_IDR by the page (0 = off) so the cache key space stays bounded. */
  maxIdr: number;
  sort: string;
  page: number;
};

export type ExploreResult = { models: Model[]; total: number };

async function runExploreQuery(p: ExploreParams): Promise<ExploreResult> {
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_COLUMNS, { count: "exact" })
    .eq("status", "published");

  if (p.cat !== "all") query = query.eq("category", p.cat);
  if (p.use) query = query.contains("use_cases", [p.use]);
  if (p.tiers.length) query = query.in("tier", p.tiers);
  if (p.minRating) query = query.gte("rating", p.minRating);
  if (p.maxIdr) query = query.lte("price_usd", p.maxIdr / USD_TO_IDR);
  if (p.q) {
    // search name/tagline/description; sanitize to keep the PostgREST or() grammar intact
    const safe = p.q.replace(/[,()*%]/g, " ").trim();
    if (safe) query = query.or(`name.ilike.*${safe}*,tagline.ilike.*${safe}*,description.ilike.*${safe}*`);
  }

  switch (p.sort) {
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
  query = query.range(0, p.page * EXPLORE_PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(`explore query: ${error.message}`);
  const models = (data ?? []).map(mapProduct);
  return { models, total: count ?? models.length };
}

/**
 * Cached per filter/sort combination. Keys come from URL params, so garbage
 * combos mint extra entries — bounded by the 50 MB in-memory LRU, and a miss
 * just falls through to one live query (the pre-cache baseline).
 */
export async function getExploreCatalog(p: ExploreParams): Promise<ExploreResult> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_PRODUCTS);
  return runExploreQuery(p);
}

/** Free-text search is an unbounded key space — always query live. */
export async function searchExploreCatalog(p: ExploreParams): Promise<ExploreResult> {
  return runExploreQuery(p);
}

// ── Kreator ──────────────────────────────────────────────────────────────────

export async function getStores(): Promise<StoreSummary[]> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_STORES);
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("stores")
    .select("owner_id, name, handle, tagline, category")
    .order("name", { ascending: true });
  if (error) throw new Error(`getStores: ${error.message}`);
  return data ?? [];
}

export async function getStoreByHandle(handle: string): Promise<StoreSummary | null> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_STORES);
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("stores")
    .select("owner_id, name, handle, tagline, category")
    .eq("handle", handle)
    .maybeSingle();
  if (error) throw new Error(`getStoreByHandle: ${error.message}`);
  return data ?? null;
}

/** Store name/handle for seller attribution on the product detail page. */
export async function getSellerStore(
  ownerId: string,
): Promise<{ name: string; handle: string } | null> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_STORES);
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("stores")
    .select("name, handle")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw new Error(`getSellerStore: ${error.message}`);
  return data ?? null;
}

/** A creator's published products, newest first (storefront). */
export async function getStoreProducts(ownerId: string): Promise<Model[]> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_PRODUCTS);
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("owner_id", ownerId)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getStoreProducts: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

// ── Sitemap ──────────────────────────────────────────────────────────────────

export async function getSitemapEntries(): Promise<{
  products: { id: string; updated_at: string | null }[];
  stores: { handle: string }[];
}> {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(TAG_PRODUCTS, TAG_STORES);
  const supabase = createPublicClient();
  const [productsRes, storesRes] = await Promise.all([
    supabase.from("products").select("id, updated_at").eq("status", "published").limit(2000),
    supabase.from("stores").select("handle").limit(2000),
  ]);
  if (productsRes.error) throw new Error(`getSitemapEntries: ${productsRes.error.message}`);
  if (storesRes.error) throw new Error(`getSitemapEntries: ${storesRes.error.message}`);
  return { products: productsRes.data ?? [], stores: storesRes.data ?? [] };
}
