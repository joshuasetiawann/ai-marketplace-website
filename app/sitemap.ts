import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.SITE_URL;

  const staticPaths = ["", "/explore", "/categories", "/creators", "/pricing", "/about", "/help", "/contact"];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const supabase = await createServerClient();
  const [{ data: products }, { data: stores }] = await Promise.all([
    supabase.from("products").select("id, updated_at").eq("status", "published").limit(2000),
    supabase.from("stores").select("handle").limit(2000),
  ]);

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${base}/model/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const creatorRoutes: MetadataRoute.Sitemap = (stores ?? []).map((s) => ({
    url: `${base}/creator/${s.handle}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...creatorRoutes];
}
