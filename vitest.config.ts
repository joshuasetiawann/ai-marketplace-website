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
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
