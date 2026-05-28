"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const ITEMS = [
  { href: "/", icon: "home", label: "Beranda", exact: true },
  { href: "/explore", icon: "explore", label: "Jelajahi" },
  { href: "/cart", icon: "shopping_cart", label: "Keranjang", badge: true },
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
];

export default function MobileNav({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 glass-nav pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid h-16 grid-cols-4">
        {ITEMS.map((it) => {
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-primary-container" : "text-on-surface-variant"
              }`}
            >
              <span className="relative">
                <Icon name={it.icon} size={24} fill={active} />
                {it.badge && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-container px-1 text-[10px] font-bold text-on-primary-container">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-label">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
