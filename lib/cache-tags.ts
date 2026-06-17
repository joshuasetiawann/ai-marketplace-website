// Cache tags for the public-catalog "use cache" layer (lib/catalog-data.ts).
// Mutations that change what visitors see call revalidateTag() with these —
// see lib/actions/{products,reviews,admin,seller}.ts.

/** Any catalog-visible product data: lists, cards, counts, sitemap. */
export const TAG_PRODUCTS = "products";

/** Store/creator data: creators list, storefront header, seller attribution. */
export const TAG_STORES = "stores";

/** One product's detail-page data (row + reviews). */
export const productTag = (id: string) => `product-${id}`;
