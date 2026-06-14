import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import ModelCard from "@/components/ModelCard";
import ProductDetailClient from "@/components/ProductDetailClient";
import { SectionHeading } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";
import { PRODUCT_COLUMNS, mapProduct } from "@/lib/catalog";
import type { ReviewItem } from "@/lib/actions/reviews";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("products")
    .select("name, tagline, description")
    .eq("id", id)
    .maybeSingle();
  if (!data) return { title: "Model tidak ditemukan — Nexora AI" };
  const title = `${data.name} — Nexora AI`;
  const description = data.tagline || data.description || "Model AI premium di Nexora.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: `/model/${id}` },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/model/${id}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();

  const model = mapProduct(row);

  // seller attribution (house catalog has owner_id = null)
  const seller = model.ownerId
    ? (await supabase.from("stores").select("name, handle").eq("owner_id", model.ownerId).maybeSingle()).data
    : null;

  // "owned" = the signed-in buyer has a paid order line for this product
  let owned = false;
  if (user) {
    const { data: paidItem } = await supabase
      .from("order_items")
      .select("id, orders!inner(buyer_id, status)")
      .eq("product_id", id)
      .eq("orders.buyer_id", user.id)
      .eq("orders.status", "paid")
      .limit(1)
      .maybeSingle();
    owned = !!paidItem;
  }

  const [reviewsRes, relatedRes, wishRes] = await Promise.all([
    supabase
      .from("reviews")
      .select("id,rating,body,created_at,profiles!reviews_author_id_fkey(name)")
      .eq("product_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("status", "published")
      .eq("category", model.category)
      .neq("id", id)
      .limit(4),
    user
      ? supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { product_id: string }[] }),
  ]);

  const reviews: ReviewItem[] = ((reviewsRes.data ?? []) as Array<Record<string, unknown>>).map((r) => {
    const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: String(r.id),
      rating: Number(r.rating),
      body: (r.body as string) ?? "",
      created_at: String(r.created_at),
      authorName: (prof as { name?: string } | null)?.name || "Pengguna",
    };
  });

  const related = (relatedRes.data ?? []).map(mapProduct);
  const wished = new Set((wishRes.data ?? []).map((w) => w.product_id));
  const wishlisted = wished.has(model.id);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-16">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/" className="hover:text-on-surface">Beranda</Link>
        <Icon name="chevron_right" size={16} />
        <Link href="/explore" className="hover:text-on-surface">Jelajahi</Link>
        <Icon name="chevron_right" size={16} />
        <Link href={`/explore?cat=${model.category}`} className="capitalize hover:text-on-surface">{model.category}</Link>
        <Icon name="chevron_right" size={16} />
        <span className="text-on-surface">{model.name}</span>
      </nav>

      <ProductDetailClient
        model={model}
        reviews={reviews}
        wishlisted={wishlisted}
        loggedIn={!!user}
        owned={owned}
        seller={seller}
      />

      {related.length > 0 && (
        <section>
          <SectionHeading title="Mungkin kamu suka" className="mb-8" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {related.map((m) => (
              <ModelCard key={m.id} model={m} wishlisted={wished.has(m.id)} loggedIn={!!user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
