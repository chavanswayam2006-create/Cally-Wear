import { Product } from "@/lib/types/product";
import { db } from "@/lib/db";

/**
 * Canonical product catalog — read exclusively from Prisma DB.
 * Every page, component, and API route must import from here.
 * No page may define or fetch its own product list independently.
 */

/** Get all active published products from the database */
export async function getAllProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => mapPrismaProduct(p));
}

/** Get a single product by slug, or undefined if not found */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await db.product.findUnique({
    where: { slug },
  });

  if (!product || !product.isActive || product.status !== "PUBLISHED") {
    return undefined;
  }

  return mapPrismaProduct(product);
}

/** Get products filtered by canonical category enum */
export async function getProductsByCategory(
  category: "SNEAKERS" | "SLIDES" | "BOOTS" | "SANDALS" | "RUNNING" | "STREETWEAR"
): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true, status: "PUBLISHED", category },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => mapPrismaProduct(p));
}

/** Get all featured products */
export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true, status: "PUBLISHED", isFeatured: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => mapPrismaProduct(p));
}

/** Get new arrival products */
export async function getNewArrivals(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true, status: "PUBLISHED", isNewArrival: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => mapPrismaProduct(p));
}

/** Get best seller products */
export async function getBestSellers(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { isActive: true, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return products
    .filter((p) => {
      const isNewArrival = p.isNewArrival || p.tags?.includes("Drop 04");
      const isBestSeller = p.isFeatured || (p.tags?.includes("Best Seller") || p.tags?.includes("Essential") || p.tags?.includes("Icon"));
      return isBestSeller && !isNewArrival;
    })
    .map((p) => mapPrismaProduct(p));
}

/** Get related products based on category/gender */
export async function getRelatedProducts(
  currentProductId: string,
  limit: number = 4
): Promise<Product[]> {
  const current = await getProductBySlug(currentProductId);
  if (!current) {
    return getAllProducts().then((p) => p.slice(0, limit));
  }

  const products = await getAllProducts();
  return products
    .filter(
      (p) =>
        p.id !== current.id &&
        (p.category === current.category || p.gender === current.gender)
    )
    .slice(0, limit);
}

/** Map a Prisma Product to the canonical Product type */
function mapPrismaProduct(p: any): Product {
  const displayPrice = p.isOnSale && p.salePrice ? p.salePrice : p.basePrice;
  const compareAtPrice = p.isOnSale && p.salePrice ? p.basePrice : undefined;

  // Map category and gender from enum to string
  const categoryMap: Record<string, string> = {
    SNEAKERS: "SNEAKERS",
    SLIDES: "SLIDES",
    BOOTS: "BOOTS",
    SANDALS: "SANDALS",
    RUNNING: "RUNNING",
    STREETWEAR: "STREETWEAR",
  };
  const genderMap: Record<string, string> = {
    MEN: "MEN",
    WOMEN: "WOMEN",
    UNISEX: "UNISEX",
  };

  const images = p.images.map((img: any) => img.url);

  // Build colors array from variant/color data
  const colors = p.variants
    ? [...new Set(p.variants.map((v: any) => ({ name: v.size, hex: "", images })))]
    : [];

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: categoryMap[p.category] || "STREETWEAR",
    gender: genderMap[p.gender] || "UNISEX",
    price: displayPrice,
    compareAtPrice,
    images,
    colors: [
      {
        name: "Obsidian Core",
        hex: "#161616",
        images,
      },
    ],
    sizes: p.variants?.map((v: any) => v.size) || ["UK 7", "UK 8", "UK 9", "UK 10"],
    description: p.description,
    materials: p.materials,
    stock: p.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0,
    isNew: p.isNewArrival,
    isFeatured: p.isFeatured,
    tags: tagsFromPrismaProduct(p),
    details: [
      "Dynamic heel stabilizer clip for rotational lock-in",
      "Ergonomic dual-density anatomical footbed",
      p.materials || "Premium construction",
    ],
  };
}

/** Extract tag array from Prisma product (tags stored as string array) */
function tagsFromPrismaProduct(p: any): string[] {
  // If the product has a tags field, use it; otherwise derive from known tags
  if (Array.isArray(p.tags)) {
    return p.tags.filter((t: string) => Boolean(t));
  }

  // Derive tags from known patterns
  const derived: string[] = [];
  if (p.isOnSale) derived.push("Sale");
  if (p.isNewArrival) derived.push("Drop 04");
  if (p.isFeatured) derived.push("Best Seller");
  return derived;
}

/** Legacy export — kept for backward compatibility during transition */
export const { products, getProductBySlug: legacyGetProductBySlug, getProductsByCategory: legacyGetProductsByCategory } = (() => {
  // This wrapper maintains the old export shape so existing imports don't break immediately.
  // All new code should import the async functions above.
  return {
    products: async () => getAllProducts(),
    getProductBySlug: getProductBySlug,
    getProductsByCategory: getProductsByCategory,
  };
})();