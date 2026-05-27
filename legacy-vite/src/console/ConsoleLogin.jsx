import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import OtpInput from '../components/OtpInput.jsx'
import { useApp } from '../context/AppContext.jsx'
import { authenticate } from '../data/db.js'
import { generateOtp, validateEmail } from '../data/security.js'

export default function ConsoleLogin() {
  const { isAuthenticated, role, establish } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [step, setStep] = useState('cred') // cred | otp
  const [pending, setPending] = useState(null)
  const [code, setCode] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // already signed in as staff → into the console
  if (isAuthenticated && (role === 'admin' || role === 'developer')) return <Navigate to="/" replace />

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!validateEmail(form.email)) return setError('Format email tidak valid.')
    const res = authenticate(form.email.trim(), form.password)
    if (res.error) return setError(res.error)
    const u = res.user
    if (u.role !== 'admin' && u.role !== 'developer') {
      return setError('Akun ini tidak punya akses konsol. Gunakan akun admin atau developer.')
    }
    if (u.twoFactor) { setPending(u); setCode(generateOtp()); setStep('otp'); return }
    establish(u, { silent: true })
    navigate('/')
  }

  const verify = (entered) => {
    if (entered === code) { establish(pending, { silent: true }); navigate('/') }
    else setError('Kode verifikasi salah, coba lagi.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-margin-mobile py-12 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[360px] bg-primary-container/[0.06] blur-[120px] rounded-full -z-10" />
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-on-surface/10 border border-white/10 items-center justify-center mb-4"><Icon name="terminal" size={28} className="text-on-surface" /></span>
          <h1 className="font-display text-headline-md text-on-surface">Nexora Console</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Akses internal untuk Admin & Developer.</p>
        </div>

        {step === 'cred' ? (
          <form onSubmit={submit} className="glass-panel rounded-xl p-6 sm:p-7 flex flex-col gap-4">
            {error && <div className="flex items-center gap-2 text-error text-body-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2"><Icon name="error" size={18} fill /> {error}</div>}
            <label className="block">
              <span className="block text-body-sm font-medium text-on-surface mb-2">Email staff</span>
              <div className="relative"><Icon name="mail" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" /><input type="email" value={form.email} onChange={set('email')} placeholder="admin@nexora.ai" className="input-field pl-11" /></div>
            </label>
            <label className="block">
              <span className="block text-body-sm font-medium text-on-surface mb-2">Password</span>
              <div className="relative"><Icon name="lock" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"><Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} /></button>
              </div>
            </label>
            <button type="submit" className="btn-primary w-full py-3.5">Masuk Konsol <Icon name="arrow_forward" size={18} /></button>
            <div className="rounded-lg bg-surface-container-lowest border border-white/10 p-3 text-[12px] text-on-surface-variant">
              <p className="font-medium text-on-surface mb-1">Akun demo</p>
              <p>Admin — <span className="font-mono text-primary-container">admin@nexora.ai</span> (2FA)</p>
              <p>Developer — <span className="font-mono text-primary-container">dev@nexora.ai</span></p>
              <p className="mt-1">Password semua: <span className="font-mono">Demo1234!</span></p>
            </div>
          </form>
        ) : (
          <div className="glass-panel rounded-xl p-6 sm:p-7 flex flex-col gap-4">
            <div className="text-center">
              <Icon name="verified_user" size={28} className="text-primary-container mb-2" />
              <p className="text-body-md text-on-surface">Verifikasi dua faktor</p>
              <p className="text-body-sm text-on-surface-variant">Masukkan 6 digit kode untuk <b className="text-on-surface">{pending?.name}</b>.</p>
            </div>
            <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-3 text-center">
              <p className="text-[12px] text-on-surface-variant">Kode demo (biasanya via authenticator)</p>
              <p className="font-mono text-title-md text-secondary tracking-[0.3em]">{code}</p>
            </div>
            <OtpInput onComplete={verify} />
            {error && <p className="text-error text-body-sm text-center">{error}</p>}
            <button onClick={() => { setStep('cred'); setError('') }} className="btn-ghost py-2.5 text-body-sm">Kembali</button>
          </div>
        )}

        <p className="text-center text-[12px] text-on-surface-variant mt-6 flex items-center justify-center gap-1.5">
          <Icon name="lock" size={13} /> Surface terpisah dari marketplace publik.
        </p>
      </div>
    </div>
  )
}
