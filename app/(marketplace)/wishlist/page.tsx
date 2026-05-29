import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import ModelCard from "@/components/ModelCard";
import WishlistAddAll from "@/components/WishlistAddAll";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/catalog";

export const metadata = { title: "Wishlist — Nexora AI" };

export default async function WishlistPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/wishlist");

  const { data } = await supabase
    .from("wishlist_items")
    .select("products(id,name,tagline,category,use_cases,use_case_tags,tier,price_usd,rating,reviews_count,icon,art,description,created_at)")
    .eq("user_id", user.id);

  const models = (data ?? [])
    .map((row: Record<string, unknown>) => {
      const p = Array.isArray(row.products) ? row.products[0] : row.products;
      return p ? mapProduct(p as Parameters<typeof mapProduct>[0]) : null;
    })
    .filter((m): m is ReturnType<typeof mapProduct> => m !== null);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-headline-md text-on-surface md:text-headline-lg">Wishlist Saya</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{models.length} model disimpan.</p>
        </div>
        {models.length > 0 && <WishlistAddAll ids={models.map((m) => m.id)} />}
      </div>

      {models.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {models.map((m) => (
            <ModelCard key={m.id} model={m} wishlisted loggedIn />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="favorite"
          title="Belum ada model disimpan"
          message="Ketuk ikon bookmark di model mana pun untuk menyimpannya di sini."
          action={
            <Link href="/explore" className="btn-primary px-6 py-3">
              <Icon name="explore" size={18} /> Jelajahi Model
            </Link>
          }
        />
      )}
    </div>
  );
}
