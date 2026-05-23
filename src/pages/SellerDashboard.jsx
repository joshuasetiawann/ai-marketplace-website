import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import AreaChart from '../components/AreaChart.jsx'
import OtpInput from '../components/OtpInput.jsx'
import { DashHeader, DashTabs, StatusPill } from '../components/DashboardKit.jsx'
import { useApp } from '../context/AppContext.jsx'
import { TIERS } from '../data/models.js'
import { formatIDR, toIDR, USD_TO_IDR } from '../data/payment.js'
import { MIN_PAYOUT_USD } from '../data/db.js'
import { generateOtp } from '../data/security.js'

const ACCENT = '#e9c349'
const BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata', 'Bank Jago']
const TABS = [
  { id: 'overview', label: 'Ringkasan', icon: 'monitoring' },
  { id: 'products', label: 'Produk', icon: 'inventory_2' },
  { id: 'orders', label: 'Pesanan', icon: 'receipt_long' },
  { id: 'payouts', label: 'Payout', icon: 'payments' },
]

function rel(ts) {
  const diff = Date.now() - ts
  const day = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (day > 0) return `${day} hari lalu`
  if (h > 0) return `${h} jam lalu`
  if (m > 0) return `${m} menit lalu`
  return 'Baru saja'
}

export default function SellerDashboard() {
  const {
    user, sellerListings, sellerSales, sellerEarnings, payoutHistory, payoutAccount,
    updateProduct, setProductStatus, deleteProduct, requestPayout, savePayoutAccount,
  } = useApp()
  const [tab, setTab] = useState('overview')
  const [editing, setEditing] = useState(null)
  const [withdraw, setWithdraw] = useState(false)
  const [setupAccount, setSetupAccount] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const earnings = sellerEarnings || { gross: 0, fees: 0, net: 0, withdrawn: 0, available: 0, customers: 0, unitsSold: 0, salesCount: 0 }
  const ratedListings = sellerListings.filter((p) => p.rating > 0)
  const storeRating = ratedListings.length ? (ratedListings.reduce((n, p) => n + (p.rating || 0), 0) / ratedListings.length).toFixed(2) : '—'

  // weekly net-revenue buckets (in Rp '000) for the trend chart
  const rev = useMemo(() => {
    const weeks = 6
    const now = Date.now()
    const buckets = Array(weeks).fill(0)
    sellerSales.forEach((s) => {
      if (s.status !== 'paid') return
      const w = Math.floor((now - s.date) / (7 * 86400000))
      if (w >= 0 && w < weeks) buckets[weeks - 1 - w] += toIDR(s.net) / 1000
    })
    return buckets.map((v) => Math.round(v))
  }, [sellerSales])

  const verified = payoutAccount?.status === 'verified'

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <DashHeader
        accent={ACCENT}
        roleLabel="Seller Studio"
        title={user?.store?.name || 'Toko Saya'}
        subtitle="Kelola produk, pesanan, dan pendapatan AI kamu."
        action={<Link to="/upload" className="btn-primary px-5 py-2.5" style={{ background: ACCENT, color: '#241a00' }}><Icon name="add" size={18} /> Produk Baru</Link>}
        icon="storefront"
      />

      <DashTabs tabs={TABS} active={tab} onChange={setTab} accent={ACCENT} />

      {/* ── Overview ─────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Stat icon="account_balance_wallet" label="Pendapatan Bersih" value={formatIDR(toIDR(earnings.net))} hint="setelah fee platform" />
            <Stat icon="savings" label="Saldo Tersedia" value={formatIDR(toIDR(earnings.available))} hint="siap dicairkan" highlight />
            <Stat icon="shopping_bag" label="Produk Terjual" value={earnings.unitsSold.toLocaleString('id-ID')} hint={`${earnings.salesCount} transaksi`} />
            <Stat icon="group" label="Pelanggan" value={earnings.customers.toLocaleString('id-ID')} hint={`Rating toko ${storeRating}`} />
          </div>
          <div className="surface-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-title-md text-on-surface">Tren Pendapatan Bersih</h2>
              <span className="text-[12px] px-3 py-1 rounded-full" style={{ background: `${ACCENT}1a`, color: ACCENT }}>6 minggu</span>
            </div>
            <AreaChart data={rev.some((v) => v) ? rev : [0, 0, 0, 0, 0, 0]} stroke={ACCENT} labels={['Mgg-6', 'Mgg-5', 'Mgg-4', 'Mgg-3', 'Mgg-2', 'Kini']} height={220} />
            <p className="text-[12px] text-on-surface-variant mt-3">Nilai dalam ribuan Rupiah (Rp '000), bersih setelah potongan platform 20%.</p>
          </div>
        </div>
      )}

      {/* ── Products ─────────────────────────────────────────────── */}
      {tab === 'products' && (
        <div className="animate-fade-in">
          {sellerListings.length === 0 ? (
            <div className="surface-card rounded-xl p-10 text-center">
              <Icon name="inventory_2" size={32} className="text-outline mb-3" />
              <p className="text-on-surface-variant mb-4">Belum ada produk. Mulai jual model AI pertamamu.</p>
              <Link to="/upload" className="btn-primary px-6 py-3" style={{ background: ACCENT, color: '#241a00' }}><Icon name="add" size={18} /> Tambah Produk</Link>
            </div>
          ) : (
            <div className="surface-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead>
                    <tr className="border-b hairline text-[12px] uppercase tracking-wider text-on-surface-variant font-label">
                      <th className="px-6 py-4 font-medium">Produk</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Harga</th>
                      <th className="px-6 py-4 font-medium text-right">Terjual</th>
                      <th className="px-6 py-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerListings.map((p) => (
                      <tr key={p.id} className="border-b hairline last:border-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-lg overflow-hidden shrink-0"><ModelArtwork seed={p.id} colors={p.art || ['#2a1f05', ACCENT]} icon={p.icon} className="w-full h-full" /></span>
                            <div>
                              <Link to={`/model/${p.id}`} className="text-body-sm font-medium text-on-surface hover:text-primary-container">{p.name}</Link>
                              {p.kind === 'catalog' && <span className="ml-2 text-[10px] uppercase tracking-wide text-outline border border-white/10 rounded px-1.5 py-0.5">Katalog</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusPill status={p.status} /></td>
                        <td className="px-6 py-4 text-body-sm text-on-surface text-right font-mono">{p.price === 0 ? 'Gratis' : formatIDR(toIDR(p.price))}</td>
                        <td className="px-6 py-4 text-body-sm text-on-surface text-right font-mono">{p.sales}</td>
                        <td className="px-6 py-4">
                          {p.editable ? (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setEditing(p)} title="Edit" className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5"><Icon name="edit" size={17} /></button>
                              {p.status !== 'under_review' && (
                                <button onClick={() => setProductStatus(p.id, p.status === 'published' ? 'unpublished' : 'published')} title={p.status === 'published' ? 'Sembunyikan' : 'Tayangkan'} className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5">
                                  <Icon name={p.status === 'published' ? 'visibility_off' : 'visibility'} size={17} />
                                </button>
                              )}
                              <button onClick={() => setConfirmDelete(p)} title="Hapus" className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5"><Icon name="delete" size={17} /></button>
                            </div>
                          ) : (
                            <p className="text-right text-[12px] text-outline">Dikelola</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Orders (sales ledger) ────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="animate-fade-in">
          {sellerSales.length === 0 ? (
            <div className="surface-card rounded-xl p-10 text-center text-on-surface-variant"><Icon name="receipt_long" size={32} className="text-outline mb-2" /><p>Belum ada penjualan. Penjualan akan muncul di sini secara real-time.</p></div>
          ) : (
            <div className="flex flex-col gap-3">
              {sellerSales.slice(0, 40).map((s) => (
                <div key={s.id} className="surface-card rounded-xl p-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-on-surface truncate">{s.productName}</p>
                    <p className="text-[12px] text-on-surface-variant font-mono">{s.orderId} · {s.buyerName} · {rel(s.date)}{s.method ? ` · ${s.method}` : ''}</p>
                  </div>
                  <StatusPill status={s.status} />
                  <div className="text-right">
                    <p className="font-display text-body-lg text-success leading-none">+{formatIDR(toIDR(s.net))}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">bruto {formatIDR(toIDR(s.gross))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Payouts ──────────────────────────────────────────────── */}
      {tab === 'payouts' && (
        <div className="animate-fade-in flex flex-col gap-5">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
            <div className="surface-card rounded-xl p-6 flex flex-col" style={{ background: `linear-gradient(135deg, ${ACCENT}10, transparent)` }}>
              <p className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Saldo siap dicairkan</p>
              <p className="font-display text-display-md text-on-surface leading-none mb-1">{formatIDR(toIDR(earnings.available))}</p>
              <p className="text-[12px] text-on-surface-variant mb-5">Total bersih {formatIDR(toIDR(earnings.net))} · sudah dicairkan {formatIDR(toIDR(earnings.withdrawn))}</p>
              <button
                onClick={() => (verified ? setWithdraw(true) : setSetupAccount(true))}
                disabled={earnings.available < MIN_PAYOUT_USD}
                className="btn-primary px-6 py-3 self-start disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: ACCENT, color: '#241a00' }}
              >
                <Icon name="payments" size={18} /> Cairkan Dana
              </button>
              {earnings.available < MIN_PAYOUT_USD && <p className="text-[12px] text-on-surface-variant mt-2">Minimal pencairan {formatIDR(toIDR(MIN_PAYOUT_USD))}.</p>}
            </div>

            <div className="surface-card rounded-xl p-6">
              <h3 className="font-display text-body-lg font-semibold text-on-surface mb-4">Rekening Payout</h3>
              {verified ? (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10">
                  <span className="w-11 h-10 rounded bg-[#0066b3] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{payoutAccount.bank?.slice(0, 6)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm text-on-surface truncate">{payoutAccount.bank} · {payoutAccount.account}</p>
                    <p className="text-[12px] text-success flex items-center gap-1"><Icon name="verified" size={13} fill /> Terverifikasi</p>
                  </div>
                  <button onClick={() => setSetupAccount(true)} className="text-label-md font-label text-primary-container shrink-0">Ubah</button>
                </div>
              ) : (
                <div className="text-center py-3">
                  <Icon name="account_balance" size={28} className="text-outline mb-2" />
                  <p className="text-body-sm text-on-surface-variant mb-3">Belum ada rekening payout. Tambahkan rekening untuk mulai mencairkan dana dengan aman.</p>
                  <button onClick={() => setSetupAccount(true)} className="btn-soft px-5 py-2.5"><Icon name="add" size={16} /> Tambah Rekening</button>
                </div>
              )}
              <div className="mt-4 pt-4 border-t hairline grid grid-cols-2 gap-3 text-[12px]">
                <div><p className="text-on-surface-variant">Bruto</p><p className="text-on-surface font-medium">{formatIDR(toIDR(earnings.gross))}</p></div>
                <div><p className="text-on-surface-variant">Fee platform (20%)</p><p className="text-on-surface font-medium">−{formatIDR(toIDR(earnings.fees))}</p></div>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b hairline"><h3 className="font-display text-body-lg font-semibold text-on-surface">Riwayat Pencairan</h3></div>
            {payoutHistory.length === 0 ? (
              <p className="px-6 py-8 text-center text-body-sm text-on-surface-variant">Belum ada pencairan.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {payoutHistory.map((p) => (
                  <div key={p.id} className="px-6 py-4 flex flex-wrap items-center gap-4">
                    <span className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant shrink-0"><Icon name="north_east" size={18} /></span>
                    <div className="flex-1 min-w-0"><p className="text-body-sm font-medium text-on-surface">{p.bank} · {p.account}</p><p className="text-[12px] text-on-surface-variant font-mono">{p.id} · {rel(p.requestedAt)}</p></div>
                    <StatusPill status={p.status} />
                    <span className="font-display text-body-lg text-on-surface">{formatIDR(p.amountIDR || toIDR(p.amountUSD))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editing && <EditProductModal product={editing} onClose={() => setEditing(null)} onSave={updateProduct} />}
      {withdraw && <WithdrawModal availableUSD={earnings.available} account={payoutAccount} twoFactor={user?.twoFactor} onClose={() => setWithdraw(false)} onConfirm={requestPayout} />}
      {setupAccount && <PayoutSetupModal defaultName={user?.name} current={payoutAccount} onClose={() => setSetupAccount(false)} onSave={savePayoutAccount} />}
      {confirmDelete && (
        <ConfirmModal
          title="Hapus produk?"
          message={<>Produk <b className="text-on-surface">{confirmDelete.name}</b> akan dihapus permanen dari toko kamu. Tindakan ini tidak bisa dibatalkan.</>}
          confirmLabel="Hapus Permanen"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { deleteProduct(confirmDelete.id); setConfirmDelete(null) }}
        />
      )}
    </div>
  )
}

function Stat({ icon, label, value, hint, highlight }) {
  return (
    <div className="surface-card rounded-xl p-5" style={highlight ? { borderColor: `${ACCENT}55` } : undefined}>
      <span className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${ACCENT}1a`, color: ACCENT }}><Icon name={icon} size={18} /></span>
      <p className="font-display text-[24px] leading-none text-on-surface mb-1">{value}</p>
      <p className="text-[13px] text-on-surface">{label}</p>
      {hint && <p className="text-[11px] text-on-surface-variant mt-0.5">{hint}</p>}
    </div>
  )
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, icon }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast" onClick={onClose} />
      <div className="relative w-full sm:max-w-md surface-card rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-title-md text-on-surface flex items-center gap-2">{icon && <Icon name={icon} size={20} className="text-primary-container" />}{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/5 text-on-surface-variant"><Icon name="close" size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function EditProductModal({ product, onClose, onSave }) {
  const [name, setName] = useState(product.name)
  const [priceIDR, setPriceIDR] = useState(String(toIDR(product.price)))
  const [tier, setTier] = useState(product.tier || 'Pro')
  const [err, setErr] = useState('')

  const save = () => {
    if (!name.trim()) { setErr('Nama produk wajib diisi'); return }
    const idr = Number(String(priceIDR).replace(/\D/g, '')) || 0
    const price = Math.round((idr / USD_TO_IDR) * 100) / 100
    onSave(product.id, { name: name.trim(), price, tier })
    onClose()
  }

  return (
    <Modal title="Edit Produk" icon="edit" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="block"><span className="block text-body-sm font-medium text-on-surface mb-2">Nama Produk</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" /></label>
        <label className="block"><span className="block text-body-sm font-medium text-on-surface mb-2">Harga / bulan (Rp)</span>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-body-sm">Rp</span>
            <input inputMode="numeric" value={priceIDR} onChange={(e) => setPriceIDR(e.target.value)} placeholder="0" className="input-field pl-10" /></div>
          <span className="text-[12px] text-on-surface-variant mt-1 block">Set 0 untuk produk gratis.</span></label>
        <div><span className="block text-body-sm font-medium text-on-surface mb-2">Paket</span>
          <div className="flex gap-2">{TIERS.map((t) => (
            <button key={t} onClick={() => setTier(t)} className={`flex-1 py-2.5 rounded-lg border text-body-sm transition-all ${tier === t ? 'border-primary-container bg-primary-container/10 text-primary-container' : 'border-white/10 text-on-surface-variant hover:border-white/30'}`}>{t === 'Free' ? 'Gratis' : t}</button>
          ))}</div></div>
        {err && <p className="text-error text-body-sm">{err}</p>}
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="btn-ghost flex-1 py-3">Batal</button>
          <button onClick={save} className="btn-primary flex-1 py-3"><Icon name="check" size={18} /> Simpan</button>
        </div>
      </div>
    </Modal>
  )
}

function PayoutSetupModal({ defaultName, current, onClose, onSave }) {
  const [bank, setBank] = useState(current?.bank || 'BCA')
  const [account, setAccount] = useState('')
  const [holder, setHolder] = useState(defaultName || '')
  const [err, setErr] = useState('')

  const save = () => {
    if (account.replace(/\D/g, '').length < 8) { setErr('Nomor rekening minimal 8 digit'); return }
    if (!holder.trim()) { setErr('Nama pemilik rekening wajib diisi'); return }
    onSave({ bank, account })
    onClose()
  }

  return (
    <Modal title="Rekening Payout" icon="account_balance" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary-container/5 border border-primary-container/15">
          <Icon name="shield" size={18} className="text-primary-container shrink-0 mt-0.5" />
          <p className="text-[12px] text-on-surface-variant">Demi keamanan, rekening harus atas nama yang sama dengan pemilik akun. Pencairan hanya dikirim ke rekening terverifikasi.</p>
        </div>
        <label className="block"><span className="block text-body-sm font-medium text-on-surface mb-2">Bank</span>
          <div className="relative"><select value={bank} onChange={(e) => setBank(e.target.value)} className="input-field appearance-none pr-10 cursor-pointer">
            {BANKS.map((b) => <option key={b} value={b} className="bg-surface-container">{b}</option>)}
          </select><Icon name="expand_more" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" /></div></label>
        <label className="block"><span className="block text-body-sm font-medium text-on-surface mb-2">Nomor Rekening</span>
          <input inputMode="numeric" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="cth. 1234567890" className="input-field font-mono" /></label>
        <label className="block"><span className="block text-body-sm font-medium text-on-surface mb-2">Nama Pemilik Rekening</span>
          <input value={holder} onChange={(e) => setHolder(e.target.value)} className="input-field" /></label>
        {err && <p className="text-error text-body-sm">{err}</p>}
        <button onClick={save} className="btn-primary py-3 mt-2"><Icon name="verified_user" size={18} /> Verifikasi & Simpan</button>
      </div>
    </Modal>
  )
}

function WithdrawModal({ availableUSD, account, twoFactor, onClose, onConfirm }) {
  const availIDR = toIDR(availableUSD)
  const [amount, setAmount] = useState(String(availIDR))
  const [step, setStep] = useState('amount') // amount | verify
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')

  const idr = Number(String(amount).replace(/\D/g, '')) || 0
  const usd = idr / USD_TO_IDR

  const submit = () => {
    if (usd < MIN_PAYOUT_USD) { setErr(`Minimal ${formatIDR(toIDR(MIN_PAYOUT_USD))}`); return }
    if (idr > availIDR) { setErr('Melebihi saldo tersedia'); return }
    setErr('')
    if (twoFactor) { setCode(generateOtp()); setStep('verify') }
    else finish()
  }
  const finish = () => {
    const res = onConfirm(Math.round(usd * 100) / 100, idr)
    if (!res?.error) onClose()
    else setErr(res.error)
  }

  return (
    <Modal title="Cairkan Dana" icon="payments" onClose={onClose}>
      {step === 'amount' ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-surface-container-lowest border border-white/10 p-4">
            <p className="text-[12px] text-on-surface-variant">Saldo tersedia</p>
            <p className="font-display text-title-md text-on-surface">{formatIDR(availIDR)}</p>
          </div>
          <label className="block"><span className="block text-body-sm font-medium text-on-surface mb-2">Jumlah pencairan (Rp)</span>
            <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-body-sm">Rp</span>
              <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field pl-10 font-mono text-title-md" /></div>
            <button onClick={() => setAmount(String(availIDR))} className="text-[12px] text-primary-container mt-1.5">Cairkan semua</button>
          </label>
          {account && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
              <Icon name="account_balance" size={20} className="text-on-surface-variant" />
              <div className="flex-1"><p className="text-body-sm text-on-surface">{account.bank} · {account.account}</p><p className="text-[12px] text-success flex items-center gap-1"><Icon name="verified" size={12} fill /> Terverifikasi</p></div>
            </div>
          )}
          {err && <p className="text-error text-body-sm">{err}</p>}
          <button onClick={submit} className="btn-primary py-3.5"><Icon name="lock" size={18} /> Lanjutkan</button>
          <p className="text-center text-[12px] text-on-surface-variant flex items-center justify-center gap-1.5"><Icon name="schedule" size={13} /> Dana masuk 1–2 hari kerja</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-on-surface-variant text-center">Konfirmasi pencairan <b className="text-on-surface">{formatIDR(idr)}</b> dengan kode verifikasi 2FA kamu.</p>
          <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-3 text-center">
            <p className="text-[12px] text-on-surface-variant">Kode demo (biasanya dikirim via authenticator)</p>
            <p className="font-mono text-title-md text-secondary tracking-[0.3em]">{code}</p>
          </div>
          <OtpInput onComplete={(v) => { if (v === code) finish(); else setErr('Kode salah, coba lagi') }} />
          {err && <p className="text-error text-body-sm text-center">{err}</p>}
          <button onClick={() => setStep('amount')} className="btn-ghost py-2.5 text-body-sm">Kembali</button>
        </div>
      )}
    </Modal>
  )
}

function ConfirmModal({ title, message, confirmLabel, danger, onCancel, onConfirm }) {
  return (
    <Modal title={title} icon={danger ? 'warning' : 'help'} onClose={onCancel}>
      <p className="text-body-md text-on-surface-variant mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-ghost flex-1 py-3">Batal</button>
        <button onClick={onConfirm} className={`flex-1 py-3 rounded-full font-label inline-flex items-center justify-center gap-2 ${danger ? 'bg-error text-white' : 'btn-primary'}`}>
          {danger && <Icon name="delete" size={18} />}{confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
