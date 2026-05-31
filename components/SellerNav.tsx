"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const ITEMS = [
  { href: "/sell", icon: "dashboard", label: "Ringkasan", exact: true },
  { href: "/sell/products", icon: "inventory_2", label: "Produk" },
  { href: "/sell/sales", icon: "receipt_long", label: "Penjualan" },
  { href: "/sell/earnings", icon: "insights", label: "Earnings" },
  { href: "/sell/payouts", icon: "account_balance", label: "Payout" },
];

export default function SellerNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto no-scrollbar md:flex-col md:gap-1">
      {ITEMS.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-body-sm transition-colors ${
              active
                ? "bg-primary-container/10 text-primary-container"
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
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
