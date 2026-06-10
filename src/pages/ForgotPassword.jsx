import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import OtpInput from '../components/OtpInput.jsx'
import { AuthShell } from './Login.jsx'
import { useApp } from '../context/AppContext.jsx'
import { generateOtp, maskEmail, passwordStrength, validateEmail } from '../data/security.js'
import { getUserByEmail, saveUser } from '../data/db.js'

export default function ForgotPassword() {
  const { toast } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 email, 2 otp, 3 new pw, 4 done
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const strength = passwordStrength(pw)

  const sendCode = (e) => {
    e.preventDefault()
    setError('')
    if (!validateEmail(email)) return setError('Format email tidak valid.')
    // Always advance (don't reveal whether an account exists — anti-enumeration).
    setCode(generateOtp())
    setStep(2)
  }
  const verify = (val) => {
    if (val !== code) return setError('Kode salah.')
    setError(''); setStep(3)
  }
  const reset = (e) => {
    e.preventDefault()
    setError('')
    if (!strength.ok) return setError('Password baru belum cukup kuat.')
    const user = getUserByEmail(email)
    if (user) saveUser({ ...user, password: pw })
    setStep(4)
    toast('Password berhasil diubah', { icon: 'lock' })
  }

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <Logo className="justify-center mb-6" />
        <h1 className="font-display text-headline-md text-on-surface mb-2">
          {step === 4 ? 'Selesai!' : 'Reset password'}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {step === 1 && 'Masukkan email, kami kirim kode untuk reset password.'}
          {step === 2 && <>Masukkan kode yang dikirim ke <b className="text-on-surface">{maskEmail(email)}</b>.</>}
          {step === 3 && 'Buat password baru yang kuat.'}
          {step === 4 && 'Password kamu sudah diperbarui. Silakan masuk.'}
        </p>
      </div>

      <div className="glass-panel rounded-xl p-6 sm:p-8">
        {error && <div className="flex items-center gap-2 text-error text-body-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2 mb-4"><Icon name="error" size={18} fill /> {error}</div>}

        {step === 1 && (
          <form onSubmit={sendCode} className="flex flex-col gap-5">
            <label className="block">
              <span className="block text-body-sm font-medium text-on-surface mb-2">Email</span>
              <div className="relative"><Icon name="mail" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.com" className="input-field pl-11" /></div>
            </label>
            <button type="submit" className="btn-primary w-full py-3.5">Kirim Kode <Icon name="arrow_forward" size={18} /></button>
          </form>
        )}

        {step === 2 && (
          <>
            <div className="mb-5 text-center text-[12px] text-on-surface-variant bg-white/5 rounded-lg py-2 px-3">🔑 Demo: kode reset <b className="font-mono text-primary-container text-sm tracking-widest">{code}</b></div>
            <OtpInput onComplete={verify} />
          </>
        )}

        {step === 3 && (
          <form onSubmit={reset} className="flex flex-col gap-4">
            <label className="block">
              <span className="block text-body-sm font-medium text-on-surface mb-2">Password Baru</span>
              <div className="relative"><Icon name="lock" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" /><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password baru" className="input-field pl-11" /></div>
              {pw && <div className="flex gap-1 mt-3">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i < strength.score ? (strength.score >= 3 ? 'bg-success' : 'bg-secondary') : 'bg-white/10'}`} />)}</div>}
            </label>
            <button type="submit" className="btn-primary w-full py-3.5">Simpan Password</button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/15 border border-success/30 flex items-center justify-center mb-5"><Icon name="check" size={32} className="text-success" /></div>
            <button onClick={() => navigate('/login')} className="btn-primary w-full py-3.5">Masuk Sekarang</button>
          </div>
        )}
      </div>

      <p className="text-center text-body-sm text-on-surface-variant mt-6">Ingat password? <Link to="/login" className="text-primary-container font-semibold hover:text-primary">Masuk</Link></p>
    </AuthShell>
  )
}
