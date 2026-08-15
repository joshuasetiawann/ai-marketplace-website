import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import { GlowOrb } from "@/components/common";
import OpenStoreForm from "@/components/OpenStoreForm";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Buka Toko — Nexora AI" };

const BENEFITS = [
  { icon: "payments", title: "Bagi hasil 80%", desc: "Kamu menyimpan 80% dari setiap penjualan, dibayar ke rekeningmu." },
  { icon: "verified_user", title: "Pembayaran aman", desc: "QRIS, Virtual Account & e-wallet — dana masuk otomatis ke saldo toko." },
  { icon: "insights", title: "Dashboard lengkap", desc: "Pantau penjualan, pelanggan, dan pencairan dana real-time." },
];

export default async function OpenStorePage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/sell/start");

  const { data: profile } = await supabase.from("profiles").select("name, is_seller").eq("id", user.id).single();
  if (profile?.is_seller) redirect("/sell");

  return (
    <div className="relative mx-auto max-w-5xl">
      <GlowOrb className="right-0 top-0 h-[400px] w-[500px]" />
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="mb-3 font-label text-label-sm uppercase tracking-widest text-secondary">Mulai Berjualan</p>
          <h1 className="mb-4 font-display text-headline-md text-on-surface md:text-headline-lg">Buka toko, jual model AI buatanmu</h1>
          <p className="mb-8 text-body-lg text-on-surface-variant">
            Akun <b className="text-on-surface">{profile?.name || user.email}</b> kamu cukup satu — belanja dan jualan dari
            tempat yang sama, persis seperti marketplace favoritmu.
          </p>
          <div className="flex flex-col gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-4 rounded-xl surface-card p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary">
                  <Icon name={b.icon} size={22} />
                </span>
                <div>
                  <p className="font-semibold text-on-surface">{b.title}</p>
                  <p className="text-body-sm text-on-surface-variant">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <OpenStoreForm />
      </div>
      <p className="mt-10 text-center text-body-sm text-on-surface-variant">
        Mau lihat-lihat dulu?{" "}
        <Link href="/explore" className="font-semibold text-primary-container">
          Jelajahi marketplace
        </Link>
      </p>
    </div>
  );
}
