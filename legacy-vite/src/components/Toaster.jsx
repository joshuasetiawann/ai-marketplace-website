import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const TYPE_STYLES = {
  success: 'border-primary-container/30 text-on-surface',
  error: 'border-error/40 text-on-surface',
  info: 'border-white/15 text-on-surface',
}

export default function Toaster() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="fixed z-[80] bottom-20 lg:bottom-6 inset-x-0 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto glass-panel rounded-full pl-4 pr-3 py-2.5 flex items-center gap-3 shadow-xl animate-slide-up ${TYPE_STYLES[t.type] || TYPE_STYLES.info}`}
        >
          <span
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              t.type === 'error' ? 'bg-error/15 text-error' : 'bg-primary-container/15 text-primary-container'
            }`}
          >
            <Icon name={t.icon || (t.type === 'error' ? 'error' : 'check')} size={16} fill />
          </span>
          <span className="text-body-sm font-medium pr-1">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="text-on-surface-variant hover:text-on-surface" aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
