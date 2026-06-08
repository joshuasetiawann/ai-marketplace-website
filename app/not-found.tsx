import Link from "next/link";
import Icon from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-primary-container/10 text-primary-container">
        <Icon name="search_off" size={40} />
      </span>
      <div>
        <h1 className="font-display text-headline-md text-on-surface">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Tautan yang kamu buka mungkin sudah dipindah atau tidak ada.
        </p>
      </div>
      <Link href="/" className="btn-primary px-6 py-3">
        <Icon name="home" size={18} /> Kembali ke beranda
      </Link>
    </div>
  );
}
