import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata = { title: "Pusat Bantuan — Nexora AI" };

const TOPICS = [
  { icon: "shopping_cart", title: "Belanja & pesanan", desc: "Cara membeli, metode pembayaran, dan riwayat pesanan." },
  { icon: "storefront", title: "Jualan", desc: "Buka toko, unggah produk, moderasi, dan pencairan dana." },
  { icon: "security", title: "Akun & keamanan", desc: "Verifikasi email, password, dan autentikasi 2 langkah." },
];

const FAQ = [
  { q: "Bagaimana cara membeli model?", a: "Buka detail produk, klik Beli Sekarang atau Tambah Keranjang, lalu checkout dengan QRIS/VA/e-wallet." },
  { q: "Bagaimana cara mulai berjualan?", a: "Buka menu akun → Buka Toko, isi detail toko, lalu unggah produk dan kirim untuk ditinjau admin." },
  { q: "Kapan dana penjualan cair?", a: "Setelah saldo mencapai minimal pencairan, ajukan payout di Seller Studio → Payout. Admin akan memproses." },
  { q: "Apakah ulasan bisa diedit?", a: "Kamu bisa menulis ulasan pada produk yang sudah dibeli; ulasanmu dapat dikelola dari halaman produk." },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-headline-lg text-on-surface">Pusat Bantuan</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">Temukan jawaban atau hubungi tim kami.</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {TOPICS.map((t) => (
          <div key={t.title} className="rounded-xl surface-card p-6">
            <Icon name={t.icon} size={22} className="text-primary-container" />
            <p className="mt-3 font-display text-body-md font-semibold text-on-surface">{t.title}</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">{t.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-title-md text-on-surface">Pertanyaan yang sering diajukan</h2>
      <div className="flex flex-col gap-3">
        {FAQ.map((f) => (
          <div key={f.q} className="rounded-xl surface-card p-5">
            <p className="font-display text-body-md font-semibold text-on-surface">{f.q}</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-xl border border-primary-container/20 bg-primary-container/5 p-6">
        <div>
          <p className="font-display text-body-lg font-semibold text-on-surface">Masih butuh bantuan?</p>
          <p className="text-body-sm text-on-surface-variant">Tim dukungan kami siap membantu.</p>
        </div>
        <Link href="/contact" className="btn-primary px-5 py-2.5">
          <Icon name="support_agent" size={18} /> Hubungi kami
        </Link>
      </div>
    </div>
  );
}
