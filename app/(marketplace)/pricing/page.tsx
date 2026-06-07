import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata = { title: "Harga — Nexora AI" };

const TIERS = [
  {
    name: "Gratis",
    price: "Rp 0",
    tagline: "Untuk mulai bereksperimen.",
    features: ["Akses model tier Gratis", "Komunitas & dokumentasi", "1 proyek aktif"],
    cta: "Mulai gratis",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "Rp 158rb",
    suffix: "/bln",
    tagline: "Untuk kreator & tim kecil.",
    features: ["Semua model tier Pro", "Latensi prioritas", "Dukungan email", "Proyek tak terbatas"],
    cta: "Langganan Pro",
    href: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "Untuk skala perusahaan.",
    features: ["Model Enterprise + SLA 99,99%", "SSO & kontrol akses", "Dukungan khusus 24/7", "Penagihan terpusat"],
    cta: "Hubungi sales",
    href: "/contact",
    highlight: false,
  },
];

const FAQ = [
  { q: "Apakah ada biaya tersembunyi?", a: "Tidak. Harga di atas sudah final. Penjual hanya dikenai komisi 20% per penjualan." },
  { q: "Bisa berhenti kapan saja?", a: "Ya, langganan bisa dibatalkan kapan saja tanpa penalti." },
  { q: "Metode pembayaran apa saja?", a: "QRIS, Virtual Account semua bank besar, dan e-wallet (GoPay, OVO, DANA, ShopeePay)." },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-16">
      <div className="mb-12 text-center">
        <h1 className="font-display text-headline-lg text-on-surface">Harga yang transparan</h1>
        <p className="mx-auto mt-3 max-w-xl text-body-lg text-on-surface-variant">
          Pilih paket sesuai kebutuhanmu. Tingkatkan atau turunkan kapan saja.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-2xl p-7 ${
              t.highlight ? "border border-primary-container/40 bg-primary-container/5 electric-glow" : "surface-card"
            }`}
          >
            <p className="font-label text-label-sm uppercase tracking-widest text-primary-container">{t.name}</p>
            <p className="mt-3 font-display text-headline-md text-on-surface">
              {t.price}
              {t.suffix && <span className="text-body-md font-normal text-on-surface-variant">{t.suffix}</span>}
            </p>
            <p className="mt-2 text-body-sm text-on-surface-variant">{t.tagline}</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-body-sm text-on-surface-variant">
                  <Icon name="check_circle" size={18} className="mt-0.5 shrink-0 text-primary-container" fill /> {f}
                </li>
              ))}
            </ul>
            <Link href={t.href} className={`mt-7 py-3 ${t.highlight ? "btn-primary" : "btn-soft"}`}>
              {t.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="mb-6 text-center font-display text-title-md text-on-surface">Pertanyaan umum</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl surface-card p-5">
              <p className="font-display text-body-md font-semibold text-on-surface">{f.q}</p>
              <p className="mt-1 text-body-sm text-on-surface-variant">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
