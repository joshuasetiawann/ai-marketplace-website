import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS only takes effect over HTTPS (ignored on localhost/http).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep dev artifacts out of `.next`. `npm run build` (directly, or via
  // test:e2e) otherwise overwrites the directory a running `next dev` is
  // serving from: its chunks vanish mid-session, the HMR client fails to load,
  // and the browser reload-loops. Separate directories, no collision.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // Dev only: without this, opening the printed "Network" URL (or any LAN IP)
  // makes Next block /_next/webpack-hmr as cross-origin, the HMR client never
  // connects, and the page reload-loops forever.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.*.*", "10.*.*.*"],
  // "use cache" + cacheTag/cacheLife for the public-catalog layer
  // (lib/catalog-data.ts) without opting the whole app into Cache Components.
  experimental: { useCache: true },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
