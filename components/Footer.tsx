import Link from "next/link";
import Icon from "./Icon";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { label: "Jelajahi Model", href: "/explore" },
      { label: "Kategori", href: "/categories" },
      { label: "Kreator", href: "/creators" },
      { label: "Harga", href: "/pricing" },
    ],
  },
  {
    title: "Jualan",
    links: [
      { label: "Buka Toko", href: "/sell/start" },
      { label: "Seller Studio", href: "/sell" },
      { label: "Pusat Bantuan", href: "/help" },
      { label: "Panduan", href: "/help" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "/about" },
      { label: "Misi Kami", href: "/about" },
      // "Admin Console" used to sit here, advertising the staff door to every
      // visitor. Access was always gated correctly — the link was just an
      // invitation to try. Admins reach it from the account menu.
      { label: "Keamanan", href: "/legal/keamanan" },
      { label: "Kontak", href: "/contact" },
    ],
  },
];

/** Legal documents — real pages now, not dead <span>s. */
const LEGAL = [
  { label: "Privasi", href: "/legal/privasi" },
  { label: "Ketentuan", href: "/legal/ketentuan" },
  { label: "Keamanan", href: "/legal/keamanan" },
  { label: "Bantuan", href: "/help" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.07] bg-surface-container-lowest/60">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-16">
        <div className="mb-12 grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo className="mb-4" />
            <p className="mb-5 max-w-xs text-body-sm text-on-surface-variant">
              Marketplace digital premium untuk model AI kurasi berperforma tinggi.
              Precision luxury intelligence untuk para visioner.
            </p>
            <div className="flex items-center gap-2">
              {["public", "forum", "rss_feed", "photo_camera"].map((s) => (
                <span
                  key={s}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-on-surface-variant"
                  aria-label={s}
                >
                  <Icon name={s} size={18} />
                </span>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((l, i) => (
                  <li key={`${l.label}-${i}`}>
                    <Link
                      href={l.href}
                      className="text-body-sm text-on-surface-variant transition-colors hover:text-primary-container"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 hairline md:flex-row">
          <p className="order-2 text-[13px] text-on-surface-variant md:order-1">
            © {new Date().getFullYear()} Nexora AI · Precision Luxury Intelligence
          </p>
          <nav className="order-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:order-2">
            {LEGAL.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] text-on-surface-variant transition-colors hover:text-primary-container"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
