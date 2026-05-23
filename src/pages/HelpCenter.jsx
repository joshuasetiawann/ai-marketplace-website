import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const TOPICS = [
  { icon: 'rocket_launch', title: 'Mulai Cepat', desc: 'Atur akun & model pertamamu', count: 12 },
  { icon: 'credit_card', title: 'Tagihan & Paket', desc: 'Langganan, invoice, dan refund', count: 8 },
  { icon: 'api', title: 'API & Integrasi', desc: 'Key, SDK, dan webhook', count: 24 },
  { icon: 'storefront', title: 'Jualan di Nexora', desc: 'Publikasikan & monetisasi model', count: 15 },
  { icon: 'shield', title: 'Keamanan & Kepercayaan', desc: 'Kebijakan penggunaan & konten', count: 6 },
  { icon: 'settings', title: 'Akun', desc: 'Profil, keamanan, dan preferensi', count: 10 },
]

const FAQ = [
  { q: 'Bagaimana cara mengintegrasikan model ke aplikasi saya?', a: 'Setiap model menyertakan endpoint REST dan SDK untuk Python, JavaScript, dan Go. Ambil API key di Pengaturan → Tagihan, lalu ikuti tab dokumentasi model untuk contoh siap pakai.' },
  { q: 'Apa yang terjadi jika kuota pemakaian habis?', a: 'Pada paket bermeter, request melebihi kuota ditagih sesuai tarif overage. Pada paket Discovery, generasi dijeda hingga reset bulanan atau saat kamu upgrade.' },
  { q: 'Bagaimana sistem payout untuk kreator?', a: 'Kreator mendapat 80% dari pendapatan bersih. Payout diproses bulanan ke rekening bank kamu setelah saldo melebihi Rp 750.000.' },
  { q: 'Bisakah saya minta refund?', a: 'Bisa — semua paket berbayar dilindungi garansi uang kembali 14 hari. Hubungi support dari halaman ini dan kami proses dalam 48 jam.' },
  { q: 'Apakah data saya dipakai untuk melatih model?', a: 'Tidak pernah. Prompt & output kamu privat secara default dan tidak dipakai untuk training. Paket Enterprise menambah zero-retention & deployment di dalam VPC kamu.' },
]

export default function HelpCenter() {
  const { toast } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(-1)

  const filtered = FAQ.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary-container/[0.06] blur-[100px] rounded-full -z-10" />
        <h1 className="font-display text-headline-lg md:text-display-md text-on-surface mb-4">Ada yang bisa kami bantu?</h1>
        <p className="text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">Cari di basis pengetahuan kami atau hubungi tim — kami online 24/7.</p>
        <div className="relative max-w-xl mx-auto">
          <Icon name="search" size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari jawaban…" className="w-full bg-surface-container-lowest border border-white/10 rounded-full py-4 pl-14 pr-5 text-body-md text-on-surface placeholder:text-outline/70 outline-none focus:border-primary-container/50 transition-colors" />
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOPICS.map((t) => (
            <button key={t.title} onClick={() => toast(`Membuka ${t.title}`, { icon: t.icon })} className="surface-card rounded-xl p-6 text-left hover:border-primary-container/30 electric-glow-hover transition-all flex items-start gap-4 group">
              <span className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform shrink-0"><Icon name={t.icon} size={24} /></span>
              <div><h3 className="font-display text-body-lg font-semibold text-on-surface mb-1">{t.title}</h3><p className="text-body-sm text-on-surface-variant mb-2">{t.desc}</p><span className="text-[12px] text-outline">{t.count} artikel</span></div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <h2 className="font-display text-title-md text-on-surface mb-6">Pertanyaan yang Sering Diajukan</h2>
        <div className="flex flex-col gap-3">
          {filtered.length ? filtered.map((f, i) => (
            <div key={f.q} className="surface-card rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-body-md font-medium text-on-surface">{f.q}</span>
                <Icon name={open === i ? 'remove' : 'add'} size={22} className="text-primary-container shrink-0" />
              </button>
              {open === i && <p className="px-6 pb-5 text-body-sm text-on-surface-variant leading-relaxed animate-fade-in-fast">{f.a}</p>}
            </div>
          )) : <p className="text-body-md text-on-surface-variant text-center py-8">Tidak ada artikel yang cocok dengan "{query}".</p>}
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: 'chat', title: 'Live Chat', desc: 'Rata-rata balas 2 menit', action: 'Mulai Chat', fn: () => toast('Menghubungkan ke agen…', { icon: 'chat' }) },
            { icon: 'mail', title: 'Email Support', desc: 'support@nexora.ai', action: 'Kirim Email', fn: () => toast('Aplikasi email dibuka', { icon: 'mail' }) },
            { icon: 'forum', title: 'Komunitas', desc: 'Tanya 120rb+ builder', action: 'Kunjungi Forum', fn: () => toast('Membuka komunitas…', { icon: 'forum' }) },
          ].map((c) => (
            <div key={c.title} className="glass-panel rounded-xl p-6 text-center">
              <span className="inline-flex w-12 h-12 rounded-full bg-primary-container/10 items-center justify-center text-primary-container mb-4"><Icon name={c.icon} size={24} /></span>
              <h3 className="font-display text-body-lg font-semibold text-on-surface mb-1">{c.title}</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">{c.desc}</p>
              <button onClick={c.fn} className="btn-soft px-5 py-2.5 w-full">{c.action}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
