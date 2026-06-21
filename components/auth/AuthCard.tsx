"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

/** Shared field styling for auth forms. */
export const fieldClass =
  "w-full rounded-lg border border-line bg-base px-4 py-3 text-sm text-ink " +
  "placeholder:text-muted outline-none transition focus:border-accent/60 " +
  "focus:ring-2 focus:ring-accent/20";

/** v2 primary submit — cyan glow + arrow (docs/design/v2 frame "auth"). */
export const authSubmitClass =
  "flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold " +
  "text-base text-[#00363d] shadow-[0_0_18px_rgba(0,229,255,0.35)] transition " +
  "hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:shadow-none";

/** Labeled input with mono eyebrow label + leading icon; `right` slots next to the label. */
export function AuthField({
  label,
  icon,
  right,
  ...inputProps
}: {
  label: string;
  icon: string;
  right?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {label}
        </label>
        {right}
      </div>
      <div className="relative">
        <Icon name={icon} size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
        <input id={id} {...inputProps} className={`${fieldClass} pl-10`} />
      </div>
    </div>
  );
}

/** AuthField for passwords with a show/hide toggle. */
export function PasswordField({
  label = "Password",
  right,
  ...inputProps
}: {
  label?: string;
  right?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {label}
        </label>
        {right}
      </div>
      <div className="relative">
        <Icon name="lock" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
        <input id={id} {...inputProps} type={show ? "text" : "password"} className={`${fieldClass} pl-10 pr-11`} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-outline transition-colors hover:text-ink"
        >
          <Icon name={show ? "visibility_off" : "visibility"} size={17} />
        </button>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: "payments", title: "Bagi hasil 80% untuk kreator", desc: "Cair otomatis ke rekeningmu." },
  { icon: "verified_user", title: "Pembayaran aman & terenkripsi", desc: "QRIS, Virtual Account & e-wallet." },
  { icon: "workspace_premium", title: "2.400+ model kurasi premium", desc: "Diverifikasi & siap produksi." },
];

/** v2 split-screen auth shell (docs/design/v2 frame "auth"): brand panel + form card. */
export function AuthCard({
  title,
  sub,
  tab,
  children,
}: {
  title: string;
  sub?: string;
  tab?: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r p-12 hairline blueprint-grid lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 82% -5%, rgba(0,229,255,0.09), transparent 40%), radial-gradient(circle at 0% 100%, rgba(0,229,255,0.05), transparent 38%)",
          }}
        />
        <Link href="/" className="font-geist text-lg font-bold tracking-tight">
          Nexora <span className="text-accent">AI</span>
        </Link>

        <div className="max-w-md">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_#00e5ff]" />
            Satu akun untuk semua
          </p>
          <h2 className="mb-4 font-display text-[40px] font-semibold leading-[1.1] tracking-tight text-ink">
            Belanja &amp; jualan model AI dari satu tempat.
          </h2>
          <p className="mb-8 text-body-md text-muted">
            Masuk untuk melanjutkan ke marketplace AI paling premium di Indonesia.
          </p>
          <ul className="flex flex-col gap-4">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                  <Icon name={f.icon} size={20} />
                </span>
                <span>
                  <span className="block text-body-md font-semibold text-ink">{f.title}</span>
                  <span className="block text-body-sm text-muted">{f.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2" aria-hidden>
            {["#00e5ff", "#a855f7", "#e9c349"].map((c) => (
              <span
                key={c}
                className="h-7 w-7 rounded-full border-2 border-surface"
                style={{ background: `radial-gradient(circle at 30% 30%, ${c}, #101115)` }}
              />
            ))}
          </div>
          <p className="text-body-sm text-muted">
            <span className="font-semibold text-ink">120rb+</span> builder sudah bergabung
          </p>
        </div>
      </aside>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 block text-center font-geist text-lg font-bold tracking-tight lg:hidden">
            Nexora <span className="text-accent">AI</span>
          </Link>

          {tab && (
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-line bg-base-2/80 p-1">
              <Link
                href="/login"
                className={`rounded-full py-2.5 text-center font-label text-label-md transition-colors ${
                  tab === "login" ? "bg-accent font-semibold text-[#00363d]" : "text-muted hover:text-ink"
                }`}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className={`rounded-full py-2.5 text-center font-label text-label-md transition-colors ${
                  tab === "register" ? "bg-accent font-semibold text-[#00363d]" : "text-muted hover:text-ink"
                }`}
              >
                Daftar
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-base-2/60 p-8 shadow-[0_0_60px_-15px] shadow-accent/10 backdrop-blur">
            <h1 className="font-geist text-2xl font-bold tracking-tight">{title}</h1>
            {sub && <p className="mt-1.5 text-sm text-muted">{sub}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
