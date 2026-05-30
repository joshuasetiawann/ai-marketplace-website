import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import CartClient from "@/components/CartClient";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { getCart } from "@/lib/cart";

export const metadata = { title: "Keranjang — Nexora AI" };

export default async function CartPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cart");

  const { lines, subtotal, taxes, total } = await getCart(supabase, user.id);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
      {lines.length === 0 ? (
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
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="font-display text-headline-md text-on-surface md:text-headline-lg">Keranjang</h1>
              <p className="mt-1 text-body-md text-on-surface-variant">{lines.length} item di keranjang kamu.</p>
            </div>
            <Link href="/explore" className="btn-ghost hidden px-5 py-2.5 sm:inline-flex">
              <Icon name="add" size={18} /> Tambah lagi
            </Link>
          </div>
          <CartClient lines={lines} subtotal={subtotal} taxes={taxes} total={total} />
        </>
      )}
    </div>
  );
}
