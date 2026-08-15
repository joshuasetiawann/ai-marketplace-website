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
