import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/sell", "/settings", "/dashboard", "/cart", "/checkout", "/orders", "/library", "/auth"],
    },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
