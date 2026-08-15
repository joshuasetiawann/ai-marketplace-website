import Link from "next/link";
import Icon from "@/components/Icon";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";

const QUICK_LINKS = [
  { href: "/library", icon: "deployed_code", label: "Library", desc: "Model yang kamu miliki" },
  { href: "/orders", icon: "receipt_long", label: "Pesanan", desc: "Riwayat pembelian" },
  { href: "/wishlist", icon: "bookmark", label: "Wishlist", desc: "Model yang kamu simpan" },
  { href: "/explore", icon: "explore", label: "Jelajahi", desc: "Temukan model baru" },
];

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, is_seller, role")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
        Dashboard
      </p>
      <h1 className="mt-2 font-geist text-3xl font-bold tracking-tight">
        Halo, {profile?.name || "Pengguna"} 👋
      </h1>
      <p className="mt-3 text-muted">
        Akun kamu sudah aktif. Jelajahi marketplace, simpan wishlist, dan—saat
        siap—buka toko untuk mulai berjualan.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-4 rounded-xl surface-card p-5 transition-colors hover:border-primary-container/30"
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary-container/10 text-primary-container">
              <Icon name={l.icon} size={22} />
            </span>
            <div>
              <p className="font-display text-body-lg font-semibold text-on-surface">{l.label}</p>
              <p className="text-body-sm text-on-surface-variant">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
