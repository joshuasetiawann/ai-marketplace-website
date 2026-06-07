import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import CheckoutClient from "@/components/CheckoutClient";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { getCart } from "@/lib/cart";

export const metadata = { title: "Checkout — Nexora AI" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ promo?: string }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const [{ lines, subtotal, taxes, total }, { data: profile }] = await Promise.all([
    getCart(supabase, user.id),
    supabase.from("profiles").select("name").eq("id", user.id).single(),
  ]);

  // validate any promo server-side and recompute the totals to match the RPC
  const { promo } = await searchParams;
  let discount = 0;
  let promoCode = "";
  if (promo) {
    const { data } = await supabase.rpc("validate_promo", { p_code: promo, p_subtotal: subtotal });
    const pct = Number(data) || 0;
    if (pct > 0) {
      discount = Math.round(subtotal * (pct / 100) * 100) / 100;
      promoCode = promo.trim().toUpperCase();
    }
  }
  const discSubtotal = subtotal - discount;
  const shownTaxes = discount > 0 ? Math.round(discSubtotal * 0.11 * 100) / 100 : taxes;
  const shownTotal = discount > 0 ? Math.round(discSubtotal * 1.11 * 100) / 100 : total;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
        <EmptyState
          icon="shopping_cart_off"
          title="Tidak ada yang di-checkout"
          message="Keranjang kamu kosong. Tambahkan model dulu."
          action={
            <Link href="/explore" className="btn-primary px-6 py-3">
              Jelajahi Model
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-16">
      <div className="mb-2 flex items-center gap-3">
        <Link href="/cart" className="rounded-full p-2 text-on-surface-variant hover:bg-white/5" aria-label="Kembali">
          <Icon name="arrow_back" size={22} />
        </Link>
        <h1 className="font-display text-headline-md text-on-surface">Checkout</h1>
      </div>
      <p className="mb-8 flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Icon name="lock" size={15} className="text-primary-container" /> Pembayaran simulasi · order tercatat di database
      </p>
      <CheckoutClient
        lines={lines}
        subtotal={subtotal}
        taxes={shownTaxes}
        total={shownTotal}
        discount={discount}
        promo={promoCode}
        userName={profile?.name || user.email || "Pengguna"}
        userEmail={user.email || ""}
      />
    </div>
  );
}
