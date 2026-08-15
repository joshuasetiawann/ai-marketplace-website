import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS only takes effect over HTTPS (ignored on localhost/http).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Deliberately narrow: the four directives below need no nonce and cannot
  // break this app (no iframes, no third-party form posts, no plugins), but
  // they are what turns an injected script or a rewritten <base> from
  // "executes" into "blocked". script-src/style-src are NOT set — Next inlines
  // both, so locking them down needs nonce plumbing through the App Router;
  // that is the next step, not a reason to ship none of this.
  {
    key: "Content-Security-Policy",
    // No default-src on purpose: it would fall through to connect-src and cut
    // the browser's calls to Supabase (2FA enrol/verify), and to img-src and
    // cut the data: QR code. Adding those back means enumerating every origin
    // and inlining 'unsafe-inline' for Next's own bootstrap — a bigger change
    // that deserves its own pass with a live app in front of it.
    value: [
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
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
