import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell } from './Login.jsx'
import { passwordStrength, validateEmail } from '../data/security.js'

export default function Register() {
  const { register } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [agree, setAgree] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const strength = passwordStrength(form.password)

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Masukkan nama lengkap.')
    if (!validateEmail(form.email)) return setError('Format email tidak valid.')
    if (!strength.ok) return setError('Password belum cukup kuat (min. 3 dari 4 syarat).')
    if (!agree) return setError('Setujui syarat & ketentuan untuk lanjut.')
    // Everyone joins as a shopper; selling is one tap away via "Buka Toko".
    const res = register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: 'buyer' })
    if (res.error) return setError(res.error)
    navigate('/verify-email', { state: { email: form.email.trim(), fresh: true } })
  }

  return (
    <AuthShell>
      <div className="text-center mb-7">
        <Logo className="justify-center mb-5" />
        <h1 className="font-display text-headline-md text-on-surface mb-2">Buat akun</h1>
        <p className="text-body-md text-on-surface-variant">Satu akun untuk belanja & berjualan model AI premium.</p>
      </div>

      <form onSubmit={submit} className="glass-panel rounded-xl p-6 sm:p-7 flex flex-col gap-4">
        {error && <div className="flex items-center gap-2 text-error text-body-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2"><Icon name="error" size={18} fill /> {error}</div>}
        <label className="block">
          <span className="block text-body-sm font-medium text-on-surface mb-2">Nama Lengkap</span>
          <div className="relative"><Icon name="person" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" /><input value={form.name} onChange={set('name')} placeholder="Alex Morgan" className="input-field pl-11" /></div>
        </label>
        <label className="block">
          <span className="block text-body-sm font-medium text-on-surface mb-2">Email</span>
          <div className="relative"><Icon name="mail" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" /><input type="email" value={form.email} onChange={set('email')} placeholder="nama@perusahaan.com" className="input-field pl-11" /></div>
        </label>
        <label className="block">
          <span className="block text-body-sm font-medium text-on-surface mb-2">Password</span>
          <div className="relative"><Icon name="lock" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Buat password kuat" className="input-field pl-11 pr-11" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"><Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} /></button>
          </div>
          {form.password && (
            <div className="mt-3">
              <div className="flex gap-1 mb-2">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength.score ? (strength.score >= 3 ? 'bg-success' : 'bg-secondary') : 'bg-white/10'}`} />)}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {strength.checks.map((c) => <span key={c.label} className={`flex items-center gap-1.5 text-[11px] ${c.ok ? 'text-success' : 'text-on-surface-variant'}`}><Icon name={c.ok ? 'check_circle' : 'circle'} size={12} fill={c.ok} /> {c.label}</span>)}
              </div>
            </div>
          )}
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <button type="button" onClick={() => setAgree((a) => !a)} className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${agree ? 'bg-primary-container border-primary-container' : 'border-white/30'}`}>{agree && <Icon name="check" size={14} className="text-on-primary-container" />}</button>
          <span className="text-body-sm text-on-surface-variant">Saya setuju dengan <a href="#" onClick={(e) => e.preventDefault()} className="text-primary-container hover:underline">Syarat</a> & <a href="#" onClick={(e) => e.preventDefault()} className="text-primary-container hover:underline">Kebijakan Privasi</a>.</span>
        </label>
        <button type="submit" className="btn-primary w-full py-3.5">Buat Akun <Icon name="arrow_forward" size={18} /></button>
        <p className="text-center text-[12px] text-on-surface-variant flex items-center justify-center gap-1.5">
          <Icon name="storefront" size={14} className="text-secondary" /> Mau jualan? Buka toko gratis kapan saja setelah daftar.
        </p>
      </form>

      <p className="text-center text-body-sm text-on-surface-variant mt-6">Sudah punya akun? <Link to="/login" className="text-primary-container font-semibold hover:text-primary">Masuk</Link></p>
    </AuthShell>
  )
}
