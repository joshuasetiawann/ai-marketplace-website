import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Explore Models', to: '/explore' },
      { label: 'Categories', to: '/categories' },
      { label: 'Creators', to: '/creators' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Become a Creator', to: '/upload' },
      { label: 'Seller Studio', to: '/seller' },
      { label: 'Upload Product', to: '/upload' },
      { label: 'Guidelines', to: '/help' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Mission', to: '/about#mission' },
      { label: 'Help Center', to: '/help' },
      { label: 'Contact', to: '/help' },
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
              The premium digital marketplace for curated, high-performance AI models. Precision luxury intelligence,
              tailored for visionaries.
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
            {['Privacy Policy', 'Terms of Service', 'Security', 'Documentation'].map((l) => (
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
