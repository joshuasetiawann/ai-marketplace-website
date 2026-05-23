import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import OtpInput from '../components/OtpInput.jsx'
import { AuthShell } from './Login.jsx'
import { useApp } from '../context/AppContext.jsx'
import { generateOtp, maskEmail } from '../data/security.js'
import { getUserByEmail, getUser, ROLES } from '../data/db.js'

export default function VerifyEmail() {
  const { verifyEmail, establish } = useApp()
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email
  const [code, setCode] = useState(() => generateOtp())
  const [error, setError] = useState('')
  const [resentAt, setResentAt] = useState(null)
  const user = useMemo(() => (email ? getUserByEmail(email) : null), [email])

  if (!email || !user) {
    return (
      <AuthShell>
        <div className="text-center">
          <Logo className="justify-center mb-6" />
          <h1 className="font-display text-headline-md text-on-surface mb-3">Verifikasi email</h1>
          <p className="text-body-md text-on-surface-variant mb-6">Sesi verifikasi tidak ditemukan. Silakan masuk atau daftar lagi.</p>
          <Link to="/login" className="btn-primary px-6 py-3">Ke Halaman Masuk</Link>
        </div>
      </AuthShell>
    )
  }

  const confirm = (val) => {
    if (val !== code) return setError('Kode verifikasi salah.')
    verifyEmail(user.id)
    const fresh = getUser(user.id)
    establish(fresh, { silent: true })
    navigate(ROLES[fresh.role]?.home || '/dashboard', { replace: true })
  }

  const resend = () => { setCode(generateOtp()); setResentAt(Date.now()); setError('') }

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <Logo className="justify-center mb-6" />
        <div className="w-14 h-14 mx-auto rounded-full bg-primary-container/10 border border-primary-container/25 flex items-center justify-center mb-4"><Icon name="mark_email_read" size={26} className="text-primary-container" /></div>
        <h1 className="font-display text-headline-md text-on-surface mb-2">Verifikasi email kamu</h1>
        <p className="text-body-md text-on-surface-variant">Kami mengirim 6 digit kode ke <b className="text-on-surface">{maskEmail(email)}</b>.</p>
      </div>
      <div className="glass-panel rounded-xl p-6 sm:p-8">
        <div className="mb-5 text-center text-[12px] text-on-surface-variant bg-white/5 rounded-lg py-2 px-3">📧 Demo: kode verifikasi kamu <b className="font-mono text-primary-container text-sm tracking-widest">{code}</b></div>
        <OtpInput key={code} onComplete={confirm} />
        {error && <p className="text-error text-body-sm text-center mt-4">{error}</p>}
        <p className="text-center text-body-sm text-on-surface-variant mt-6">
          Tidak menerima kode?{' '}
          <button onClick={resend} className="text-primary-container font-semibold hover:text-primary">Kirim ulang</button>
          {resentAt && <span className="text-success ml-1">✓ terkirim</span>}
        </p>
      </div>
      <p className="text-center text-[12px] text-outline mt-5">Verifikasi email melindungi akun & mencegah pendaftaran palsu.</p>
    </AuthShell>
  )
}
