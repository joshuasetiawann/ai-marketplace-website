"use client";

import { useTransition } from "react";
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
  const toggle = () =>
    start(async () => {
      await setUserRole(id, role === "admin" ? "user" : "admin");
      router.refresh();
    });

  if (isSelf) return <span className="text-[12px] text-on-surface-variant">Kamu</span>;

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-body-sm text-on-surface-variant hover:border-white/25 hover:text-on-surface"
    >
      <Icon name={role === "admin" ? "person" : "shield_person"} size={15} />
      {role === "admin" ? "Jadikan user" : "Jadikan admin"}
    </button>
  );
}
