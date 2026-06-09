import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell } from './Login.jsx'

const PERKS = [
  'Access 2,400+ curated AI models',
  'Sync your library across devices',
  'Sell your own models & earn',
]

export default function Register() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (!agree) {
      setError('Please accept the terms to continue.')
      return
    }
    login({ name: form.name, email: form.email })
    navigate('/dashboard')
  }

  const strength = Math.min(4, Math.floor(form.password.length / 3))
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <Logo className="justify-center mb-6" />
        <h1 className="font-display text-headline-md text-on-surface mb-2">Create your account</h1>
        <p className="text-body-md text-on-surface-variant">Join the premium AI marketplace in seconds.</p>
      </div>

      <div className="flex justify-center gap-x-5 gap-y-2 flex-wrap mb-6">
        {PERKS.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5 text-[12px] text-on-surface-variant">
            <Icon name="check_circle" size={14} className="text-primary-container" fill /> {p}
          </span>
        ))}
      </div>

      <form onSubmit={submit} className="glass-panel rounded-xl p-6 sm:p-8 flex flex-col gap-5">
        {error && (
          <div className="flex items-center gap-2 text-error text-body-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">
            <Icon name="error" size={18} fill /> {error}
          </div>
        )}
        <label className="block">
          <span className="block text-body-sm font-medium text-on-surface mb-2">Full Name</span>
          <div className="relative">
            <Icon name="person" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input value={form.name} onChange={set('name')} placeholder="Alex Morgan" className="input-field pl-11" />
          </div>
        </label>
        <label className="block">
          <span className="block text-body-sm font-medium text-on-surface mb-2">Email</span>
          <div className="relative">
            <Icon name="mail" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input type="email" value={form.email} onChange={set('email')} placeholder="name@company.com" className="input-field pl-11" />
          </div>
        </label>
        <label className="block">
          <span className="block text-body-sm font-medium text-on-surface mb-2">Password</span>
          <div className="relative">
            <Icon name="lock" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input type="password" value={form.password} onChange={set('password')} placeholder="Create a password" className="input-field pl-11" />
          </div>
          {form.password && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? 'bg-primary-container' : 'bg-white/10'}`} />
                ))}
              </div>
              <span className="text-[11px] text-on-surface-variant">{strengthLabels[strength]}</span>
            </div>
          )}
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setAgree((a) => !a)}
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${agree ? 'bg-primary-container border-primary-container' : 'border-white/30'}`}
          >
            {agree && <Icon name="check" size={14} className="text-on-primary-container" />}
          </button>
          <span className="text-body-sm text-on-surface-variant">
            I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="text-primary-container hover:underline">Terms</a> and{' '}
            <a href="#" onClick={(e) => e.preventDefault()} className="text-primary-container hover:underline">Privacy Policy</a>.
          </span>
        </label>

        <button type="submit" className="btn-primary w-full py-3.5">
          Create Account <Icon name="arrow_forward" size={18} />
        </button>
      </form>

      <p className="text-center text-body-sm text-on-surface-variant mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-container font-semibold hover:text-primary">Sign In</Link>
      </p>
    </AuthShell>
  )
}
