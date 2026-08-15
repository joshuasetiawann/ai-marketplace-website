import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/supabase/server";

/**
 * Server-side guard for the authenticated account area (defense-in-depth
 * alongside middleware), wrapped in the same chrome as the rest of the app.
 *
 * This used to render its own minimal header, which dropped search, cart,
 * wishlist and the whole menu the moment a user opened their dashboard — and on
 * mobile removed the bottom bar that had just brought them here.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-16">{children}</main>
    </AppShell>
  );
}
