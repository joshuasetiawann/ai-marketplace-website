import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { SectionHeading, GlowOrb } from '../components/common.jsx'

const VALUES = [
  { icon: 'diamond', title: 'Mewah & Presisi', desc: 'Setiap detail dikurasi. Kami memperlakukan AI sebagai karya berkelas tinggi, bukan komoditas.' },
  { icon: 'verified_user', title: 'Aman sejak Desain', desc: 'Kreator terverifikasi, harga transparan, dan deployment yang mengutamakan privasi — selalu.' },
  { icon: 'bolt', title: 'Kuat tapi Mudah', desc: 'Kecerdasan kompleks disuling jadi pengalaman yang intuitif dan tanpa hambatan.' },
  { icon: 'groups', title: 'Kreator Utama', desc: 'Kami ada untuk membantu builder memonetisasi karyanya dengan syarat yang adil & royal.' },
]

const STATS = [
  { value: '2.400+', label: 'Model kurasi' },
  { value: '120rb+', label: 'Builder aktif' },
  { value: '80%', label: 'Bagi hasil kreator' },
  { value: '99,99%', label: 'Uptime platform' },
]

const TEAM = [
  { name: 'Elena Vasquez', role: 'Co-Founder & CEO', art: ['#0b3a44', '#00e5ff'] },
  { name: 'Marcus Lee', role: 'Co-Founder & CTO', art: ['#231038', '#a855f7'] },
  { name: 'Aria Nakamura', role: 'Head of Design', art: ['#311a2b', '#f472b6'] },
  { name: 'Daniel Brooks', role: 'Head of Marketplace', art: ['#10233a', '#3b82f6'] },
]

export default function About() {
  return (
    <div>
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-16 pb-12 text-center">
        <GlowOrb className="top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]" />
        <p className="font-label text-label-sm uppercase tracking-widest text-primary-container mb-4">Tentang Nexora AI</p>
        <h1 className="font-display text-headline-lg md:text-display-md text-on-surface max-w-3xl mx-auto mb-6">
          Kami membangun marketplace kecerdasan paling <span className="text-gradient">premium</span> di dunia
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Nexora hadir untuk menjembatani AI tercanggih dengan para visioner yang memanfaatkannya — dengan tenang,
          eksklusif, dan tanpa hambatan.
        </p>
      </section>

      <section id="mission" className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 scroll-mt-24">
        <div className="glass-panel rounded-2xl overflow-hidden grid md:grid-cols-2">
          <div className="p-8 md:p-14 flex flex-col justify-center">
            <SectionHeading eyebrow="Misi Kami" title="Kecerdasan, dimuliakan" className="mb-5" />
            <p className="text-body-lg text-on-surface-variant mb-4">Lanskap AI itu bising dan kacau. Kami percaya alat terbaik layak mendapat panggung yang setara — galeri kurasi tempat kualitas jadi satu-satunya mata uang.</p>
            <p className="text-body-md text-on-surface-variant">Setiap model di Nexora ditinjau, di-benchmark, dan disajikan dengan ketelitian showroom mewah. Tanpa kekacauan, tanpa hype. Hanya kecerdasan yang bisa kamu percaya, siap pakai.</p>
          </div>
          <div className="relative min-h-[300px] bg-gradient-to-br from-surface-container-highest to-surface-container-lowest flex items-center justify-center p-10 border-t md:border-t-0 md:border-l border-white/5">
            <div className="relative w-56 h-56">
              <div className="absolute inset-0 border border-primary-container/20 rounded-full animate-[spin_16s_linear_infinite]" />
              <div className="absolute inset-6 border border-dashed border-primary-container/40 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary-container/20 rounded-full blur-xl" />
                <Icon name="auto_awesome" size={48} className="absolute text-primary-container" style={{ filter: 'drop-shadow(0 0 16px rgba(0,229,255,0.8))' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.07] glass-panel">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-8 text-center bg-surface/30"><p className="font-display text-headline-md text-primary-container">{s.value}</p><p className="text-body-sm text-on-surface-variant mt-1">{s.label}</p></div>
          ))}
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <SectionHeading center eyebrow="Yang kami pegang" title="Nilai Kami" className="mb-10" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="surface-card rounded-xl p-6 hover:border-primary-container/30 transition-all">
              <span className="inline-flex w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/20 items-center justify-center text-primary-container mb-4"><Icon name={v.icon} size={24} /></span>
              <h3 className="font-display text-body-lg font-semibold text-on-surface mb-2">{v.title}</h3>
              <p className="text-body-sm text-on-surface-variant">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <SectionHeading center eyebrow="Orang-orangnya" title="Kepemimpinan" className="mb-10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map((t) => (
            <div key={t.name} className="surface-card rounded-xl overflow-hidden text-center group">
              <div className="h-44 relative">
                <div className="w-full h-full" style={{ background: `radial-gradient(circle at 50% 35%, ${t.art[1]}40, ${t.art[0]} 70%)` }} />
                <span className="absolute inset-0 flex items-center justify-center text-5xl font-display font-bold text-white/90">{t.name.charAt(0)}</span>
              </div>
              <div className="p-5"><p className="font-display text-body-lg font-semibold text-on-surface">{t.name}</p><p className="text-body-sm text-on-surface-variant">{t.role}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="relative rounded-2xl overflow-hidden border border-primary-container/20 bg-gradient-to-br from-surface-container to-surface-container-lowest p-10 md:p-16 text-center">
          <GlowOrb className="bottom-0 left-0 w-[400px] h-[400px]" />
          <h2 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-4">Gabung ke marketplace</h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8">Mau membangun atau membeli, ada tempat untukmu di ekosistem Nexora.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary px-7 py-3.5">Buat Akun <Icon name="arrow_forward" size={18} /></Link>
            <Link to="/explore" className="btn-ghost px-7 py-3.5">Jelajahi Model</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
