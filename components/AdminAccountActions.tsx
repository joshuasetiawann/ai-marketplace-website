"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { setPayoutAccountStatus } from "@/lib/actions/admin";

/** Approve / reject a seller's payout account before any money can reach it. */
export default function AdminAccountActions({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  const run = (action: "approve" | "reject") =>
    start(async () => {
      setErr("");
      const res = await setPayoutAccountStatus(ownerId, action);
      if (res?.error) setErr(res.error);
      else router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {err && (
        <span role="alert" className="text-[12px] text-error">
          {err}
        </span>
      )}
      <button
        onClick={() => run("approve")}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg bg-success px-3.5 py-1.5 text-body-sm font-semibold text-[#06251a] transition-colors hover:brightness-110 disabled:opacity-50"
      >
        <Icon name="check" size={15} /> Verifikasi
      </button>
      <button
        onClick={() => run("reject")}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg border border-error/40 px-3.5 py-1.5 text-body-sm text-error transition-colors hover:bg-error/10 disabled:opacity-50"
      >
        <Icon name="close" size={15} /> Tolak
      </button>
    </div>
  );
}
