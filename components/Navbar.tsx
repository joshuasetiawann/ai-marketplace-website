"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "./Icon";
import Logo from "./Logo";
import { signOut } from "@/lib/actions/auth";

const NAV_LINKS = [
  { href: "/explore", label: "Jelajahi" },
  { href: "/categories", label: "Kategori" },
  { href: "/creators", label: "Kreator" },
  { href: "/pricing", label: "Harga" },
];

export type NavUser = { name: string; email: string; isSeller: boolean } | null;

export default function Navbar({
  user,
  cartCount = 0,
  wishlistCount = 0,
}: {
  user: NavUser;
  cartCount?: number;
  wishlistCount?: number;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // close any open menus when the route changes
    /* eslint-disable react-hooks/set-state-in-effect */
    setMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/explore${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
    setSearchOpen(false);
    setQuery("");
  };

  const accountItems = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    user?.isSeller
      ? { href: "/sell", icon: "storefront", label: "Seller Studio" }
      : { href: "/sell/start", icon: "add_business", label: "Buka Toko" },
    { href: "/library", icon: "deployed_code", label: "Library" },
    { href: "/orders", icon: "receipt_long", label: "Pesanan" },
    { href: "/settings", icon: "settings", label: "Pengaturan" },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-white/10 glass-nav" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 md:h-[72px] md:px-16">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((l) => {
                const active = pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`relative font-label text-label-md transition-colors duration-300 ${
                      active ? "text-primary-container" : "text-on-surface/60 hover:text-on-surface"
                    }`}
                  >
                    {l.label}
                    {active && (
                      <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              className="rounded-full p-2.5 text-on-surface/70 transition-colors hover:bg-white/5 hover:text-on-surface"
              aria-label="Cari"
            >
              <Icon name="search" size={22} />
            </button>

            <Link
              href="/wishlist"
              className="relative hidden rounded-full p-2.5 text-on-surface/70 transition-colors hover:bg-white/5 hover:text-on-surface sm:flex"
              aria-label="Wishlist"
            >
              <Icon name="favorite" size={22} />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative rounded-full p-2.5 text-on-surface/70 transition-colors hover:bg-white/5 hover:text-on-surface"
              aria-label="Keranjang"
            >
              <Icon name="shopping_cart" size={22} />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-container px-1 text-[10px] font-bold text-on-primary-container shadow-[0_0_8px_rgba(0,229,255,0.5)]">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative hidden md:block" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((s) => !s)}
                  className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-inverse-primary text-sm font-bold text-on-primary-container">
                    {user.name.charAt(0) || "U"}
                  </span>
                  <Icon name="expand_more" size={18} className="text-on-surface-variant" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg p-2 glass-panel animate-scale-in">
                    <div className="mb-1 border-b px-3 py-2 hairline">
                      <p className="truncate text-body-sm font-semibold text-on-surface">{user.name}</p>
                      <p className="truncate text-[12px] text-on-surface-variant">{user.email}</p>
                    </div>
                    {accountItems.map((i) => (
                      <Link
                        key={i.href}
                        href={i.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-body-sm text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
                      >
                        <Icon name={i.icon} size={18} />
                        {i.label}
                      </Link>
                    ))}
                    <form action={signOut} className="mt-1 border-t hairline">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-body-sm text-error transition-colors hover:bg-error/10"
                      >
                        <Icon name="logout" size={18} />
                        Keluar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden px-3 py-2 font-label text-label-md text-on-surface/70 transition-colors hover:text-on-surface md:block"
                >
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary hidden px-5 py-2.5 md:inline-flex">
                  Daftar
                  <Icon name="arrow_forward" size={18} />
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2.5 text-on-surface/80 hover:bg-white/5 lg:hidden"
              aria-label="Buka menu"
            >
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-white/10 glass-nav animate-fade-in-fast">
            <form onSubmit={submitSearch} className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-4 md:px-16">
              <Icon name="search" size={22} className="text-outline" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari model, kreator, kategori…"
                className="flex-1 bg-transparent text-body-md text-on-surface outline-none placeholder:text-outline/70"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <Icon name="close" size={20} />
              </button>
            </form>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 right-0 top-0 flex w-[82%] max-w-sm flex-col border-l border-white/10 p-6 glass-nav animate-slide-in-right">
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setMenuOpen(false)} className="p-2 text-on-surface-variant hover:text-on-surface" aria-label="Tutup menu">
                <Icon name="close" size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-4 py-3 font-display text-title-md transition-colors ${
                    pathname.startsWith(l.href) ? "bg-primary-container/10 text-primary-container" : "text-on-surface hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/wishlist" className="flex items-center justify-between rounded-lg px-4 py-3 font-display text-title-md text-on-surface hover:bg-white/5">
                Wishlist {wishlistCount > 0 && <span className="text-base text-secondary">{wishlistCount}</span>}
              </Link>
            </nav>
            <div className="mt-auto flex flex-col gap-3 border-t pt-6 hairline">
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-soft py-3">
                    <Icon name="dashboard" size={20} /> Dashboard
                  </Link>
                  <Link href={user.isSeller ? "/sell" : "/sell/start"} className="btn-soft py-3">
                    <Icon name={user.isSeller ? "storefront" : "add_business"} size={20} />
                    {user.isSeller ? "Seller Studio" : "Buka Toko"}
                  </Link>
                  <form action={signOut}>
                    <button type="submit" className="btn-ghost w-full border-error/30 py-3 text-error">
                      <Icon name="logout" size={20} /> Keluar
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-soft py-3">
                    Masuk
                  </Link>
                  <Link href="/register" className="btn-primary py-3">
                    Daftar <Icon name="arrow_forward" size={18} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
