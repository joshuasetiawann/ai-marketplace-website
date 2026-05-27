import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

// Global overlay shown when the session times out from inactivity.
export default function SessionExpiredModal() {
  const { sessionExpired, resolveSessionExpired } = useApp()
  const navigate = useNavigate()
  if (!sessionExpired) return null

  const goLogin = () => {
    resolveSessionExpired()
    navigate('/login')
  }
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div className="relative w-full max-w-sm glass-panel rounded-2xl p-7 text-center animate-scale-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center mb-5">
          <Icon name="schedule" size={32} className="text-secondary" />
        </div>
        <h2 className="font-display text-title-md text-on-surface mb-2">Sesi berakhir</h2>
        <p className="text-body-sm text-on-surface-variant mb-6">
          Demi keamanan, kamu otomatis keluar setelah 30 menit tidak aktif. Silakan masuk lagi untuk melanjutkan.
        </p>
        <button onClick={goLogin} className="btn-primary w-full py-3">
          <Icon name="login" size={18} /> Masuk kembali
        </button>
      </div>
    </div>
  )
}
