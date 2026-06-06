import { createHash } from "crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import ModelArtwork from "@/components/ModelArtwork";
import { createServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Akses model — Nexora AI" };

/** Deterministic, non-secret license key shown to the buyer as proof of purchase. */
function licenseKey(productId: string, userId: string) {
  const h = createHash("sha256").update(`${productId}:${userId}`).digest("hex").toUpperCase();
  return `NX-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`;
}

export default async function LibraryAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user!.id;

  // verify the buyer actually paid for this product
  const { data: paid } = await supabase
    .from("order_items")
    .select("id, orders!inner(buyer_id, status)")
    .eq("product_id", id)
    .eq("orders.buyer_id", uid)
    .eq("orders.status", "paid")
    .limit(1)
    .maybeSingle();
  if (!paid) notFound();

  const [{ data: product }, { data: asset }] = await Promise.all([
    supabase.from("products").select("name, icon, art").eq("id", id).maybeSingle(),
    // asset is entitlement-gated by RLS: only readable because we're a paid buyer
    supabase.from("product_assets").select("asset_url, access_note").eq("product_id", id).maybeSingle(),
  ]);
  if (!product) notFound();

  const key = licenseKey(id, uid);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <nav className="flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/library" className="hover:text-on-surface">Library</Link>
        <Icon name="chevron_right" size={16} />
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <div className="flex items-center gap-4">
        <span className="h-16 w-16 overflow-hidden rounded-xl">
          <ModelArtwork seed={id} colors={product.art ?? undefined} icon={product.icon ?? undefined} className="h-full w-full" />
        </span>
        <div>
          <h1 className="font-display text-title-md text-on-surface">{product.name}</h1>
          <p className="text-body-sm text-success">
            <Icon name="check_circle" size={14} fill /> Kamu memiliki model ini
          </p>
        </div>
      </div>

      <div className="rounded-xl surface-card p-6">
        <h2 className="mb-2 font-label text-label-sm uppercase tracking-wider text-outline">Kunci Lisensi</h2>
        <p className="font-mono text-body-lg text-on-surface">{key}</p>
        <p className="mt-2 text-[12px] text-on-surface-variant">
          Gunakan kunci ini saat mengaktifkan model melalui API atau SDK Nexora.
        </p>
      </div>

      <div className="rounded-xl surface-card p-6">
        <h2 className="mb-3 font-label text-label-sm uppercase tracking-wider text-outline">Akses & Unduhan</h2>
        {asset?.asset_url ? (
          <a href={asset.asset_url} target="_blank" rel="noopener noreferrer" className="btn-primary px-6 py-3">
            <Icon name="download" size={18} /> Unduh / Buka aset
          </a>
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            Kreator belum menautkan berkas unduhan. Kamu tetap dapat mengakses model via API memakai kunci lisensi di atas.
          </p>
        )}
        {asset?.access_note && (
          <p className="mt-3 whitespace-pre-line text-body-sm text-on-surface-variant">{asset.access_note}</p>
        )}
      </div>
    </div>
  );
}
