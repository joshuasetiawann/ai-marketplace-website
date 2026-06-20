import ExploreClient from "@/components/ExploreClient";
import { createServerClient } from "@/lib/supabase/server";
import { getExploreCatalog, searchExploreCatalog, type ExploreParams } from "@/lib/catalog-data";
import { PRICE_MAX_IDR, PRICE_STEP_IDR } from "@/lib/pricing";

export const metadata = { title: "Jelajahi Model — Nexora AI" };

type SP = {
  q?: string;
  cat?: string;
  use?: string;
  tier?: string;
  rating?: string;
  max?: string;
  sort?: string;
  page?: string;
};

/** Quantize the max-price param to the slider's step grid; 0 / out-of-range = off. */
function parseMaxIdr(raw: string | undefined) {
  const n = Number(raw) || 0;
  if (n <= 0 || n >= PRICE_MAX_IDR) return 0;
  return Math.max(PRICE_STEP_IDR, Math.round(n / PRICE_STEP_IDR) * PRICE_STEP_IDR);
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params: ExploreParams = {
    q: (sp.q ?? "").trim(),
    cat: sp.cat ?? "all",
    use: sp.use ?? "",
    // sorted so "Pro,Free" and "Free,Pro" share one cache entry
    tiers: (sp.tier ?? "").split(",").map((t) => t.trim()).filter(Boolean).sort(),
    minRating: Number(sp.rating) || 0,
    maxIdr: parseMaxIdr(sp.max),
    sort: sp.sort ?? "trending",
    page: Math.max(1, Number(sp.page) || 1),
  };

  // Filter combos are cached; free-text search queries live (unbounded keys).
  const [{ models, total }, wishlistRes] = await Promise.all([
    params.q ? searchExploreCatalog(params) : getExploreCatalog(params),
    user
      ? supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { product_id: string }[] }),
  ]);

  return (
    <ExploreClient
      models={models}
      total={total}
      hasMore={models.length < total}
      wishlistedIds={(wishlistRes.data ?? []).map((w) => w.product_id)}
      loggedIn={!!user}
      params={{
        q: params.q,
        cat: params.cat,
        use: params.use,
        tiers: params.tiers,
        minRating: params.minRating,
        maxIdr: params.maxIdr,
        sort: params.sort,
        page: params.page,
      }}
    />
  );
}
