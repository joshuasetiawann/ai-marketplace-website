"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { setUserRole } from "@/lib/actions/admin";

export default function AdminUserActions({
  id,
  role,
  isSelf,
}: {
  id: string;
  role: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  const toggle = () =>
    start(async () => {
      setErr("");
      const res = await setUserRole(id, role === "admin" ? "user" : "admin");
      if (res?.error) setErr(res.error);
      else router.refresh();
    });

  if (isSelf) return <span className="text-[12px] text-on-surface-variant">Kamu</span>;

  return (
    <div className="flex items-center gap-2">
      {err && <span role="alert" className="text-[12px] text-error">{err}</span>}
      <button
        onClick={toggle}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-body-sm text-on-surface-variant hover:border-white/25 hover:text-on-surface"
      >
        <Icon name={role === "admin" ? "person" : "shield_person"} size={15} />
        {role === "admin" ? "Jadikan user" : "Jadikan admin"}
      </button>
    </div>
  );
}
