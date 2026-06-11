import { createServerClient } from "@/lib/supabase/server";
import Navbar, { type NavUser } from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let navUser: NavUser = null;
  let cartCount = 0;
  let wishlistCount = 0;

  if (user) {
    const [{ data: profile }, cart, wishlist] = await Promise.all([
      supabase.from("profiles").select("name, is_seller").eq("id", user.id).single(),
      supabase.from("cart_items").select("qty", { count: "exact", head: false }).eq("user_id", user.id),
      supabase.from("wishlist_items").select("product_id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    navUser = {
      name: profile?.name || user.email || "Pengguna",
      email: user.email || "",
      isSeller: profile?.is_seller ?? false,
    };
    cartCount = (cart.data ?? []).reduce((n, r) => n + (r.qty ?? 1), 0);
    wishlistCount = wishlist.count ?? 0;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} cartCount={cartCount} wishlistCount={wishlistCount} />
      <div className="flex-1 pb-20 pt-16 md:pt-[100px] lg:pb-0">{children}</div>
      <Footer />
      <MobileNav cartCount={cartCount} />
    </div>
  );
}
