/**
 * Post-login / post-callback destination. The value always arrives from a form
 * field or query string, so only same-origin relative paths are honoured —
 * `//evil.com` would otherwise turn the login form into an open redirect.
 *
 * Shared rather than reimplemented per entry point: the auth callback used to
 * check only `startsWith("/")` while the login action also rejected `//`, and
 * two rules for one problem is a bug waiting for its turn.
 */
export function safeNext(value: unknown, fallback = "/dashboard"): string {
  const next = String(value || "");
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : fallback;
}

/**
 * Ceiling for `?page=` on /explore. The catalog query uses a cumulative range,
 * so page N asks Postgres for N × EXPLORE_PAGE_SIZE rows in one statement and
 * mints a "use cache" entry per distinct value. 50 × 12 = 600 models, far past
 * any real browse depth.
 */
export const EXPLORE_MAX_PAGE = 50;

/** `?page=` → a usable page number. Anything junk, negative or absurd → bounds. */
export function clampPage(value: unknown, max = EXPLORE_MAX_PAGE): number {
  return Math.min(max, Math.max(1, Math.floor(Number(value)) || 1));
}

/**
 * Should "muat lebih banyak" still be offered? At the ceiling the next page
 * returns the same rows, so the button would sit there doing nothing.
 */
export function hasMorePages(loaded: number, total: number, page: number, max = EXPLORE_MAX_PAGE): boolean {
  return loaded < total && page < max;
}
