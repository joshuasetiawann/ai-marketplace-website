import "server-only";

type Level = "error" | "warn" | "info";

/**
 * Minimal structured server logger. Server Actions catch Supabase/RPC errors and
 * return a user-facing message; call this first so failures are observable.
 * In production, forward the entry to an error monitor (Sentry/Datadog) here.
 */
export function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({ level, msg, ts: new Date().toISOString(), ...meta });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logError(msg: string, error: unknown, meta?: Record<string, unknown>) {
  log("error", msg, {
    ...meta,
    error: error instanceof Error ? error.message : String(error),
  });
}
