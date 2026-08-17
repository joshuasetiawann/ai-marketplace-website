/**
 * Reading text out of a Server Action's FormData, with a ceiling.
 *
 * Every text column in this schema is Postgres `text` — unbounded — and a
 * Server Action is a public POST endpoint, so the form's `maxlength` is a
 * browser courtesy, not a limit. Without a bound the anonymous contact form
 * accepts megabytes per submission, and a seller's product description is
 * stored, re-served on a cached public page, and paid for at that size.
 *
 * These caps sit far above anything a person types, so truncation never fires
 * on honest input — the point is that the tail is finite, not that it is short.
 */
export const LIMITS = {
  /** Names, categories, icons, bank names — one short line. */
  short: 120,
  /** Taglines, subjects, single-line summaries. */
  line: 200,
  /** Review comments, support messages. */
  body: 5_000,
  /** Product descriptions — the longest free text a seller writes. */
  long: 20_000,
} as const;

/** Trimmed text field from FormData, capped at `max` characters. */
export function field(form: FormData, key: string, max: number = LIMITS.short): string {
  return String(form.get(key) || "")
    .trim()
    .slice(0, max);
}

/** Same, for a list built from one comma-separated field (caps count and each item). */
export function tagList(form: FormData, key: string, maxItems = 20): string[] {
  return field(form, key, LIMITS.line)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}
