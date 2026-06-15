"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const ITEMS = [
  { href: "/admin", icon: "shield_person", label: "Ringkasan", exact: true },
  { href: "/admin/products", icon: "fact_check", label: "Moderasi" },
  { href: "/admin/orders", icon: "receipt_long", label: "Pesanan" },
  { href: "/admin/users", icon: "group", label: "Pengguna" },
  { href: "/admin/payouts", icon: "account_balance", label: "Payout" },
  { href: "/admin/messages", icon: "forum", label: "Pesan" },
];

/** v2 horizontal green tab nav for the Admin Console (docs/design/v2 frame "admin"). */
export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b hairline no-scrollbar">
      {ITEMS.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-label text-label-md transition-colors ${
              active
                ? "border-success text-success"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Icon name={it.icon} size={18} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
