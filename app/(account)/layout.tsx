import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

/**
 * Server-side guard for the authenticated account area (defense-in-depth
 * alongside middleware). Renders a minimal shell + logout.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <Link href="/" className="font-geist text-lg font-bold tracking-tight">
          Nexora <span className="text-accent">AI</span>
        </Link>
        <form action={signOut}>
          <button className="text-sm text-muted transition hover:text-accent">
            Keluar
          </button>
        </form>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
