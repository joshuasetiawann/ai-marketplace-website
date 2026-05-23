import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { GlowOrb } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES } from '../data/models.js'

const BENEFITS = [
  { icon: 'payments', title: 'Bagi hasil 80%', desc: 'Kamu menyimpan 80% dari setiap penjualan, dibayar ke rekeningmu.' },
  { icon: 'verified_user', title: 'Pembayaran aman', desc: 'QRIS, Virtual Account & e-wallet — dana masuk otomatis ke saldo toko.' },
  { icon: 'insights', title: 'Dashboard lengkap', desc: 'Pantau penjualan, pelanggan, dan pencairan dana real-time.' },
]

export default function OpenStore() {
  const { hasStore, openStore, user } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', category: '', tagline: '' })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const handle = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24)

  // already a seller → straight to the studio
  if (hasStore) return <Navigate to="/seller" replace />

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Masukkan nama toko.')
    if (!form.category) return setError('Pilih kategori utama toko.')
    if (!agree) return setError('Setujui Perjanjian Penjual untuk lanjut.')
    const res = openStore(form)
    if (res.error) return setError(res.error)
    navigate('/seller')
  }

  return (
    <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-12 relative">
      <GlowOrb className="top-0 right-0 w-[500px] h-[400px]" />
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
        {/* Pitch */}
        <div>
          <p className="font-label text-label-sm uppercase tracking-widest text-secondary mb-3">Mulai Berjualan</p>
          <h1 className="font-display text-headline-lg md:text-display-sm text-on-surface mb-4">Buka toko, jual model AI buatanmu</h1>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Akun <b className="text-on-surface">{user?.name}</b> kamu cukup satu — belanja dan jualan dari tempat yang sama,
            persis seperti marketplace favoritmu.
          </p>
          <div className="flex flex-col gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-4 surface-card rounded-xl p-4">
                <span className="w-11 h-11 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0"><Icon name={b.icon} size={22} /></span>
                <div><p className="font-semibold text-on-surface">{b.title}</p><p className="text-body-sm text-on-surface-variant">{b.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-title-md text-on-surface mb-1">Detail Toko</h2>
          <p className="text-body-sm text-on-surface-variant mb-6">Lengkapi info dasar — bisa diubah kapan saja di Seller Studio.</p>

          {error && <div className="flex items-center gap-2 text-error text-body-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2 mb-4"><Icon name="error" size={18} fill /> {error}</div>}

          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="block text-body-sm font-medium text-on-surface mb-2">Nama Toko</span>
              <input value={form.name} onChange={set('name')} placeholder="cth. Synthetix Labs" className="input-field" />
              {handle && <span className="text-[12px] text-on-surface-variant mt-1.5 block">URL toko: <span className="font-mono text-primary-container">nexora.ai/creator/{handle}</span></span>}
            </label>
            <label className="block">
              <span className="block text-body-sm font-medium text-on-surface mb-2">Kategori Utama</span>
              <div className="relative">
                <select value={form.category} onChange={set('category')} className="input-field appearance-none pr-10 cursor-pointer">
                  <option value="" className="bg-surface-container">Pilih kategori…</option>
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id} className="bg-surface-container">{c.label}</option>)}
                </select>
                <Icon name="expand_more" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              </div>
            </label>
            <label className="block">
              <span className="block text-body-sm font-medium text-on-surface mb-2">Tagline <span className="text-outline">(opsional)</span></span>
              <input value={form.tagline} onChange={set('tagline')} placeholder="Satu kalimat tentang tokomu" className="input-field" />
            </label>
            <label className="flex items-start gap-3 cursor-pointer mt-1">
              <button type="button" onClick={() => setAgree((a) => !a)} className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${agree ? 'bg-primary-container border-primary-container' : 'border-white/30'}`}>{agree && <Icon name="check" size={14} className="text-on-primary-container" />}</button>
              <span className="text-body-sm text-on-surface-variant">Saya setuju dengan <a href="#" onClick={(e) => e.preventDefault()} className="text-primary-container hover:underline">Perjanjian Penjual</a> & kebijakan komisi 20% Nexora.</span>
            </label>
            <button type="submit" className="btn-primary w-full py-3.5 mt-2"><Icon name="storefront" size={18} /> Aktifkan Toko</button>
            <p className="text-center text-[12px] text-on-surface-variant flex items-center justify-center gap-1.5"><Icon name="lock" size={13} /> Gratis, tanpa biaya pendaftaran. Komisi hanya dari penjualan.</p>
          </div>
        </form>
      </div>

      <p className="text-center text-body-sm text-on-surface-variant mt-10">Mau lihat-lihat dulu? <Link to="/explore" className="text-primary-container font-semibold">Jelajahi marketplace</Link></p>
    </div>
  )
}
