import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { StatusPill } from '../components/DashboardKit.jsx'
import { CATEGORIES, TIERS } from '../data/models.js'
import { useApp } from '../context/AppContext.jsx'
import { addProduct } from '../data/db.js'
import { USD_TO_IDR } from '../data/payment.js'

export default function UploadProduct() {
  const navigate = useNavigate()
  const { user, toast, bumpCatalog } = useApp()
  const fileRef = useRef(null)
  const [form, setForm] = useState({ title: '', category: '', tier: 'Pro', description: '', price: '', tags: '' })
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleFile = (file) => file && setFileName(file.name)

  const publish = (e) => {
    e.preventDefault()
    if (!form.title || !form.category) {
      toast('Lengkapi judul dan kategori dulu', { type: 'error', icon: 'error' })
      return
    }
    addProduct({
      name: form.title.trim(),
      tagline: form.description.slice(0, 80) || 'Model AI baru',
      category: form.category,
      tier: form.tier,
      price: Math.round(((Number(String(form.price).replace(/\D/g, '')) || 0) / USD_TO_IDR) * 100) / 100,
      rating: 0,
      reviews: 0,
      ownerId: user?.id,
      ownerName: user?.name,
      art: ['#0b3a44', '#00e5ff'],
      icon: 'auto_awesome',
      description: form.description,
      useCases: [],
      useCaseTags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      capabilities: [],
      specs: {},
      gallery: 3,
    })
    bumpCatalog()
    setSubmitted(true)
  }

  const saveDraft = () => toast('Draf disimpan', { icon: 'save' })

  if (submitted) {
    const home = user?.role === 'developer' ? '/developer' : '/seller'
    return (
      <div className="max-w-lg mx-auto px-margin-mobile py-16 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center mb-6"><Icon name="fact_check" size={38} className="text-secondary" /></div>
        <StatusPill status="under_review" />
        <h1 className="font-display text-headline-md text-on-surface mt-4 mb-3">Produk dikirim untuk ditinjau</h1>
        <p className="text-body-md text-on-surface-variant mb-2"><b className="text-on-surface">{form.title}</b> sedang ditinjau tim moderasi kami.</p>
        <p className="text-body-sm text-on-surface-variant mb-8">Review keamanan & kualitas biasanya selesai dalam 1–2 hari kerja. Kamu akan diberi tahu saat produk disetujui dan tayang.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={home} className="btn-primary px-6 py-3"><Icon name="dashboard" size={18} /> Ke Dashboard</Link>
          <button onClick={() => { setSubmitted(false); setForm({ title: '', category: '', tier: 'Pro', description: '', price: '', tags: '' }); setFileName('') }} className="btn-ghost px-6 py-3"><Icon name="add" size={18} /> Upload Lagi</button>
        </div>
      </div>
    )
  }

  const completion =
    [form.title, form.category, form.description, form.price, fileName].filter(Boolean).length

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="font-label text-label-sm uppercase tracking-widest text-primary-container mb-2">Seller Studio</p>
          <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface">Publikasikan Aset Baru</h1>
          <p className="text-body-md text-on-surface-variant mt-2">Daftarkan model AI, koleksi prompt, atau dataset kamu ke marketplace.</p>
        </div>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant" aria-label="Close">
          <Icon name="close" size={24} />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{ width: `${(completion / 5) * 100}%` }} />
        </div>
        <span className="text-[12px] text-on-surface-variant font-mono">{completion}/5</span>
      </div>

      <form onSubmit={publish} className="flex flex-col gap-6">
        {/* 1. Core details */}
        <Section number="1" title="Detail Inti" icon="article">
          <Field label="Judul Produk">
            <input value={form.title} onChange={set('title')} placeholder="cth. Nexus-7 LLM Fine-tune" className="input-field" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Kategori">
              <div className="relative">
                <select value={form.category} onChange={set('category')} className="input-field appearance-none pr-10 cursor-pointer">
                  <option value="" className="bg-surface-container">Pilih kategori…</option>
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface-container">{c.label}</option>
                  ))}
                </select>
                <Icon name="expand_more" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              </div>
            </Field>
            <Field label="Paket Harga">
              <div className="flex gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tier: t }))}
                    className={`flex-1 py-3 rounded-lg border text-body-sm transition-all ${form.tier === t ? 'border-primary-container bg-primary-container/10 text-primary-container' : 'border-white/10 text-on-surface-variant hover:border-white/30'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </Section>

        {/* 2. Presentation */}
        <Section number="2" title="Presentasi" icon="image">
          <p className="text-body-sm font-medium text-on-surface mb-2">Unggah Thumbnail</p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${dragging ? 'border-primary-container bg-primary-container/5' : 'border-white/15 hover:border-white/30'}`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            {fileName ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  <ModelArtwork seed={fileName} colors={['#0b3a44', '#00e5ff']} className="w-full h-full" />
                </div>
                <p className="text-body-sm text-on-surface flex items-center gap-2"><Icon name="check_circle" size={16} className="text-success" fill /> {fileName}</p>
                <span className="text-[12px] text-primary-container">Click to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
                  <Icon name="cloud_upload" size={28} />
                </div>
                <div>
                  <p className="text-body-md font-semibold text-on-surface">Seret & lepas gambar utama kamu</p>
                  <p className="text-body-sm text-on-surface-variant">PNG, JPG, atau WebP maks 10MB · rasio 16:9 disarankan</p>
                </div>
                <span className="btn-soft px-4 py-2 text-[13px]"><Icon name="folder_open" size={16} /> Pilih File</span>
              </div>
            )}
          </div>
        </Section>

        {/* 3. Description & pricing */}
        <Section number="3" title="Deskripsi & Harga" icon="sell">
          <Field label="Deskripsi Produk">
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={4}
              placeholder="Jelaskan kemampuan, data latih, dan kegunaannya…"
              className="input-field resize-none"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Harga / bulan (Rp)">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-body-sm">Rp</span>
                <input inputMode="numeric" value={form.price} onChange={set('price')} placeholder="0" className="input-field pl-10" />
              </div>
            </Field>
            <Field label="Tag (pisahkan dengan koma)">
              <input value={form.tags} onChange={set('tags')} placeholder="vision, enterprise, cepat" className="input-field" />
            </Field>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-20 lg:bottom-4 glass-panel rounded-xl p-4 -mx-2">
          <button type="button" onClick={saveDraft} className="btn-ghost px-5 py-3"><Icon name="save" size={18} /> Simpan Draf</button>
          <button type="submit" className="btn-primary px-6 py-3"><Icon name="rocket_launch" size={18} /> Publikasikan untuk Review</button>
        </div>
      </form>
    </div>
  )
}

function Section({ number, title, icon, children }) {
  return (
    <section className="surface-card rounded-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-9 h-9 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
          <Icon name={icon} size={20} />
        </span>
        <h2 className="font-display text-title-md text-on-surface">
          <span className="text-primary-container">{number}.</span> {title}
        </h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-body-sm font-medium text-on-surface mb-2">{label}</span>
      {children}
    </label>
  )
}
