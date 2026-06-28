import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  // Dev-mode Turbopack compiles each route on first hit; allow generous time.
  expect: { timeout: 20_000 },
  fullyParallel: false,
  use: {
    // Dedicated test port to avoid clobbering a dev server on the default 3000.
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  webServer: {
    // Production build for stable, compile-free E2E (no Turbopack cold-start flakiness).
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
