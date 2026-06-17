import Link from "next/link";
import Icon from "@/components/Icon";
import ModelArtwork from "@/components/ModelArtwork";
import { EmptyState } from "@/components/common";
import { getStores } from "@/lib/catalog-data";

export const metadata = { title: "Kreator — Nexora AI" };

export default async function CreatorsPage() {
  const stores = await getStores();

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
      <h1 className="mb-2 font-display text-headline-md text-on-surface md:text-headline-lg">Kreator</h1>
      <p className="mb-8 text-body-md text-on-surface-variant">Studio & kreator yang membangun di Nexora.</p>

      {stores.length === 0 ? (
        <EmptyState icon="storefront" title="Belum ada kreator" message="Jadilah yang pertama membuka toko di Nexora." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <Link
              key={s.owner_id}
              href={`/creator/${s.handle}`}
              className="flex items-center gap-4 rounded-xl glass-panel p-6 electric-glow-hover transition-colors hover:border-primary-container/30"
            >
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10">
                <ModelArtwork seed={s.handle} className="h-full w-full" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-body-lg font-semibold text-on-surface">{s.name}</p>
                {s.tagline && <p className="truncate text-body-sm text-on-surface-variant">{s.tagline}</p>}
                {s.category && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[12px] capitalize text-outline">
                    <Icon name="category" size={12} /> {s.category}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
