import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Jelajahi Model', to: '/explore' },
      { label: 'Kategori', to: '/categories' },
      { label: 'Kreator', to: '/creators' },
      { label: 'Harga', to: '/pricing' },
    ],
  },
  {
    title: 'Jualan',
    links: [
      { label: 'Jadi Kreator', to: '/upload' },
      { label: 'Seller Studio', to: '/seller' },
      { label: 'Upload Produk', to: '/upload' },
      { label: 'Panduan', to: '/help' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang Kami', to: '/about' },
      { label: 'Misi Kami', to: '/about#mission' },
      { label: 'Pusat Bantuan', to: '/help' },
      { label: 'Kontak', to: '/help' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-surface-container-lowest/60 mt-24">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2">
            <Logo className="mb-4" />
            <p className="text-body-sm text-on-surface-variant max-w-xs mb-5">
              Marketplace digital premium untuk model AI kurasi berperforma tinggi. Kecerdasan mewah nan presisi,
              dirancang untuk para visioner.
            </p>
            <div className="flex items-center gap-2">
              {['public', 'forum', 'rss_feed', 'photo_camera'].map((s) => (
                <a
                  key={s}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container/40 transition-colors"
                  aria-label={s}
                >
                  <Icon name={s} size={18} />
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-label text-label-sm uppercase tracking-wider text-on-surface mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-body-sm text-on-surface-variant hover:text-primary-container transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t hairline">
          <p className="text-[13px] text-on-surface-variant order-2 md:order-1">
            © {new Date().getFullYear()} Nexora AI. Precision Luxury Intelligence.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 order-1 md:order-2">
            {['Kebijakan Privasi', 'Ketentuan Layanan', 'Keamanan', 'Dokumentasi'].map((l) => (
              <a key={l} href="#" onClick={(e) => e.preventDefault()} className="text-[13px] text-on-surface-variant hover:text-primary-container transition-colors">
                {l}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
