import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import AreaChart from '../components/AreaChart.jsx'
import { SectionHeading } from '../components/common.jsx'

const RANGES = {
  '7d': { revenue: [3.1, 4.2, 3.8, 5.1, 4.6, 6.2, 5.8], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  '30d': { revenue: [12, 18, 15, 22, 19, 26, 24, 31, 28, 35], labels: ['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 30'] },
  '90d': { revenue: [40, 52, 48, 61, 58, 72, 69, 84, 92, 88, 96, 110], labels: ['Aug', 'Sep', 'Oct'] },
}

const TOP_MODELS = [
  { id: 'nexus-vision-pro', name: 'Nexus Vision Pro', cat: 'Image Generation', rev: '$12k', delta: '+8%', up: true, art: ['#0b3a44', '#00e5ff'], icon: 'visibility' },
  { id: 'codeweaver-x', name: 'CodeWeaver X', cat: 'LLM · Coding', rev: '$8.4k', delta: '+2%', up: true, art: ['#10233a', '#3b82f6'], icon: 'code' },
  { id: 'chroma-studio-fx', name: 'Chroma Studio FX', cat: 'Generative Video', rev: '$4.1k', delta: '−1%', up: false, art: ['#231038', '#a855f7'], icon: 'movie' },
]

const PERFORMANCE = [
  { id: 'NV', name: 'Nexus Vision Pro', cat: 'Image Gen', views: '124,592', sales: 842, rev: '$20,208' },
  { id: 'CA', name: 'CodeWeaver X', cat: 'LLM', views: '89,210', sales: 521, rev: '$20,319' },
  { id: 'AG', name: 'Chroma Studio FX', cat: 'Video', views: '45,102', sales: 210, rev: '$10,290' },
  { id: 'DM', name: 'DataMind Core', cat: 'Analytics', views: '31,840', sales: 98, rev: '$8,722' },
]

export default function SellerDashboard() {
  const [range, setRange] = useState('30d')
  const data = RANGES[range]

  const stats = [
    { label: 'Total Earnings', value: '$24,592', delta: '+12.5%', up: true, sub: 'Across 4 active models', icon: 'payments' },
    { label: 'Active Subscribers', value: '1,204', delta: '+4.2%', up: true, sub: 'Monthly recurring', icon: 'group' },
    { label: 'API Requests', value: '842K', delta: '0.0%', up: null, sub: 'Last 30 days', icon: 'bolt' },
    { label: 'Avg. Rating', value: '4.92', delta: '+0.1', up: true, sub: 'From 2,180 reviews', icon: 'star' },
  ]

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface">Seller Dashboard</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Welcome back. Here's how your AI models are performing.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center rounded-full border border-white/10 p-1 bg-surface-container-lowest">
            {Object.keys(RANGES).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-label transition-all ${range === r ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Link to="/upload" className="btn-primary px-5 py-2.5"><Icon name="add" size={18} /> New Product</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="surface-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-primary-container">
                <Icon name={s.icon} size={18} fill={s.icon === 'star'} />
              </span>
              {s.delta && (
                <span className={`inline-flex items-center gap-0.5 text-[12px] font-medium px-2 py-0.5 rounded-full ${s.up === null ? 'text-on-surface-variant bg-white/5' : s.up ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
                  {s.up !== null && <Icon name={s.up ? 'trending_up' : 'trending_down'} size={14} />}
                  {s.delta}
                </span>
              )}
            </div>
            <p className="font-display text-[28px] leading-none text-on-surface mb-1">{s.value}</p>
            <p className="text-[13px] text-on-surface font-medium">{s.label}</p>
            <p className="text-[12px] text-on-surface-variant">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 mb-8">
        {/* Revenue chart */}
        <div className="surface-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-title-md text-on-surface">Revenue Trend</h2>
              <p className="text-body-sm text-on-surface-variant">Gross revenue over time</p>
            </div>
            <span className="inline-flex items-center gap-1 text-success text-body-sm bg-success/10 px-3 py-1 rounded-full">
              <Icon name="trending_up" size={16} /> +12.5%
            </span>
          </div>
          <AreaChart data={data.revenue} labels={data.labels} height={240} />
        </div>

        {/* Top models */}
        <div className="surface-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-title-md text-on-surface">Top Models</h2>
            <Link to="/explore" className="text-label-md font-label text-primary-container hover:text-primary">View all</Link>
          </div>
          <div className="flex flex-col gap-4">
            {TOP_MODELS.map((m) => (
              <Link key={m.id} to={`/model/${m.id}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <ModelArtwork seed={m.id} colors={m.art} icon={m.icon} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-on-surface truncate group-hover:text-primary-container transition-colors">{m.name}</p>
                  <p className="text-[12px] text-on-surface-variant truncate">{m.cat}</p>
                </div>
                <div className="text-right">
                  <p className="text-body-sm font-semibold text-on-surface">{m.rev}</p>
                  <p className={`text-[12px] ${m.up ? 'text-success' : 'text-error'}`}>{m.delta}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Product performance table */}
      <section>
        <SectionHeading
          title="Product Performance"
          className="mb-5"
          action={<Link to="/upload" className="btn-ghost px-5 py-2.5 self-start md:self-auto"><Icon name="upload" size={18} /> Upload</Link>}
        />
        <div className="surface-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b hairline text-[12px] uppercase tracking-wider text-on-surface-variant font-label">
                  <th className="px-6 py-4 font-medium">Model</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Views</th>
                  <th className="px-6 py-4 font-medium text-right">Sales</th>
                  <th className="px-6 py-4 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {PERFORMANCE.map((p) => (
                  <tr key={p.id} className="border-b hairline last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container text-[12px] font-bold">{p.id}</span>
                        <span className="text-body-sm font-medium text-on-surface">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{p.cat}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface text-right font-mono">{p.views}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface text-right font-mono">{p.sales}</td>
                    <td className="px-6 py-4 text-body-sm text-primary-container text-right font-mono font-medium">{p.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
