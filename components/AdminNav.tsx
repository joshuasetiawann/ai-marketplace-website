"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const ITEMS = [
  { href: "/admin", icon: "shield_person", label: "Ringkasan", exact: true },
  { href: "/admin/products", icon: "fact_check", label: "Moderasi" },
  { href: "/admin/users", icon: "group", label: "Pengguna" },
  { href: "/admin/payouts", icon: "account_balance", label: "Payout" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto no-scrollbar md:flex-col">
      {ITEMS.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-body-sm transition-colors ${
              active ? "bg-success/10 text-success" : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
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
