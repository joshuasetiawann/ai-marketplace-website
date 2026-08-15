import Link from "next/link";
import Icon from "@/components/Icon";
import { GlowOrb } from "@/components/common";

export const metadata = { title: "Tentang — Nexora AI" };

const VALUES = [
  { icon: "verified", title: "Kurasi, bukan kuantitas", desc: "Setiap model ditinjau agar kualitasnya konsisten tinggi." },
  { icon: "payments", title: "Adil untuk kreator", desc: "Bagi hasil 80% dan pencairan dana yang transparan." },
  { icon: "security", title: "Aman & tepercaya", desc: "Keamanan tingkat database, pembayaran terenkripsi." },
];

export default function AboutPage() {
  return (
    <div className="relative mx-auto max-w-3xl px-5 py-16 md:px-16">
      <GlowOrb className="left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2" />
      <div className="text-center">
        <p className="font-label text-label-sm uppercase tracking-widest text-primary-container">Misi Kami</p>
        <h1 className="mt-3 font-display text-headline-md text-on-surface md:text-headline-lg">
          Marketplace AI yang <span className="text-gradient">presisi & mewah</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-body-lg text-on-surface-variant">
          Nexora AI mempertemukan kreator model AI terbaik dengan builder visioner — di satu tempat yang
          dirancang untuk kualitas, kepercayaan, dan pengalaman premium.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-xl surface-card p-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container/10 text-primary-container">
              <Icon name={v.icon} size={24} />
            </span>
            <p className="font-display text-body-lg font-semibold text-on-surface">{v.title}</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex justify-center gap-3">
        <Link href="/explore" className="btn-primary px-6 py-3">
          Jelajahi marketplace <Icon name="arrow_forward" size={18} />
        </Link>
        <Link href="/sell/start" className="btn-ghost px-6 py-3">
          Mulai jualan
        </Link>
      </div>
    </div>
  );
}
