import AdminUserActions from "@/components/AdminUserActions";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Pengguna — Console" };

export default async function AdminUsersPage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,name,role,is_seller,created_at")
    .order("created_at", { ascending: false });

  const list = profiles ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-title-md text-on-surface">Pengguna ({list.length})</h2>
      <div className="overflow-hidden rounded-xl surface-card">
        <div className="flex flex-col divide-y divide-white/5">
          {list.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-inverse-primary font-bold text-on-primary-container">
                {(p.name || "U").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm text-on-surface">{p.name || "(tanpa nama)"}</p>
                <p className="text-[12px] text-on-surface-variant">
                  Bergabung {new Date(p.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              {p.is_seller && (
                <span className="rounded-full border border-secondary/40 bg-secondary/10 px-2.5 py-0.5 text-[11px] text-secondary">Seller</span>
              )}
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                  p.role === "admin" ? "border-success/40 bg-success/10 text-success" : "border-white/15 text-on-surface-variant"
                }`}
              >
                {p.role}
              </span>
              <AdminUserActions id={p.id} role={p.role} isSelf={p.id === user!.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
