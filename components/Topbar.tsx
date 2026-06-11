import Link from "next/link";

/** v2 status strip above the navbar (desktop only) — see docs/design/v2 frame "beranda". */
export default function Topbar() {
  return (
    <div className="hidden border-b bg-surface-container-lowest hairline md:block">
      <div className="mx-auto flex h-7 max-w-[1440px] items-center justify-between px-5 font-mono text-[10px] tracking-[0.14em] text-on-surface-variant md:px-16">
        <p className="flex items-center gap-2">
          <span className="text-primary-container" aria-hidden>
            ✳
          </span>
          SEMUA SISTEM OPERASIONAL · 99,99% UPTIME
        </p>
        <p className="flex items-center gap-4">
          <span className="hidden lg:inline">QRIS · VIRTUAL ACCOUNT · E-WALLET</span>
          <Link href="/help" className="text-on-surface/80 transition-colors hover:text-primary-container">
            Bantuan
          </Link>
        </p>
      </div>
    </div>
  );
}
