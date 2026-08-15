/**
 * Turn a Postgres / PostgREST error into something a buyer can read.
 *
 * Server Actions used to `return { error: error.message }`, which put English
 * driver text — sometimes naming a constraint or a column — straight onto an
 * Indonesian screen. The RPCs already raise deliberate, translated messages, so
 * those are passed through and everything else collapses to one safe line. The
 * original always goes to logError() at the call site.
 */
type DbError = { message?: string; code?: string } | null | undefined;

const BY_CODE: Record<string, string> = {
  "23505": "Data ini sudah ada.",
  "23503": "Data terkait tidak ditemukan.",
  "23514": "Nilai yang dimasukkan di luar batas yang diizinkan.",
  "22P02": "Format data tidak valid.",
  "42501": "Kamu tidak punya akses untuk tindakan ini.",
  PGRST116: "Data tidak ditemukan.",
};

export function dbMessage(error: DbError): string {
  if (!error) return "Terjadi kesalahan. Coba lagi sebentar lagi.";
  // P0001 is a bare `raise exception` — every one of ours is already written in
  // Indonesian for the user (e.g. "Saldo tidak mencukupi."), so show it as-is.
  if (error.code === "P0001" && error.message) return error.message;
  return (
    (error.code && BY_CODE[error.code]) ||
    "Terjadi kesalahan. Coba lagi sebentar lagi."
  );
}
