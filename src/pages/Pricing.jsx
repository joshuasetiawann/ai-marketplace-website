import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { SectionHeading, GlowOrb } from '../components/common.jsx'
import { toIDR, formatIDR } from '../data/payment.js'

const PLANS = [
  {
    name: 'Discovery',
    price: { mo: 0, yr: 0 },
    tagline: 'Alat dasar untuk mulai menjelajahi ekosistem Nexora.',
    cta: 'Mulai Gratis',
    to: '/register',
    highlight: false,
    features: ['100 generasi AI per bulan', 'Output resolusi standar', 'Akses model komunitas publik', 'Dukungan komunitas'],
  },
  {
    name: 'Creator',
    price: { mo: 29, yr: 290 },
    tagline: 'Lepaskan potensi kreatif penuh dengan prioritas & model premium.',
    cta: 'Upgrade ke Creator',
    to: '/register',
    highlight: true,
    features: ['Generasi AI tanpa batas', 'Output resolusi tinggi 4K', 'Prioritas cluster GPU', 'Akses eksklusif model Pro', 'Hak pakai komersial'],
  },
  {
    name: 'Professional',
    price: { mo: 99, yr: 990 },
    tagline: 'Infrastruktur kelas enterprise untuk studio & profesional volume tinggi.',
    cta: 'Hubungi Sales',
    to: '/help',
    highlight: false,
    features: ['Semua di Creator, plus', 'Server node khusus', 'Integrasi API custom', 'Onboarding white-glove', 'Kolaborasi tim lanjutan'],
  },
]

const FAQ = [
  { q: 'Bisakah ganti paket nanti?', a: 'Bisa — upgrade, downgrade, atau batalkan kapan saja dari pengaturan akun. Perubahan dihitung prorata otomatis.' },
  { q: 'Apakah generasi yang tak terpakai hangus?', a: 'Pada paket Discovery, jatah generasi di-reset tiap bulan. Paket Creator & Professional sudah termasuk generasi tanpa batas.' },
  { q: 'Ada uji coba gratis untuk paket berbayar?', a: 'Setiap paket berbayar dilindungi garansi uang kembali 14 hari, tanpa pertanyaan.' },
  { q: 'Metode pembayaran apa yang didukung?', a: 'Kami menerima QRIS, Virtual Account (BCA, Mandiri, BNI, BRI, Permata), dan e-wallet (GoPay, OVO, DANA, ShopeePay).' },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const [open, setOpen] = useState(0)

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 relative">
      <GlowOrb className="top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px]" />

      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="font-label text-label-sm uppercase tracking-widest text-primary-container mb-3">Harga</p>
        <h1 className="font-display text-headline-lg md:text-display-md text-on-surface mb-4">Kecerdasan Premium, Harga Jujur</h1>
        <p className="text-body-lg text-on-surface-variant">Pilih paket yang sesuai dengan ambisimu. Integrasi AI yang mulus, dirancang untuk para visioner.</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-body-sm ${!annual ? 'text-on-surface' : 'text-on-surface-variant'}`}>Bulanan</span>
        <button onClick={() => setAnnual((a) => !a)} className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-primary-container' : 'bg-white/15'}`}>
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${annual ? 'left-8' : 'left-1'}`} />
        </button>
        <span className={`text-body-sm ${annual ? 'text-on-surface' : 'text-on-surface-variant'}`}>Tahunan <span className="text-success text-[12px] ml-1">Hemat 16%</span></span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start mb-20">
        {PLANS.map((p) => {
          const monthlyUsd = annual ? p.price.yr / 12 : p.price.mo
          return (
            <div key={p.name} className={`relative rounded-2xl p-7 flex flex-col ${p.highlight ? 'glass-panel border-primary-container/40 lg:-mt-4 lg:mb-4 electric-glow' : 'surface-card'}`}>
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-[0_0_16px_rgba(0,229,255,0.4)]">Rekomendasi</span>}
              <h3 className={`font-display text-title-md mb-2 ${p.highlight ? 'text-primary-container' : 'text-on-surface'}`}>{p.name}</h3>
              <div className="flex items-end gap-1 mb-3">
                <span className="font-display text-[40px] leading-none text-on-surface">{p.price.mo === 0 ? 'Gratis' : formatIDR(toIDR(monthlyUsd))}</span>
                {p.price.mo !== 0 && <span className="text-body-md text-on-surface-variant mb-1">/bln</span>}
              </div>
              <p className="text-body-sm text-on-surface-variant mb-6 min-h-[40px]">{p.tagline}</p>
              <Link to={p.to} className={`${p.highlight ? 'btn-primary' : 'btn-ghost'} w-full py-3 mb-6`}>{p.cta}</Link>
              <ul className="flex flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-body-sm text-on-surface-variant">
                    <Icon name="check_circle" size={18} className={p.highlight ? 'text-primary-container shrink-0 mt-0.5' : 'text-on-surface-variant shrink-0 mt-0.5'} fill={p.highlight} />{f}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="max-w-3xl mx-auto">
        <SectionHeading center title="Pertanyaan yang sering diajukan" className="mb-8" />
        <div className="flex flex-col gap-3">
          {FAQ.map((f, i) => (
            <div key={f.q} className="surface-card rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-body-md font-medium text-on-surface">{f.q}</span>
                <Icon name={open === i ? 'remove' : 'add'} size={22} className="text-primary-container shrink-0" />
              </button>
              {open === i && <p className="px-6 pb-5 text-body-sm text-on-surface-variant animate-fade-in-fast">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
