import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import QrisCode from '../components/QrisCode.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useCountdown } from '../hooks/useCountdown.js'
import { getPending, setPending, clearPending, VA_BANKS, EWALLETS, formatIDR } from '../data/payment.js'

export default function Payment() {
  const navigate = useNavigate()
  const { user, placeOrder, toast } = useApp()
  const [pending, setLocal] = useState(() => getPending(user?.id))
  const [copied, setCopied] = useState(false)
  const { label, expired } = useCountdown(pending?.expiresAt)

  // flip to expired state when the timer runs out
  useEffect(() => {
    if (pending && pending.status === 'pending' && expired) {
      const next = { ...pending, status: 'expired' }
      setPending(user?.id, next)
      setLocal(next)
    }
  }, [expired, pending, user])

  if (!pending) {
    return (
      <div className="max-w-md mx-auto px-margin-mobile py-24 text-center">
        <Icon name="receipt_long" size={44} className="text-outline mb-4" />
        <h1 className="font-display text-headline-md mb-3">Tidak ada pembayaran aktif</h1>
        <Link to="/explore" className="btn-primary px-6 py-3 mt-2">Mulai belanja</Link>
      </div>
    )
  }

  const bank = VA_BANKS.find((b) => b.id === pending.bank)
  const wallet = EWALLETS.find((w) => w.id === pending.ewallet)

  const markPaid = () => {
    const order = {
      id: pending.id,
      date: Date.now(),
      status: 'paid',
      method: pending.method === 'va' ? bank?.short : pending.method === 'ewallet' ? wallet?.name : 'QRIS',
      total: pending.amountUSD,
      totalIDR: pending.amountIDR,
      items: pending.items,
    }
    placeOrder(order)
    const next = { ...pending, status: 'paid' }
    setPending(user?.id, next)
    setLocal(next)
    toast('Pembayaran berhasil!', { icon: 'check' })
  }

  const cancel = () => { clearPending(user?.id); navigate('/cart') }
  const retry = () => { clearPending(user?.id); navigate('/checkout') }
  const copyVa = () => {
    try { navigator.clipboard?.writeText(pending.vaNumber) } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (pending.status === 'paid') {
    return (
      <div className="max-w-lg mx-auto px-margin-mobile py-16 text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-success/25 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center"><Icon name="check" size={40} className="text-success" /></div>
        </div>
        <p className="font-label text-label-sm uppercase tracking-widest text-success mb-2">Pembayaran Berhasil</p>
        <h1 className="font-display text-headline-md text-on-surface mb-2">Terima kasih, {pending.contact.name?.split(' ')[0]}! 🎉</h1>
        <p className="text-body-md text-on-surface-variant mb-1">Pesananmu sudah aktif & produk bisa langsung diakses.</p>
        <p className="font-mono text-body-sm text-primary-container mb-6">Order {pending.id} · {formatIDR(pending.amountIDR)}</p>

        <div className="surface-card rounded-xl p-4 text-left mb-6">
          {pending.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"><ModelArtwork seed={it.id} colors={it.art} icon={it.icon} className="w-full h-full" /></div>
              <span className="flex-1 text-body-sm text-on-surface truncate">{it.name}</span>
              <Link to={`/model/${it.id}`} className="btn-soft px-3 py-1.5 text-[12px]"><Icon name="lock_open" size={14} /> Akses</Link>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" onClick={() => clearPending(user?.id)} className="btn-primary px-6 py-3"><Icon name="dashboard" size={18} /> Ke Dashboard</Link>
          <Link to="/orders" onClick={() => clearPending(user?.id)} className="btn-ghost px-6 py-3"><Icon name="receipt_long" size={18} /> Lihat Pesanan</Link>
        </div>
      </div>
    )
  }

  // ── EXPIRED / FAILED ──────────────────────────────────────────────────────
  if (pending.status === 'expired') {
    return (
      <div className="max-w-md mx-auto px-margin-mobile py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-error/15 border border-error/30 flex items-center justify-center mb-6"><Icon name="timer_off" size={38} className="text-error" /></div>
        <p className="font-label text-label-sm uppercase tracking-widest text-error mb-2">Pembayaran Kedaluwarsa</p>
        <h1 className="font-display text-headline-md text-on-surface mb-3">Waktu pembayaran habis</h1>
        <p className="text-body-md text-on-surface-variant mb-8">Batas waktu pembayaran sudah lewat dan pesanan dibatalkan otomatis. Tenang, kamu belum ditagih.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={retry} className="btn-primary px-6 py-3"><Icon name="restart_alt" size={18} /> Coba Bayar Lagi</button>
          <Link to="/cart" onClick={() => clearPending(user?.id)} className="btn-ghost px-6 py-3">Kembali ke Keranjang</Link>
        </div>
      </div>
    )
  }

  // ── PENDING ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
      {/* status banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 surface-card rounded-xl px-5 py-4 mb-6 border-secondary/30">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-60" /><span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" /></span>
          <div>
            <p className="font-semibold text-on-surface">Menunggu Pembayaran</p>
            <p className="text-[12px] text-on-surface-variant font-mono">Order {pending.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-2 rounded-lg">
          <Icon name="schedule" size={18} />
          <span className="font-mono font-semibold tabular-nums">{label}</span>
          <span className="text-[12px] opacity-80">tersisa</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-start">
        <div className="surface-card rounded-xl p-6">
          {/* QRIS */}
          {pending.method === 'qris' && (
            <div className="text-center">
              <h2 className="font-display text-title-md text-on-surface mb-1">Bayar dengan QRIS</h2>
              <p className="text-body-sm text-on-surface-variant mb-5">Scan QR ini dari aplikasi e-wallet atau m-banking apa pun.</p>
              <div className="flex justify-center mb-5"><QrisCode seed={pending.id} /></div>
              <p className="text-on-surface-variant text-body-sm">Total tagihan</p>
              <p className="font-display text-headline-md text-primary-container mb-4">{formatIDR(pending.amountIDR)}</p>
              <ol className="text-left text-body-sm text-on-surface-variant space-y-2 max-w-sm mx-auto">
                {['Buka GoPay / OVO / DANA / m-banking', 'Pilih menu "Scan QR" lalu arahkan ke kode di atas', 'Pastikan nominal sesuai, lalu konfirmasi', 'Selesaikan sebelum waktu habis'].map((s, i) => (
                  <li key={i} className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary-container/15 text-primary-container text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Virtual Account */}
          {pending.method === 'va' && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: bank?.color }}>{bank?.short}</span>
                <div><h2 className="font-display text-title-md text-on-surface leading-tight">{bank?.name}</h2><p className="text-body-sm text-on-surface-variant">Transfer ke Virtual Account di bawah</p></div>
              </div>
              <div className="rounded-lg border border-white/10 bg-surface-container-lowest p-4 mb-4">
                <p className="text-[12px] text-on-surface-variant mb-1">Nomor Virtual Account</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-headline-md text-on-surface tracking-wider tabular-nums break-all">{pending.vaNumber}</span>
                  <button onClick={copyVa} className={`btn-soft px-3 py-2 text-[12px] shrink-0 ${copied ? 'text-success border-success/40' : ''}`}><Icon name={copied ? 'check' : 'content_copy'} size={15} /> {copied ? 'Tersalin' : 'Salin Nomor VA'}</button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-container-lowest border border-white/10 p-4 mb-5">
                <span className="text-body-sm text-on-surface-variant">Total tagihan</span>
                <span className="font-display text-title-md text-primary-container">{formatIDR(pending.amountIDR)}</span>
              </div>
              <p className="font-semibold text-on-surface text-body-sm mb-2">Cara bayar (m-banking / ATM):</p>
              <ol className="text-body-sm text-on-surface-variant space-y-2">
                {[`Masuk menu Transfer → Virtual Account ${bank?.short}`, 'Masukkan nomor VA di atas', 'Pastikan nama & nominal sesuai', 'Konfirmasi & selesaikan transaksi'].map((s, i) => (
                  <li key={i} className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary-container/15 text-primary-container text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {/* E-wallet */}
          {pending.method === 'ewallet' && (
            <div className="text-center">
              <span className="inline-flex w-14 h-14 rounded-full items-center justify-center text-white font-bold mb-3" style={{ background: wallet?.color }}>{wallet?.name.slice(0, 2)}</span>
              <h2 className="font-display text-title-md text-on-surface mb-1">Bayar dengan {wallet?.name}</h2>
              <p className="text-body-sm text-on-surface-variant mb-5">Kami sudah mengirim permintaan pembayaran ke aplikasi {wallet?.name} kamu.</p>
              <div className="rounded-lg border border-white/10 bg-surface-container-lowest p-5 mb-4">
                <p className="text-on-surface-variant text-body-sm">Total tagihan</p>
                <p className="font-display text-headline-md text-primary-container">{formatIDR(pending.amountIDR)}</p>
              </div>
              <p className="text-body-sm text-on-surface-variant">Buka aplikasi {wallet?.name} → notifikasi pembayaran → konfirmasi PIN.</p>
            </div>
          )}
        </div>

        {/* actions / help */}
        <div className="flex flex-col gap-4 md:sticky md:top-24">
          <div className="surface-card rounded-xl p-5">
            <p className="text-body-sm text-on-surface-variant mb-4">Setelah membayar, status akan otomatis terverifikasi. Di prototipe ini, gunakan tombol simulasi:</p>
            <button onClick={markPaid} className="btn-primary w-full py-3 mb-2"><Icon name="check_circle" size={18} /> Simulasikan Pembayaran Berhasil</button>
            <button onClick={cancel} className="btn-ghost w-full py-3">Batalkan Pesanan</button>
          </div>
          <div className="surface-card rounded-xl p-5">
            <div className="flex items-center gap-2 text-on-surface mb-2"><Icon name="verified_user" size={18} className="text-primary-container" /><span className="font-semibold text-body-sm">Transaksi aman</span></div>
            <p className="text-[12px] text-on-surface-variant">Nomor VA & QR unik per transaksi dan kedaluwarsa otomatis. Nexora tidak pernah menyimpan PIN/OTP kamu.</p>
          </div>
          <Link to="/help" className="text-center text-body-sm text-primary-container hover:text-primary">Butuh bantuan pembayaran?</Link>
        </div>
      </div>
    </div>
  )
}
