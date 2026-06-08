"use client";

import { useEffect } from "react";

// global-error replaces the root layout, so it can't rely on globals.css —
// styles are inlined. Catches failures thrown in the root layout itself.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#05070a",
          color: "#e6edf3",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Terjadi kesalahan serius</h1>
        <p style={{ color: "#9aa4b2", maxWidth: 420 }}>
          Aplikasi mengalami gangguan. Silakan muat ulang halaman.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#00e5ff",
            color: "#05070a",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}
