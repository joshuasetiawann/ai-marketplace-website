"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { refundOrder } from "@/lib/actions/admin";

export default function AdminOrderActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  // Refund moves money, reverses the sellers' revenue and revokes the buyer's
  // download entitlement — and refund_order() only accepts an order still in
  // 'paid', so there is no way back from a misclick.
  const act = () => {
    if (!confirm("Refund pesanan ini? Akses unduhan pembeli dicabut dan pendapatan penjual dikurangi. Tidak bisa dibatalkan.")) return;
    start(async () => {
      setErr("");
      const res = await refundOrder(id);
      if (res?.error) setErr(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {err && (
        <span role="alert" className="text-[12px] text-error">
          {err}
        </span>
      )}
      <button
        onClick={act}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg bg-error/10 px-3 py-1.5 text-body-sm text-error hover:bg-error/20 disabled:opacity-60"
      >
        <Icon name="undo" size={16} /> Refund
      </button>
    </div>
  );
}
