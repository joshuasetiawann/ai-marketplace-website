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
        <Link href="/admin" className="flex items-center gap-2.5 font-geist text-lg font-bold">
          Nexora <span className="text-success">Console</span>
          <span className="rounded border border-white/15 px-2 py-0.5 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-on-surface-variant">
            Internal
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <p className="hidden text-right md:block">
            <span className="block text-body-sm font-medium text-on-surface">{profile?.name || "Admin"}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">admin</span>
          </p>
          <Link href="/" className="text-muted hover:text-on-surface">
            Marketplace
          </Link>
          <form action={signOut}>
            <button className="text-muted transition-colors hover:text-error">Keluar</button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {/* v2 green console header (docs/design/v2 frame "admin") */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-success/15 bg-gradient-to-br from-success/[0.05] to-transparent p-6 md:p-8">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-success/25 bg-success/10 text-success">
            <Icon name="shield_person" size={28} />
          </span>
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-success">Admin Console</p>
            <h1 className="font-display text-title-md text-on-surface md:text-headline-md">Moderasi Platform</h1>
            <p className="text-body-sm text-on-surface-variant">
              Tinjau produk, tangani laporan, dan jaga kualitas marketplace.
            </p>
          </div>
        </div>
        <AdminNav />
        <div className="mt-8 min-w-0">{children}</div>
      </div>
    </div>
  );
}
