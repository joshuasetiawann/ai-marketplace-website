import { defineConfig } from "vitest/config";
import path from "node:path";

// Next loads .env.local for us; plain vitest does not. Without this the DB
// security suite sees no SUPABASE_URL and silently skips every test.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local (CI) — those tests stay skipped, as intended
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // `server-only` throws by design outside a React Server Component build.
      // Stub it so plain-Node modules that carry the marker stay testable.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
