import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// The only cross-origin traffic the browser makes is to Supabase (auth, 2FA
// enrol/verify, realtime). Payment gateways are called server-side and the user
// leaves via a full-page redirect, so they need no directive here.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();
const connectSrc = ["'self'", supabaseOrigin, supabaseOrigin.replace(/^http/, "ws")]
  .filter(Boolean)
  .concat(isDev ? ["ws:"] : []); // dev: HMR socket

const csp = [
  "default-src 'self'",
  // ponytail: 'unsafe-inline' instead of a nonce. Next inlines its RSC payload
  // bootstrap in every document, and reading a nonce from proxy.ts opts every
  // page into dynamic rendering — which would undo the "use cache" catalog
  // layer. 'self' still blocks injected <script src="//evil">, and connect-src
  // below caps where a payload could exfiltrate to. Upgrade to nonce +
  // 'strict-dynamic' if this app ever renders user-authored HTML.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // data: is required — the 2FA enrolment QR is a data: URI.
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Tied to the backend's scheme, not NODE_ENV: a production build run against
  // a local http Supabase would otherwise have every API call upgraded to
  // https and fail.
  ...(supabaseOrigin.startsWith("https:") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS only takes effect over HTTPS (ignored on localhost/http).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
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
