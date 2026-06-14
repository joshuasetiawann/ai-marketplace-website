"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const ITEMS = [
  { href: "/sell", icon: "monitoring", label: "Ringkasan", exact: true },
  { href: "/sell/products", icon: "deployed_code", label: "Produk" },
  { href: "/sell/sales", icon: "receipt_long", label: "Penjualan" },
  { href: "/sell/earnings", icon: "insights", label: "Earnings" },
  { href: "/sell/payouts", icon: "account_balance", label: "Payout" },
];

/** v2 horizontal gold tab nav for the Seller Studio (docs/design/v2 frame "seller"). */
export default function SellerNav() {
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
                ? "border-secondary text-secondary"
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
