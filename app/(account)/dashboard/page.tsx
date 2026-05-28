import { createServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, is_seller, role")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
        Dashboard
      </p>
      <h1 className="mt-2 font-geist text-3xl font-bold tracking-tight">
        Halo, {profile?.name || "Pengguna"} 👋
      </h1>
      <p className="mt-3 text-muted">
        Akun kamu sudah aktif. Jelajahi marketplace, simpan wishlist, dan—saat
        siap—buka toko untuk mulai berjualan.
      </p>
    </div>
  );
}
