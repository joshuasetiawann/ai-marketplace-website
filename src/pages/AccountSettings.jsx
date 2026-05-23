import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'billing', label: 'Billing', icon: 'credit_card' },
]

export default function AccountSettings() {
  const { user, login, toast } = useApp()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || 'Alex',
    lastName: user?.name?.split(' ')[1] || 'Morgan',
    email: user?.email || 'alex@nexora.ai',
    title: 'Creative Director',
  })
  const [notif, setNotif] = useState({ platform: true, security: true, weekly: false, marketing: false })
  const set = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }))

  const saveProfile = (e) => {
    e.preventDefault()
    login({ name: `${profile.firstName} ${profile.lastName}`.trim(), email: profile.email })
    toast('Profile updated', { icon: 'check' })
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="mb-8">
        <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-2">Account Settings</h1>
        <p className="text-body-md text-on-surface-variant">Manage your Nexora AI profile, security, and preferences.</p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24">
          <div className="surface-card rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id ? 'bg-primary-container/10 text-primary-container' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                }`}
              >
                <Icon name={t.icon} size={20} fill={tab === t.id} /> {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="surface-card rounded-xl p-6 md:p-8 animate-fade-in">
              <h2 className="font-display text-title-md text-on-surface mb-1">Profile Information</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">Update your personal details and public profile.</p>

              <div className="flex items-center gap-5 mb-8">
                <span className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary-container text-3xl font-bold">
                  {profile.firstName.charAt(0)}
                </span>
                <div>
                  <button type="button" onClick={() => toast('Photo upload coming soon', { icon: 'photo_camera' })} className="btn-soft px-4 py-2 text-[13px]"><Icon name="photo_camera" size={16} /> Change Photo</button>
                  <p className="text-[12px] text-on-surface-variant mt-2">JPG or PNG. Max 2MB.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Field label="First Name"><input value={profile.firstName} onChange={set('firstName')} className="input-field" /></Field>
                <Field label="Last Name"><input value={profile.lastName} onChange={set('lastName')} className="input-field" /></Field>
              </div>
              <Field label="Email Address"><input type="email" value={profile.email} onChange={set('email')} className="input-field" /></Field>
              <Field label="Professional Title"><input value={profile.title} onChange={set('title')} className="input-field" /></Field>

              <div className="flex justify-end mt-6">
                <button type="submit" className="btn-primary px-6 py-3">Save Changes</button>
              </div>
            </form>
          )}

          {tab === 'security' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="surface-card rounded-xl p-6 md:p-8">
                <h2 className="font-display text-title-md text-on-surface mb-1">Security</h2>
                <p className="text-body-sm text-on-surface-variant mb-6">Manage passwords and authentication.</p>
                <Field label="Current Password"><input type="password" placeholder="••••••••" className="input-field" /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="New Password"><input type="password" placeholder="••••••••" className="input-field" /></Field>
                  <Field label="Confirm Password"><input type="password" placeholder="••••••••" className="input-field" /></Field>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={() => toast('Password updated', { icon: 'lock' })} className="btn-primary px-6 py-3">Update Password</button>
                </div>
              </div>
              <div className="surface-card rounded-xl p-6 md:p-8 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-body-lg font-semibold text-on-surface mb-1">Two-Factor Authentication</h3>
                  <p className="text-body-sm text-on-surface-variant">Add an extra layer of security to your account.</p>
                </div>
                <button onClick={() => toast('2FA setup started', { icon: 'security' })} className="btn-ghost px-5 py-2.5 shrink-0">Enable 2FA</button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="surface-card rounded-xl p-6 md:p-8 animate-fade-in">
              <h2 className="font-display text-title-md text-on-surface mb-1">Notifications</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">Control how we communicate with you.</p>
              <div className="flex flex-col divide-y divide-white/10">
                {[
                  { key: 'platform', title: 'Platform Updates', desc: 'Receive news about new AI models and features.' },
                  { key: 'security', title: 'Security Alerts', desc: 'Get notified of unusual account activity immediately.' },
                  { key: 'weekly', title: 'Weekly Digest', desc: 'A summary of your AI usage and performance metrics.' },
                  { key: 'marketing', title: 'Promotions', desc: 'Occasional offers, discounts and creator spotlights.' },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-body-md font-medium text-on-surface">{n.title}</p>
                      <p className="text-body-sm text-on-surface-variant">{n.desc}</p>
                    </div>
                    <Toggle on={notif[n.key]} onClick={() => setNotif((s) => ({ ...s, [n.key]: !s[n.key] }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="surface-card rounded-xl p-6 md:p-8 bg-gradient-to-br from-primary-container/5 to-transparent">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Current Plan</p>
                    <h2 className="font-display text-headline-md text-primary-container">Nexora Creator</h2>
                  </div>
                  <Icon name="workspace_premium" size={32} className="text-secondary" fill />
                </div>
                <p className="text-body-sm text-on-surface-variant mb-5">Billed annually · Next billing date is Oct 15, 2025.</p>
                <ul className="flex flex-col gap-2 mb-6">
                  {['Unlimited API Calls', 'Priority Model Access', '24/7 Dedicated Support'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-body-sm text-on-surface"><Icon name="check_circle" size={16} className="text-primary-container" fill /> {f}</li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <Link to="/pricing" className="btn-primary px-5 py-2.5">Change Plan</Link>
                  <button onClick={() => toast('Billing portal opened', { icon: 'open_in_new' })} className="btn-ghost px-5 py-2.5">Manage Billing</button>
                </div>
              </div>
              <div className="surface-card rounded-xl p-6 md:p-8">
                <h3 className="font-display text-body-lg font-semibold text-on-surface mb-4">Payment Method</h3>
                <div className="flex items-center gap-4 p-4 rounded-lg border border-white/10">
                  <Icon name="credit_card" size={28} className="text-primary-container" />
                  <div className="flex-1">
                    <p className="text-body-sm text-on-surface">Visa ending in 4242</p>
                    <p className="text-[12px] text-on-surface-variant">Expires 08/27</p>
                  </div>
                  <button onClick={() => toast('Edit card', { icon: 'edit' })} className="text-label-md font-label text-primary-container hover:text-primary">Edit</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-body-sm font-medium text-on-surface mb-2">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} className={`relative w-12 h-6 rounded-full shrink-0 transition-colors ${on ? 'bg-primary-container' : 'bg-white/15'}`} aria-pressed={on}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-7' : 'left-1'}`} />
    </button>
  )
}
