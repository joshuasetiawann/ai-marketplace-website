// Catalog taxonomy + DB→UI product mapper.

export const CATEGORIES = [
  { id: "all", label: "Semua Model", icon: "apps" },
  { id: "vision", label: "Visual", icon: "visibility" },
  { id: "language", label: "Bahasa", icon: "forum" },
  { id: "audio", label: "Audio", icon: "graphic_eq" },
  { id: "video", label: "Video Generatif", icon: "movie" },
  { id: "code", label: "Kode", icon: "code" },
  { id: "data", label: "Data & Analitik", icon: "monitoring" },
] as const;

export const USE_CASES = [
  { id: "business", label: "Bisnis", icon: "domain" },
  { id: "creative", label: "Kreatif", icon: "palette" },
  { id: "developer", label: "Developer", icon: "code" },
  { id: "study", label: "Belajar", icon: "school" },
  { id: "lifestyle", label: "Gaya Hidup", icon: "auto_awesome" },
] as const;

export const TIERS = ["Free", "Pro", "Enterprise"] as const;

/** Static marketing counts per category — docs/design/v2 frame "beranda"/"jelajahi". */
export const CATEGORY_COUNTS: Record<string, string> = {
  vision: "640",
  language: "512",
  audio: "318",
  video: "274",
  code: "406",
  data: "250",
};

export type Capability = { icon: string; title: string; text: string };

export type Model = {
  id: string;
  name: string;
  tagline: string;
  category: string;
  useCases: string[];
  useCaseTags: string[];
  tier: string;
  price: number;
  rating: number;
  reviews: number;
  icon: string;
  art: string[];
  description: string;
  badge?: string;
  createdAt?: string;
  gallery: number;
  specs: Record<string, string>;
  capabilities: Capability[];
  ownerId?: string | null;
  creatorId?: string | null;
};

/** Columns to select from `products` for catalog views. */
export const PRODUCT_COLUMNS =
  "id,name,tagline,category,use_cases,use_case_tags,tier,price_usd,rating,reviews_count,icon,art,description,status,created_at";

type ProductRow = {
  id: string;
  name: string;
  tagline: string | null;
  category: string;
  use_cases: string[] | null;
  use_case_tags: string[] | null;
  tier: string;
  price_usd: number | string;
  rating: number | string;
  reviews_count: number;
  icon: string | null;
  art: string[] | null;
  description: string | null;
  created_at?: string;
  gallery?: number | null;
  specs?: Record<string, string> | null;
  capabilities?: Capability[] | null;
  owner_id?: string | null;
  creator_id?: string | null;
};

export function mapProduct(row: ProductRow): Model {
  const rating = Number(row.rating);
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline ?? "",
    category: row.category,
    useCases: row.use_cases ?? [],
    useCaseTags: row.use_case_tags ?? [],
    tier: row.tier,
    price: Number(row.price_usd),
    rating,
    reviews: row.reviews_count ?? 0,
    icon: row.icon ?? "apps",
    art: row.art ?? ["#0b3a44", "#00e5ff"],
    description: row.description ?? "",
    badge: rating >= 4.85 ? "trending" : undefined,
    createdAt: row.created_at,
    gallery: row.gallery ?? 3,
    specs: (row.specs as Record<string, string>) ?? {},
    capabilities: (row.capabilities as Capability[]) ?? [],
    ownerId: row.owner_id ?? null,
    creatorId: row.creator_id ?? null,
  };
}
