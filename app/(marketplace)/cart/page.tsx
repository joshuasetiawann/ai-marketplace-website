import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import CartClient from "@/components/CartClient";
import CheckoutSteps from "@/components/CheckoutSteps";
import { EmptyState } from "@/components/common";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getCart } from "@/lib/cart";

export const metadata = { title: "Keranjang — Nexora AI" };

export default async function CartPage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");

  const { lines, unavailable, subtotal, taxes, total } = await getCart(supabase, user.id);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
      {/* Withdrawn items still block checkout, so a cart holding only those is
          not an empty cart — it needs the page, not the empty state. */}
      {lines.length === 0 && unavailable.length === 0 ? (
        <>
          <h1 className="mb-8 font-display text-headline-md text-on-surface md:text-headline-lg">Keranjang</h1>
          <EmptyState
            icon="shopping_cart"
            title="Keranjang kamu kosong"
            message="Jelajahi marketplace dan tambahkan model AI premium untuk memulai."
            action={
              <Link href="/explore" className="btn-primary px-6 py-3">
                <Icon name="explore" size={18} /> Jelajahi Model
              </Link>
            }
          />
        </>
      ) : (
        <>
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 eyebrow-mono">
                <span className="mr-1 opacity-60">{"//"}</span>Checkout
              </p>
              <h1 className="font-display text-headline-md text-on-surface md:text-headline-lg">Keranjang</h1>
              <p className="mt-1 text-body-md text-on-surface-variant">
                <span className="font-semibold text-on-surface">{lines.length} item</span> siap di-checkout.
                {unavailable.length > 0 && (
                  <span className="text-error"> {unavailable.length} item tidak tersedia lagi.</span>
                )}
              </p>
            </div>
            <CheckoutSteps current={1} />
          </div>
          <div className="mb-4 flex items-center justify-between lg:max-w-[61%]">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-outline">Item ({lines.length})</p>
            <Link href="/explore" className="inline-flex items-center gap-1 text-body-sm text-primary-container hover:text-primary">
              <Icon name="add" size={16} /> Tambah lagi
            </Link>
          </div>
          <CartClient lines={lines} unavailable={unavailable} subtotal={subtotal} taxes={taxes} total={total} />
        </>
      )}
    </div>
  );
}
