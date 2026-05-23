import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { passwordStrength } from '../data/security.js'
import { useApp } from '../context/AppContext.jsx'
import { ROLES } from '../data/db.js'

const TABS = [
  { id: 'profile', label: 'Profil', icon: 'person' },
  { id: 'security', label: 'Keamanan', icon: 'lock' },
  { id: 'sessions', label: 'Perangkat', icon: 'devices' },
  { id: 'notifications', label: 'Notifikasi', icon: 'notifications' },
  { id: 'billing', label: 'Tagihan', icon: 'credit_card' },
]

export default function AccountSettings() {
  const { user, updateProfile, setTwoFactor, devices, revokeDevice, toast } = useApp()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    title: user?.title || '',
  })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [notif, setNotif] = useState({ platform: true, security: true, weekly: false, marketing: false })
  const set = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }))
  const strength = passwordStrength(pw.next)
  const roleMeta = ROLES[user?.role] || ROLES.buyer

  const saveProfile = (e) => {
    e.preventDefault()
    updateProfile({ name: `${profile.firstName} ${profile.lastName}`.trim(), email: profile.email, title: profile.title })
  }
  const changePassword = () => {
    if (!pw.current) return toast('Masukkan password lama', { type: 'error', icon: 'error' })
    if (!strength.ok) return toast('Password baru belum cukup kuat', { type: 'error', icon: 'error' })
    if (pw.next !== pw.confirm) return toast('Konfirmasi password tidak cocok', { type: 'error', icon: 'error' })
    updateProfile({ password: pw.next })
    setPw({ current: '', next: '', confirm: '' })
    toast('Password diperbarui', { icon: 'lock' })
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="mb-8">
        <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-2">Pengaturan Akun</h1>
        <p className="text-body-md text-on-surface-variant flex items-center gap-2">
          Kelola profil & keamanan ·
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px]" style={{ background: `${roleMeta.accent}1a`, color: roleMeta.accent }}>
            <Icon name={roleMeta.icon} size={13} /> {roleMeta.label}
          </span>
        </p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-24">
          <div className="surface-card rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-primary-container/10 text-primary-container' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
                <Icon name={t.icon} size={20} fill={tab === t.id} /> {t.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="surface-card rounded-xl p-6 md:p-8 animate-fade-in">
              <h2 className="font-display text-title-md text-on-surface mb-1">Informasi Profil</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">Perbarui detail pribadi & profil publik kamu.</p>
              <div className="flex items-center gap-5 mb-8">
                <span className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary-container text-3xl font-bold">{profile.firstName.charAt(0) || 'U'}</span>
                <button type="button" onClick={() => toast('Upload foto segera hadir', { icon: 'photo_camera' })} className="btn-soft px-4 py-2 text-[13px]"><Icon name="photo_camera" size={16} /> Ganti Foto</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Field label="Nama Depan"><input value={profile.firstName} onChange={set('firstName')} className="input-field" /></Field>
                <Field label="Nama Belakang"><input value={profile.lastName} onChange={set('lastName')} className="input-field" /></Field>
              </div>
              <Field label="Email"><input type="email" value={profile.email} onChange={set('email')} className="input-field" /></Field>
              <Field label="Jabatan / Title"><input value={profile.title} onChange={set('title')} placeholder="cth. Creative Director" className="input-field" /></Field>
              <div className="flex justify-end mt-6"><button type="submit" className="btn-primary px-6 py-3">Simpan Perubahan</button></div>
            </form>
          )}

          {tab === 'security' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="surface-card rounded-xl p-6 md:p-8">
                <h2 className="font-display text-title-md text-on-surface mb-1">Ubah Password</h2>
                <p className="text-body-sm text-on-surface-variant mb-6">Gunakan password kuat & unik.</p>
                <Field label="Password Saat Ini"><input type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} placeholder="••••••••" className="input-field" /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Password Baru"><input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} placeholder="••••••••" className="input-field" /></Field>
                  <Field label="Konfirmasi"><input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" className="input-field" /></Field>
                </div>
                {pw.next && <div className="flex gap-1 mb-4 -mt-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i < strength.score ? (strength.score >= 3 ? 'bg-success' : 'bg-secondary') : 'bg-white/10'}`} />)}</div>}
                <div className="flex justify-end"><button onClick={changePassword} className="btn-primary px-6 py-3">Perbarui Password</button></div>
              </div>
              <div className="surface-card rounded-xl p-6 md:p-8 flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${user?.twoFactor ? 'bg-success/15 text-success' : 'bg-white/5 text-on-surface-variant'}`}><Icon name="verified_user" size={22} fill={user?.twoFactor} /></span>
                  <div>
                    <h3 className="font-display text-body-lg font-semibold text-on-surface mb-1">Autentikasi Dua Faktor (2FA)</h3>
                    <p className="text-body-sm text-on-surface-variant">{user?.twoFactor ? 'Aktif — kamu akan diminta kode OTP saat login.' : 'Tambah lapisan keamanan ekstra dengan OTP.'}</p>
                  </div>
                </div>
                <Toggle on={!!user?.twoFactor} onClick={() => setTwoFactor(!user?.twoFactor)} />
              </div>
            </div>
          )}

          {tab === 'sessions' && (
            <div className="surface-card rounded-xl p-6 md:p-8 animate-fade-in">
              <h2 className="font-display text-title-md text-on-surface mb-1">Perangkat & Sesi</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">Perangkat yang pernah masuk ke akunmu. Keluarkan yang tidak dikenal.</p>
              <div className="flex flex-col gap-3">
                {(devices.length ? devices : [{ deviceId: 'cur', ua: 'Perangkat ini', current: true, lastActive: Date.now() }]).map((d, i) => (
                  <div key={d.deviceId} className="flex items-center gap-4 p-4 rounded-lg border border-white/10">
                    <span className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary-container"><Icon name="devices" size={20} /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-on-surface flex items-center gap-2">{d.ua} {(d.current || i === 0) && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success">Saat ini</span>}</p>
                      <p className="text-[12px] text-on-surface-variant">Aktif {new Date(d.lastActive || Date.now()).toLocaleString('id-ID')}</p>
                    </div>
                    {!(d.current || i === 0) && <button onClick={() => revokeDevice(d.deviceId)} className="btn-ghost px-4 py-2 text-[13px] text-error border-error/30">Keluarkan</button>}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-[12px] text-on-surface-variant"><Icon name="schedule" size={14} /> Sesi otomatis berakhir setelah 30 menit tidak aktif.</div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="surface-card rounded-xl p-6 md:p-8 animate-fade-in">
              <h2 className="font-display text-title-md text-on-surface mb-1">Notifikasi</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">Atur cara kami menghubungi kamu.</p>
              <div className="flex flex-col divide-y divide-white/10">
                {[{ key: 'platform', t: 'Update Platform', d: 'Model & fitur AI terbaru.' }, { key: 'security', t: 'Peringatan Keamanan', d: 'Aktivitas akun mencurigakan.' }, { key: 'weekly', t: 'Ringkasan Mingguan', d: 'Ringkasan penggunaan AI kamu.' }, { key: 'marketing', t: 'Promo', d: 'Penawaran & diskon sesekali.' }].map((n) => (
                  <div key={n.key} className="flex items-center justify-between gap-4 py-4">
                    <div><p className="text-body-md font-medium text-on-surface">{n.t}</p><p className="text-body-sm text-on-surface-variant">{n.d}</p></div>
                    <Toggle on={notif[n.key]} onClick={() => setNotif((s) => ({ ...s, [n.key]: !s[n.key] }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="surface-card rounded-xl p-6 md:p-8 animate-fade-in bg-gradient-to-br from-primary-container/5 to-transparent">
              <p className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Paket Saat Ini</p>
              <h2 className="font-display text-headline-md text-primary-container mb-2">Nexora Creator</h2>
              <p className="text-body-sm text-on-surface-variant mb-5">Ditagih tahunan · perpanjangan 15 Okt 2025.</p>
              <div className="flex gap-3"><Link to="/pricing" className="btn-primary px-5 py-2.5">Ubah Paket</Link><button onClick={() => toast('Portal tagihan dibuka', { icon: 'open_in_new' })} className="btn-ghost px-5 py-2.5">Kelola Tagihan</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block mb-4"><span className="block text-body-sm font-medium text-on-surface mb-2">{label}</span>{children}</label>
}
function Toggle({ on, onClick }) {
  return <button onClick={onClick} className={`relative w-12 h-6 rounded-full shrink-0 transition-colors ${on ? 'bg-primary-container' : 'bg-white/15'}`} aria-pressed={on}><span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-7' : 'left-1'}`} /></button>
}
