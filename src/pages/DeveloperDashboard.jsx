import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import AreaChart from '../components/AreaChart.jsx'
import { DashHeader, DashTabs, StatusPill } from '../components/DashboardKit.jsx'
import { useApp } from '../context/AppContext.jsx'

const ACCENT = '#a855f7'
const TABS = [
  { id: 'api', label: 'API & Akses', icon: 'api' },
  { id: 'docs', label: 'Dokumentasi', icon: 'description' },
  { id: 'versions', label: 'Versi', icon: 'versions' },
  { id: 'changelog', label: 'Changelog', icon: 'history' },
  { id: 'licenses', label: 'Lisensi', icon: 'license' },
  { id: 'analytics', label: 'Analitik', icon: 'monitoring' },
  { id: 'security', label: 'Keamanan', icon: 'shield' },
]

const VERSIONS = [
  { v: 'v2.4.0', date: '24 Okt 2025', status: 'published', note: 'Zero-shot style transfer + 8K output' },
  { v: 'v2.3.1', date: '02 Okt 2025', status: 'published', note: 'Perbaikan latensi 18%' },
  { v: 'v2.5.0-beta', date: '—', status: 'under_review', note: 'Multimodal audio (dalam review)' },
]
const SECURITY = [
  { label: 'Input divalidasi & disanitasi', ok: true },
  { label: 'Rate limiting di endpoint publik', ok: true },
  { label: 'Model bebas data PII training', ok: true },
  { label: 'Secrets disimpan di vault (bukan kode)', ok: true },
  { label: 'Audit dependensi (tanpa CVE kritis)', ok: false },
  { label: 'Penetration test terjadwal', ok: false },
]

export default function DeveloperDashboard() {
  const { user, toast } = useApp()
  const [tab, setTab] = useState('api')
  const [revealed, setRevealed] = useState(false)
  const apiKey = 'nx_live_' + (user?.id || 'xxxx').slice(-4) + '_8f3a9c21b7e64d05a1'
  const passed = SECURITY.filter((s) => s.ok).length

  const copyKey = () => { try { navigator.clipboard?.writeText(apiKey) } catch { /* ignore */ } toast('API key disalin', { icon: 'content_copy' }) }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <DashHeader accent={ACCENT} roleLabel="Developer Console" title={user?.store?.name || 'Developer Hub'} subtitle="Kelola integrasi, versi, dokumentasi & keamanan produk." icon="code"
        action={<button onClick={() => toast('Versi baru dikirim untuk review', { icon: 'rocket_launch' })} className="btn-primary px-5 py-2.5" style={{ background: ACCENT, color: '#fff' }}><Icon name="upload" size={18} /> Publish Versi</button>} />

      <DashTabs tabs={TABS} active={tab} onChange={setTab} accent={ACCENT} />

      {tab === 'api' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div className="surface-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display text-title-md text-on-surface">API Key</h2><span className="text-[12px] px-2 py-1 rounded-full" style={{ background: `${ACCENT}1a`, color: ACCENT }}>Production</span></div>
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-white/10 rounded-lg p-3 font-mono text-body-sm">
              <Icon name="key" size={18} className="text-on-surface-variant" />
              <span className="flex-1 truncate text-on-surface">{revealed ? apiKey : '•'.repeat(28)}</span>
              <button onClick={() => setRevealed((r) => !r)} className="text-on-surface-variant hover:text-on-surface p-1"><Icon name={revealed ? 'visibility_off' : 'visibility'} size={18} /></button>
              <button onClick={copyKey} className="text-on-surface-variant hover:text-on-surface p-1"><Icon name="content_copy" size={18} /></button>
            </div>
            <p className="text-[12px] text-on-surface-variant mt-3 flex items-center gap-1.5"><Icon name="error" size={14} className="text-secondary" /> Jangan pernah commit key ke repo publik. Rotasi berkala.</p>
          </div>
          <div className="surface-card rounded-xl p-6">
            <h3 className="font-display text-body-lg font-semibold text-on-surface mb-3">Quickstart</h3>
            <pre className="bg-surface-container-lowest border border-white/10 rounded-lg p-4 overflow-x-auto text-[13px] font-mono text-on-surface-variant leading-relaxed"><span className="text-success">curl</span> https://api.nexora.ai/v1/generate \{'\n'}  -H <span style={{ color: ACCENT }}>"Authorization: Bearer {revealed ? apiKey : 'nx_live_••••'}"</span> \{'\n'}  -d <span className="text-secondary">{'\'{"model":"nexus-vision-pro","prompt":"..."}\''}</span></pre>
          </div>
        </div>
      )}

      {tab === 'docs' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {[{ t: 'Getting Started', i: 'rocket_launch' }, { t: 'Authentication', i: 'key' }, { t: 'Endpoints', i: 'api' }, { t: 'Webhooks', i: 'bolt' }, { t: 'Rate Limits', i: 'speed' }, { t: 'SDKs', i: 'integration_instructions' }].map((d) => (
            <button key={d.t} onClick={() => toast(`Membuka dok: ${d.t}`, { icon: d.i })} className="surface-card rounded-xl p-5 text-left hover:border-white/25 transition-all flex items-start gap-3">
              <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}1a`, color: ACCENT }}><Icon name={d.i} size={20} /></span>
              <div><p className="font-semibold text-on-surface">{d.t}</p><p className="text-[12px] text-on-surface-variant">Panduan & contoh kode</p></div>
            </button>
          ))}
        </div>
      )}

      {tab === 'versions' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {VERSIONS.map((v) => (
            <div key={v.v} className="surface-card rounded-xl p-4 flex flex-wrap items-center gap-4">
              <span className="font-mono font-semibold text-on-surface px-2.5 py-1 rounded bg-white/5">{v.v}</span>
              <div className="flex-1 min-w-0"><p className="text-body-sm text-on-surface truncate">{v.note}</p><p className="text-[12px] text-outline">{v.date}</p></div>
              <StatusPill status={v.status} />
            </div>
          ))}
        </div>
      )}

      {tab === 'changelog' && (
        <div className="surface-card rounded-xl p-6 animate-fade-in">
          <div className="relative border-l border-white/10 ml-2 pl-6 flex flex-col gap-6">
            {VERSIONS.filter((v) => v.status === 'published').map((v) => (
              <div key={v.v} className="relative">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full" style={{ background: ACCENT }} />
                <p className="font-mono font-semibold text-on-surface">{v.v} <span className="text-[12px] text-outline font-sans ml-2">{v.date}</span></p>
                <p className="text-body-sm text-on-surface-variant mt-1">{v.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'licenses' && (
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
          {[{ t: 'Commercial', d: 'Hak pakai komersial penuh', n: '842 aktif' }, { t: 'Developer', d: 'Untuk integrasi & testing', n: '1,204 aktif' }, { t: 'Enterprise', d: 'On-prem + SLA khusus', n: '18 aktif' }, { t: 'Trial', d: '14 hari, fitur terbatas', n: '320 aktif' }].map((l) => (
            <div key={l.t} className="surface-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1"><Icon name="license" size={18} style={{ color: ACCENT }} /><p className="font-semibold text-on-surface">{l.t}</p></div>
              <p className="text-body-sm text-on-surface-variant mb-3">{l.d}</p>
              <p className="text-[12px] text-on-surface flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> {l.n}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[{ l: 'API Calls (30d)', v: '842K' }, { l: 'Latency p95', v: '412ms' }, { l: 'Error Rate', v: '0.04%' }, { l: 'Uptime', v: '99.99%' }].map((s) => (
              <div key={s.l} className="surface-card rounded-xl p-5"><p className="font-display text-headline-md text-on-surface leading-none">{s.v}</p><p className="text-[13px] text-on-surface-variant mt-1">{s.l}</p></div>
            ))}
          </div>
          <div className="surface-card rounded-xl p-6"><h2 className="font-display text-title-md text-on-surface mb-5">Volume Request</h2><AreaChart data={[40, 52, 48, 61, 58, 72, 69, 84, 92, 88]} stroke={ACCENT} labels={['', '', '', '', '']} height={220} /></div>
        </div>
      )}

      {tab === 'security' && (
        <div className="surface-card rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="font-display text-title-md text-on-surface">Security Checklist</h2><p className="text-body-sm text-on-surface-variant">Wajib lolos sebelum produk dipublikasikan.</p></div>
            <div className="text-right"><p className="font-display text-headline-md" style={{ color: passed === SECURITY.length ? '#7ee0a8' : ACCENT }}>{passed}/{SECURITY.length}</p><p className="text-[12px] text-on-surface-variant">lolos</p></div>
          </div>
          <div className="flex flex-col gap-2">
            {SECURITY.map((s) => (
              <div key={s.label} className={`flex items-center gap-3 p-3 rounded-lg border ${s.ok ? 'border-success/20 bg-success/5' : 'border-secondary/20 bg-secondary/5'}`}>
                <Icon name={s.ok ? 'check_circle' : 'error'} size={20} className={s.ok ? 'text-success' : 'text-secondary'} fill={s.ok} />
                <span className="text-body-sm text-on-surface flex-1">{s.label}</span>
                {!s.ok && <button className="text-[12px] font-label text-primary-container">Perbaiki</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
