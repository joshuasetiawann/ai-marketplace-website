import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-margin-mobile py-20">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary-container/[0.06] blur-[120px] rounded-full -z-10" />
      <div className="relative mb-8">
        <span className="font-display text-[120px] md:text-[160px] leading-none text-gradient">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name="hub" size={48} className="text-primary-container/40 animate-pulse" />
        </div>
      </div>
      <h1 className="font-display text-headline-md text-on-surface mb-3">Sinyal hilang</h1>
      <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
        Halaman yang kamu cari sudah di luar jangkauan. Yuk kembali ke marketplace.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary px-6 py-3"><Icon name="home" size={18} /> Ke Beranda</Link>
        <Link to="/explore" className="btn-ghost px-6 py-3"><Icon name="explore" size={18} /> Jelajahi Model</Link>
      </div>
    </div>
  )
}
