"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { processPayout } from "@/lib/actions/admin";

export default function AdminPayoutActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  const act = (action: "paid" | "rejected") =>
    start(async () => {
      setErr("");
      const res = await processPayout(id, action);
      if (res?.error) setErr(res.error);
      else router.refresh();
    });

  return (
    <div className="flex items-center gap-2">
      {err && <span role="alert" className="text-[12px] text-error">{err}</span>}
      <button
        onClick={() => act("paid")}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-body-sm text-success hover:bg-success/20"
      >
        <Icon name="check" size={16} /> Tandai dibayar
      </button>
      <button
        onClick={() => act("rejected")}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg bg-error/10 px-3 py-1.5 text-body-sm text-error hover:bg-error/20"
      >
        <Icon name="close" size={16} /> Tolak
      </button>
    </div>
  );
}
