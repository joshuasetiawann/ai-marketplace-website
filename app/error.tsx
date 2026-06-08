"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // hook point for an error monitor (Sentry, etc.)
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-error/10 text-error">
        <Icon name="error" size={40} />
      </span>
      <div>
        <h1 className="font-display text-headline-md text-on-surface">Terjadi kesalahan</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Maaf, ada yang tidak beres. Coba muat ulang halaman ini.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary px-6 py-3">
          <Icon name="refresh" size={18} /> Coba lagi
        </button>
        <Link href="/" className="btn-soft px-6 py-3">
          Beranda
        </Link>
      </div>
    </div>
  );
}
