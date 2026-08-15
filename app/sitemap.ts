import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/catalog-data";
import { env } from "@/lib/env";

// Render at request time: without this the cached (cookie-less) fetcher makes
// the route prerender at build, and `next build` would hard-require a
// reachable Supabase (CI / fresh-clone builds would fail).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.SITE_URL;

  const staticPaths = [
    "",
    "/explore",
    "/categories",
    "/creators",
    "/pricing",
    "/about",
    "/help",
    "/contact",
    "/legal/privasi",
    "/legal/ketentuan",
    "/legal/keamanan",
  ];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  // DB unreachable → serve the static routes instead of a 500 (matches the
  // pre-cache behavior where query errors yielded a partial sitemap).
  let products: { id: string; updated_at: string | null }[] = [];
  let stores: { handle: string }[] = [];
  try {
    ({ products, stores } = await getSitemapEntries());
  } catch {
    // partial sitemap on purpose
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/model/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const creatorRoutes: MetadataRoute.Sitemap = stores.map((s) => ({
    url: `${base}/creator/${s.handle}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...creatorRoutes];
}
