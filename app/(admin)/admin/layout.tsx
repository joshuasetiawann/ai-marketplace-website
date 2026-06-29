import { redirect } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import AdminNav from "@/components/AdminNav";
import { signOut } from "@/lib/actions/auth";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role, name").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link href="/admin" className="flex items-center gap-2 font-geist text-lg font-bold">
          Nexora <span className="text-success">Console</span>
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-normal text-success">Admin</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted hover:text-on-surface">
            Marketplace
          </Link>
          <form action={signOut}>
            <button className="text-muted transition-colors hover:text-error">Keluar</button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Icon name="shield_person" size={22} className="text-success" />
          <h1 className="font-display text-headline-md text-on-surface">Console Admin</h1>
        </div>
        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <aside className="md:sticky md:top-6 md:self-start">
            <AdminNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
