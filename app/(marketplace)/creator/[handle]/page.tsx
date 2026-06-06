import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import ModelCard from "@/components/ModelCard";
import ModelArtwork from "@/components/ModelArtwork";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { PRODUCT_COLUMNS, mapProduct } from "@/lib/catalog";

async function getStore(handle: string) {
  const supabase = await createServerClient();
  const { data: store } = await supabase
    .from("stores")
    .select("owner_id, name, handle, tagline, category")
    .eq("handle", handle)
    .maybeSingle();
  return { supabase, store };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const { store } = await getStore(handle);
  if (!store) return { title: "Kreator tidak ditemukan — Nexora AI" };
  return {
    title: `${store.name} — Kreator Nexora AI`,
    description: store.tagline || `Model AI oleh ${store.name} di Nexora.`,
    openGraph: { title: store.name, description: store.tagline ?? "" },
  };
}

export default async function CreatorStorefrontPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const { supabase, store } = await getStore(handle);
  if (!store) notFound();

  const [{ data: productRows }, { data: { user } }] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("owner_id", store.owner_id)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const products = (productRows ?? []).map(mapProduct);
  const wished = new Set<string>();
  if (user) {
    const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id);
    (data ?? []).forEach((w) => wished.add(w.product_id));
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
      <nav className="mb-6 flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/creators" className="hover:text-on-surface">Kreator</Link>
        <Icon name="chevron_right" size={16} />
        <span className="text-on-surface">{store.name}</span>
      </nav>

      <header className="mb-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <span className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10">
          <ModelArtwork seed={store.handle} className="h-full w-full" />
        </span>
        <div>
          <h1 className="font-display text-headline-md text-on-surface md:text-headline-lg">{store.name}</h1>
          {store.tagline && <p className="mt-1 text-body-md text-on-surface-variant">{store.tagline}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-outline">
            {store.category && (
              <span className="inline-flex items-center gap-1 capitalize">
                <Icon name="category" size={14} /> {store.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Icon name="deployed_code" size={14} /> {products.length} model
            </span>
          </div>
        </div>
      </header>

      {products.length === 0 ? (
        <EmptyState icon="deployed_code" title="Belum ada model" message="Kreator ini belum menerbitkan model." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((m) => (
            <ModelCard key={m.id} model={m} wishlisted={wished.has(m.id)} loggedIn={!!user} />
          ))}
        </div>
      )}
    </div>
  );
}
