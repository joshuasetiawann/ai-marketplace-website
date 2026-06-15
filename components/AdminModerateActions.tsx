"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { moderateProduct } from "@/lib/actions/admin";

export default function AdminModerateActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  const act = (action: "approve" | "reject") =>
    start(async () => {
      setErr("");
      const res = await moderateProduct(id, action);
      if (res?.error) setErr(res.error);
      else router.refresh();
    });

  return (
    <div className="flex items-center gap-2">
      {err && <span role="alert" className="text-[12px] text-error">{err}</span>}
      <button
        onClick={() => act("reject")}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg border border-error/40 px-3.5 py-1.5 text-body-sm text-error transition-colors hover:bg-error/10 disabled:opacity-50"
      >
        <Icon name="close" size={16} /> Tolak
      </button>
      <button
        onClick={() => act("approve")}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg bg-success px-3.5 py-1.5 text-body-sm font-semibold text-[#06251a] shadow-[0_0_12px_rgba(126,224,168,0.25)] transition-colors hover:brightness-110 disabled:opacity-50"
      >
        <Icon name="check" size={16} /> Setujui
      </button>
    </div>
  );
}
