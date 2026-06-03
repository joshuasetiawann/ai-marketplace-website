import Link from "next/link";
import Icon from "@/components/Icon";
import { createServerClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/catalog";

export const metadata = { title: "Kategori — Nexora AI" };

export default async function CategoriesPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.from("products").select("category").eq("status", "published");
  const counts = new Map<string, number>();
  for (const r of data ?? []) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
      <h1 className="mb-2 font-display text-headline-md text-on-surface md:text-headline-lg">Kategori</h1>
      <p className="mb-8 text-body-md text-on-surface-variant">Telusuri model AI berdasarkan bidangnya.</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
          <Link
            key={c.id}
            href={`/explore?cat=${c.id}`}
            className="group flex items-center gap-4 rounded-xl surface-card p-6 transition-all electric-glow-hover hover:border-primary-container/30"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary-container/20 bg-primary-container/10 text-primary-container transition-transform group-hover:scale-110">
              <Icon name={c.icon} size={26} />
            </span>
            <div>
              <p className="font-display text-body-lg font-semibold text-on-surface">{c.label}</p>
              <p className="text-[12px] text-on-surface-variant">{counts.get(c.id) ?? 0} model</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
