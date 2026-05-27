import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import OtpInput from '../components/OtpInput.jsx'
import { useApp } from '../context/AppContext.jsx'
import { generateOtp, maskEmail, validateEmail } from '../data/security.js'
import { getUserByEmail, ROLES, DEMO_CREDENTIALS } from '../data/db.js'

export default function Login() {
  const { signIn, establish } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [twoFA, setTwoFA] = useState(null) // { user, code }

  const go = (user) => navigate(next || ROLES[user.role]?.home || '/dashboard', { replace: true })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!validateEmail(email)) return setError('Format email tidak valid.')
    if (!password) return setError('Masukkan password kamu.')
    const res = signIn(email, password)
    if (res.error) return setError(res.error)
    if (res.needVerify) return navigate('/verify-email', { state: { email } })
    if (res.need2FA) {
      const code = generateOtp()
      setTwoFA({ user: res.user, code })
      return
    }
    if (res.ok) go(res.user)
  }

  const quickDemo = (cred) => {
    const user = getUserByEmail(cred.email)
    if (user) { establish(user); go(user) }
  }

  // ── 2FA / OTP step ──────────────────────────────────────────────────────────
  if (twoFA) {
    return (
      <AuthShell>
        <div className="text-center mb-8">
          <Logo className="justify-center mb-6" />
          <div className="w-14 h-14 mx-auto rounded-full bg-primary-container/10 border border-primary-container/25 flex items-center justify-center mb-4"><Icon name="verified_user" size={26} className="text-primary-container" /></div>
          <h1 className="font-display text-headline-md text-on-surface mb-2">Verifikasi 2 Langkah</h1>
          <p className="text-body-md text-on-surface-variant">Masukkan 6 digit kode yang dikirim ke <b className="text-on-surface">{maskEmail(twoFA.user.email)}</b>.</p>
        </div>
        <div className="glass-panel rounded-xl p-6 sm:p-8">
          <div className="mb-5 text-center text-[12px] text-on-surface-variant bg-white/5 rounded-lg py-2 px-3">
            🔐 Demo: kode kamu adalah <b className="font-mono text-primary-container text-sm tracking-widest">{twoFA.code}</b>
          </div>
          <OtpInput onComplete={(val) => {
            if (val === twoFA.code) { establish(twoFA.user); go(twoFA.user) }
            else setError('Kode salah, coba lagi.')
          }} />
          {error && <p className="text-error text-body-sm text-center mt-4">{error}</p>}
          <button onClick={() => { setTwoFA(null); setError('') }} className="btn-ghost w-full py-3 mt-6">Kembali</button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <Logo className="justify-center mb-6" />
        <h1 className="font-display text-headline-md text-on-surface mb-2">Selamat datang kembali</h1>
        <p className="text-body-md text-on-surface-variant">Masuk untuk mengakses workspace cerdas kamu.</p>
      </div>

      <form onSubmit={submit} className="glass-panel rounded-xl p-6 sm:p-8 flex flex-col gap-5">
        {error && <div className="flex items-center gap-2 text-error text-body-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2"><Icon name="error" size={18} fill /> {error}</div>}
        <label className="block">
          <span className="block text-body-sm font-medium text-on-surface mb-2">Email</span>
          <div className="relative">
            <Icon name="mail" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.com" className="input-field pl-11" autoComplete="email" />
          </div>
        </label>
        <label className="block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm font-medium text-on-surface">Password</span>
            <Link to="/forgot-password" className="text-label-md font-label text-primary-container hover:text-primary">Lupa password?</Link>
          </div>
          <div className="relative">
            <Icon name="lock" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-11 pr-11" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" aria-label="Tampilkan password"><Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} /></button>
          </div>
        </label>
        <button type="submit" className="btn-primary w-full py-3.5">Masuk <Icon name="arrow_forward" size={18} /></button>
      </form>

      {/* Demo role accounts */}
      <div className="mt-6">
        <div className="flex items-center gap-4 mb-3"><span className="flex-1 h-px bg-white/10" /><span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Coba akun demo</span><span className="flex-1 h-px bg-white/10" /></div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_CREDENTIALS.map((c) => (
            <button key={c.email} onClick={() => quickDemo(c)} className="flex items-center gap-2 p-2.5 rounded-lg border border-white/10 hover:border-primary-container/40 hover:bg-white/5 transition-all text-left">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ROLES[c.role].accent}1a`, color: ROLES[c.role].accent }}><Icon name={ROLES[c.role].icon} size={16} /></span>
              <div className="min-w-0"><p className="text-[12px] font-semibold text-on-surface leading-tight">{ROLES[c.role].label}</p><p className="text-[10px] text-on-surface-variant truncate">{c.email}</p></div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-body-sm text-on-surface-variant mt-6">Belum punya akun? <Link to="/register" className="text-primary-container font-semibold hover:text-primary">Daftar</Link></p>
    </AuthShell>
  )
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-margin-mobile py-12 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-container/[0.07] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-container/[0.05] blur-[120px] rounded-full pointer-events-none" />
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"><Icon name="arrow_back" size={18} /> Beranda</Link>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  )
}
