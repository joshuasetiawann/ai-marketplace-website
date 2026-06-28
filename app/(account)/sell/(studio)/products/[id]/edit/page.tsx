import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import ProductForm from "@/components/ProductForm";
import { createServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit Produk — Nexora AI" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: p } = await supabase
    .from("products")
    .select("id,name,tagline,category,tier,price_usd,description,icon,art,use_cases,use_case_tags")
    .eq("id", id)
    .eq("owner_id", user!.id)
    .maybeSingle();
  if (!p) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/sell/products" className="flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> Kembali ke produk
      </Link>
      <h2 className="font-display text-title-md text-on-surface">Edit Produk</h2>
      <ProductForm
        product={{
          id: p.id,
          name: p.name,
          tagline: p.tagline ?? "",
          category: p.category,
          tier: p.tier,
          price: Number(p.price_usd),
          description: p.description ?? "",
          icon: p.icon ?? "auto_awesome",
          art: p.art ?? ["#0b3a44", "#00e5ff"],
          useCases: p.use_cases ?? [],
          useCaseTags: p.use_case_tags ?? [],
        }}
      />
    </div>
  );
}
