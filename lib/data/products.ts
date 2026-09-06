import { Product, ProductCategory, ProductGender } from "@/lib/types/product";
import { db, localDb } from "@/lib/db";

/**
 * Canonical product catalog — read exclusively from Prisma DB.
 * Every page, component, and API route must import from here.
 * No page may define or fetch its own product list independently.
 */

/** Get all active published products from the database */
export async function getAllProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return products
    .filter((p: any) => p.isActive !== false)
    .map((p: any) => mapPrismaProduct(p));
}

/** Get a single product by slug, or undefined if not found */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const normalizedSlug = slug === "cally-apex-tech-runner" ? "apex-tech-runner" : slug;
  let product = await db.product.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!product && slug !== normalizedSlug) {
    product = await db.product.findUnique({
      where: { slug },
    });
  }

  if (!product || product.isActive === false || (product.status && product.status !== "PUBLISHED")) {
    return undefined;
  }

  return mapPrismaProduct(product);
}

/** Get products filtered by canonical category enum */
export async function getProductsByCategory(
  category: ProductCategory
): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED", category: category as any },
    orderBy: { createdAt: "desc" },
  });

  return products
    .filter((p: any) => p.isActive !== false)
    .map((p: any) => mapPrismaProduct(p));
}

/** Get all featured products */
export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { createdAt: "desc" },
  });

  return products
    .filter((p: any) => p.isActive !== false)
    .map((p: any) => mapPrismaProduct(p));
}

/** Get new arrival products */
export async function getNewArrivals(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED", isNewArrival: true },
    orderBy: { createdAt: "desc" },
  });

  return products
    .filter((p: any) => p.isActive !== false)
    .map((p: any) => mapPrismaProduct(p));
}

/** Get best seller products */
export async function getBestSellers(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return products
    .filter((p: any) => p.isActive !== false)
    .filter((p: any) => {
      const isNewArrival = p.isNewArrival || p.tags?.includes("Drop 04");
      const isBestSeller = p.isFeatured || (p.tags?.includes("Best Seller") || p.tags?.includes("Essential") || p.tags?.includes("Icon"));
      return isBestSeller && !isNewArrival;
    })
    .map((p: any) => mapPrismaProduct(p));
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
      (p: Product) =>
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
  const categoryMap: Record<string, ProductCategory> = {
    SNEAKERS: "SNEAKERS",
    SLIDES: "SLIDES",
    BOOTS: "BOOTS",
    SANDALS: "SANDALS",
    RUNNING: "RUNNING",
    STREETWEAR: "STREETWEAR",
    men: "men",
    women: "women",
    unisex: "unisex",
  };
  const genderMap: Record<string, ProductGender> = {
    MEN: "MEN",
    WOMEN: "WOMEN",
    UNISEX: "UNISEX",
  };

  const images = Array.isArray(p.images)
    ? p.images.map((img: any) => (typeof img === "string" ? img : img.url))
    : [];

  const category = categoryMap[p.category] || "STREETWEAR";
  const gender = genderMap[p.gender] || "UNISEX";
  const subCategory = p.subCategory || (p.category ? String(p.category).toLowerCase() : "sneakers");

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category,
    gender,
    subCategory,
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
    description: p.description || "",
    materials: p.materials,
    stock: p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
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
  if (Array.isArray(p.tags)) {
    return p.tags.filter((t: string) => Boolean(t));
  }

  const derived: string[] = [];
  if (p.isOnSale) derived.push("Sale");
  if (p.isNewArrival) derived.push("Drop 04");
  if (p.isFeatured) derived.push("Best Seller");
  return derived;
}

/** Synchronous fallback reading from localDb store or seed */
export function getSyncProducts(): Product[] {
  try {
    const state = (localDb as any)?.state;
    if (state && Array.isArray(state.products) && state.products.length > 0) {
      const published = state.products.filter(
        (p: any) => p.status === "PUBLISHED" && p.isActive !== false
      );
      if (published.length > 0) {
        return published.map((p: any) =>
          mapPrismaProduct({
            ...p,
            images:
              state.productImages
                ?.filter((img: any) => img.productId === p.id)
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder) || [],
            variants:
              state.productVariants?.filter((v: any) => v.productId === p.id) || [],
          })
        );
      }
    }
  } catch {
    // fallback
  }
  return [];
}

/** Synchronous products array Proxy for backwards compatibility */
export const products: Product[] = new Proxy([] as Product[], {
  get(target, prop) {
    const list = getSyncProducts();
    const val = (list as any)[prop];
    if (typeof val === "function") {
      return val.bind(list);
    }
    return val;
  },
  ownKeys() {
    return Reflect.ownKeys(getSyncProducts());
  },
  getOwnPropertyDescriptor(target, prop) {
    return Object.getOwnPropertyDescriptor(getSyncProducts(), prop);
  },
});