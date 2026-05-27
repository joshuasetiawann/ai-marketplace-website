import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { DashHeader, DashTabs, StatusPill } from '../components/DashboardKit.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getUploadedProducts, saveUploadedProducts, getUsers } from '../data/db.js'

const ACCENT = '#7ee0a8'
const TABS = [
  { id: 'queue', label: 'Antrian Review', icon: 'fact_check' },
  { id: 'reports', label: 'Laporan', icon: 'flag' },
  { id: 'users', label: 'Pengguna', icon: 'group' },
]
const SEED_QUEUE = [
  { id: 'sub-1', name: 'NeoRender XL', owner: 'PixelForge', category: 'vision', art: ['#1a1030', '#a855f7'], icon: 'visibility', status: 'under_review' },
  { id: 'sub-2', name: 'VoiceClone Pro', owner: 'EchoLabs', category: 'audio', art: ['#1a2f0f', '#84cc16'], icon: 'record_voice_over', status: 'under_review' },
]
const REPORTS = [
  { id: 'r1', product: 'FastGAN Cheap', reason: 'Diduga model palsu / plagiat', reporter: 'user_1182', severity: 'high' },
  { id: 'r2', product: 'AudioMax', reason: 'Deskripsi menyesatkan', reporter: 'user_9931', severity: 'medium' },
]

export default function Admin() {
  const { toast } = useApp()
  const [tab, setTab] = useState('queue')
  const [queue, setQueue] = useState(() => [...getUploadedProducts().filter((p) => p.status === 'under_review'), ...SEED_QUEUE])
  const users = Object.values(getUsers())

  const decide = (item, decision) => {
    setQueue((q) => q.filter((x) => x.id !== item.id))
    // persist decision for real uploaded products
    const all = getUploadedProducts()
    const idx = all.findIndex((p) => p.id === item.id)
    if (idx >= 0) { all[idx].status = decision === 'approve' ? 'published' : 'rejected'; saveUploadedProducts(all) }
    toast(decision === 'approve' ? `${item.name} disetujui & tayang` : `${item.name} ditolak`, { icon: decision === 'approve' ? 'check_circle' : 'cancel' })
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <DashHeader accent={ACCENT} roleLabel="Admin Console" title="Moderasi Platform" subtitle="Tinjau produk, tangani laporan, dan jaga kualitas marketplace." icon="shield_person" />
      <DashTabs tabs={TABS} active={tab} onChange={setTab} accent={ACCENT} />

      {tab === 'queue' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {queue.length === 0 && <div className="surface-card rounded-xl p-10 text-center text-on-surface-variant"><Icon name="check_circle" size={32} className="text-success mb-2" fill /><p>Antrian bersih — tidak ada yang perlu ditinjau.</p></div>}
          {queue.map((p) => (
            <div key={p.id} className="surface-card rounded-xl p-4 flex flex-wrap items-center gap-4">
              <span className="w-12 h-12 rounded-lg overflow-hidden shrink-0"><ModelArtwork seed={p.id} colors={p.art || ['#072a1f', ACCENT]} icon={p.icon} className="w-full h-full" /></span>
              <div className="flex-1 min-w-0"><p className="font-semibold text-on-surface">{p.name}</p><p className="text-[12px] text-on-surface-variant">oleh {p.owner || p.ownerName || 'Seller'} · {p.category}</p></div>
              <StatusPill status="under_review" />
              <div className="flex gap-2">
                <button onClick={() => decide(p, 'reject')} className="btn-ghost px-4 py-2 text-error border-error/30"><Icon name="cancel" size={16} /> Tolak</button>
                <button onClick={() => decide(p, 'approve')} className="btn-primary px-4 py-2" style={{ background: ACCENT, color: '#04150c' }}><Icon name="check" size={16} /> Setujui</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {REPORTS.map((r) => (
            <div key={r.id} className="surface-card rounded-xl p-4 flex flex-wrap items-center gap-4">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${r.severity === 'high' ? 'bg-error/15 text-error' : 'bg-secondary/15 text-secondary'}`}><Icon name="flag" size={20} /></span>
              <div className="flex-1 min-w-0"><p className="font-semibold text-on-surface">{r.product}</p><p className="text-[13px] text-on-surface-variant">{r.reason} · dilaporkan {r.reporter}</p></div>
              <span className={`text-[11px] px-2 py-1 rounded-full ${r.severity === 'high' ? 'text-error bg-error/10' : 'text-secondary bg-secondary/10'}`}>{r.severity === 'high' ? 'Prioritas tinggi' : 'Sedang'}</span>
              <button className="btn-soft px-4 py-2 text-[13px]">Tinjau</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="surface-card rounded-xl overflow-hidden animate-fade-in">
          <table className="w-full text-left">
            <thead><tr className="border-b hairline text-[12px] uppercase tracking-wider text-on-surface-variant font-label"><th className="px-6 py-4 font-medium">Pengguna</th><th className="px-6 py-4 font-medium">Role</th><th className="px-6 py-4 font-medium">Status</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hairline last:border-0">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-on-primary-container text-[12px] font-bold">{u.name.charAt(0)}</span><div><p className="text-body-sm text-on-surface">{u.name}</p><p className="text-[12px] text-on-surface-variant">{u.email}</p></div></div></td>
                  <td className="px-6 py-4 text-body-sm text-on-surface-variant capitalize">{u.role}</td>
                  <td className="px-6 py-4"><StatusPill status={u.verified ? 'active' : 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
