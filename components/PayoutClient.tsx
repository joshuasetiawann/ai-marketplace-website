"use client";

import { useState, useActionState } from "react";
import Icon from "./Icon";
import { savePayoutAccount, requestPayout, type PayoutState } from "@/lib/actions/payouts";
import { VA_BANKS } from "@/lib/payments";
import { MIN_PAYOUT_USD } from "@/lib/economics";
import { toIDR, formatIDR } from "@/lib/pricing";

export default function PayoutClient({
  bank,
  accountMasked,
  verified,
  available,
}: {
  bank: string | null;
  accountMasked: string | null;
  verified: boolean;
  available: number;
}) {
  const [editing, setEditing] = useState(!verified);
  const [acctState, acctAction, acctPending] = useActionState(savePayoutAccount, {} as PayoutState);
  const [payState, payAction, payPending] = useActionState(requestPayout, {} as PayoutState);
  const [amount, setAmount] = useState(available);

  const canRequest = verified && available >= MIN_PAYOUT_USD;

  return (
    <div className="flex flex-col gap-6">
      {/* Payout account */}
      <section className="rounded-xl surface-card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-display text-body-lg font-semibold text-on-surface">
          <Icon name="account_balance" size={20} className="text-primary-container" /> Rekening Pencairan
        </h3>

        {verified && !editing ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-md text-on-surface">
                {bank} <span className="font-mono text-on-surface-variant">{accountMasked}</span>
              </p>
              <span className="inline-flex items-center gap-1 text-[12px] text-success">
                <Icon name="verified" size={13} fill /> Terverifikasi
              </span>
            </div>
            <button onClick={() => setEditing(true)} className="btn-soft px-4 py-2 text-body-sm">
              Ubah
            </button>
          </div>
        ) : (
          <form action={acctAction} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-2 block text-body-sm font-medium text-on-surface">Bank</span>
              <select name="bank" defaultValue={bank ?? ""} className="input-field cursor-pointer appearance-none">
                <option value="" className="bg-surface-container">Pilih bank…</option>
                {VA_BANKS.map((b) => (
                  <option key={b.id} value={b.short} className="bg-surface-container">{b.short}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-body-sm font-medium text-on-surface">Nomor Rekening</span>
              <input name="account" inputMode="numeric" placeholder="cth. 1234567890" className="input-field" />
            </label>
            {acctState.error && <p className="text-body-sm text-error">{acctState.error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={acctPending} className="btn-primary px-6 py-2.5">
                {acctPending ? "Menyimpan…" : "Simpan rekening"}
              </button>
              {verified && (
                <button type="button" onClick={() => setEditing(false)} className="btn-soft px-5 py-2.5">
                  Batal
                </button>
              )}
            </div>
          </form>
        )}
        {acctState.ok && <p className="mt-3 text-body-sm text-success">Rekening tersimpan & terverifikasi.</p>}
      </section>

      {/* Request payout */}
      <section className="rounded-xl surface-card p-6">
        <h3 className="mb-1 flex items-center gap-2 font-display text-body-lg font-semibold text-on-surface">
          <Icon name="account_balance_wallet" size={20} className="text-primary-container" /> Cairkan Dana
        </h3>
        <p className="mb-4 text-body-sm text-on-surface-variant">
          Saldo tersedia: <span className="font-semibold text-on-surface">{formatIDR(toIDR(available))}</span> · minimal{" "}
          {formatIDR(toIDR(MIN_PAYOUT_USD))}
        </p>
        <form action={payAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mb-2 block text-body-sm font-medium text-on-surface">Jumlah (USD)</span>
            {/* step must admit cents: `available` is a rounded-to-2dp balance, so
                step="1" made the browser reject the field's own default value and
                block submit for every seller whose balance was not a whole USD. */}
            <input
              name="amount"
              type="number"
              min={MIN_PAYOUT_USD}
              max={available}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input-field"
            />
          </label>
          <button type="submit" disabled={!canRequest || payPending} className="btn-primary px-6 py-3">
            <Icon name="send" size={18} /> {payPending ? "Memproses…" : "Cairkan"}
          </button>
        </form>
        {!verified && <p className="mt-3 text-[12px] text-on-surface-variant">Tambahkan rekening terverifikasi dulu.</p>}
        {payState.error && <p className="mt-3 text-body-sm text-error">{payState.error}</p>}
        {payState.ok && <p className="mt-3 text-body-sm text-success">Permintaan pencairan dikirim & sedang diproses.</p>}
      </section>
    </div>
  );
}
