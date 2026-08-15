import { createServerClient, getCurrentUser } from "@/lib/supabase/server";
import Navbar, { type NavUser } from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

/**
 * The application chrome — header, bottom nav, footer — shared by every
 * customer-facing surface.
 *
 * It used to live inline in the marketplace layout only, so the whole signed-in
 * area (dashboard, orders, library, settings, seller studio) rendered a bare
 * logo-and-logout header instead: no search, no cart, no menu. On mobile that
 * was a dead end — the bottom bar has a "Dashboard" tab, and tapping it made
 * the bottom bar itself disappear.
 *
 * Kept as one component rather than copied into each layout so the counts and
 * the spacing rules stay in a single place.
 */
export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const user = await getCurrentUser();

  let navUser: NavUser = null;
  let cartCount = 0;
  let wishlistCount = 0;

  if (user) {
    const [{ data: profile }, cart, wishlist] = await Promise.all([
      supabase.from("profiles").select("name, is_seller").eq("id", user.id).single(),
      // no { count: "exact" }: the badge needs the summed quantity, not the row
      // count, so the extra counting query Postgres runs for it was pure waste.
      supabase.from("cart_items").select("qty").eq("user_id", user.id),
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
      {/* pt clears the fixed header; pb clears the mobile bottom bar, which only
          exists below lg. Both read the shared --nav-h from globals.css. */}
      <div className="flex-1 pb-20 pt-[var(--nav-h)] lg:pb-0">{children}</div>
      <Footer />
      <MobileNav cartCount={cartCount} />
    </div>
  );
}
