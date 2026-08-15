import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import SellerNav from "@/components/SellerNav";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";

export default async function SellerStudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/sell");

  const { data: profile } = await supabase.from("profiles").select("is_seller").eq("id", user.id).single();
  if (!profile?.is_seller) redirect("/sell/start");

  const { data: store } = await supabase
    .from("stores")
    .select("name, tagline")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-5xl">
      {/* v2 gold store header (docs/design/v2 frame "seller") */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-secondary/15 bg-gradient-to-br from-secondary/[0.06] to-transparent p-6 md:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-secondary/25 bg-secondary/10 text-secondary">
            <Icon name="storefront" size={28} />
          </span>
          <div>
            <p className="eyebrow-gold mb-1">Seller Studio</p>
            <h1 className="flex items-center gap-2 font-display text-title-md text-on-surface md:text-headline-md">
              {store?.name || "Toko kamu"}
              <Icon name="verified" size={20} className="text-secondary" fill />
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              {store?.tagline || "Kelola produk, pesanan, dan pendapatan AI kamu."}
            </p>
          </div>
        </div>
        <Link href="/sell/products/new" className="btn btn-gold px-5 py-2.5">
          <Icon name="add" size={18} /> Produk Baru
        </Link>
      </div>

      <SellerNav />
      <div className="mt-8 min-w-0">{children}</div>
    </div>
  );
}
