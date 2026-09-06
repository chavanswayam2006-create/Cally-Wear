import { Collection, Product, ProductCategory, ProductGender } from "@/lib/types/product";
import { db } from "@/lib/db";
import { getAllProducts } from "@/lib/data/products";

export const collections: Collection[] = [
  {
    id: "col-monochrome-vault",
    slug: "monochrome-vault",
    title: "Monochrome Vault",
    subtitle: "DROP 04 / SHADOW & LIGHT",
    description:
      "Stripped of color distractions. High-contrast blacks, deep carbon tones, and architectural whites engineered with premium leathers and ballistic meshes.",
    bannerImage:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1800&q=80",
    featuredProductIds: ["cw-prod-01", "cw-prod-02", "cw-prod-03", "cw-prod-15"],
    tags: ["Monochrome", "Limited Drop", "High Contrast"],
  },
  {
    id: "col-street-classics",
    slug: "street-classics",
    title: "Street Classics",
    subtitle: "HERITAGE MEETS CONTEMPORARY",
    description:
      "Everyday icons built for relentless pavement rotation. Low profile cuts, vulcanized outsoles, and durable tumbled leathers that look better with every scuff.",
    bannerImage:
      "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1800&q=80",
    featuredProductIds: ["cw-prod-02", "cw-prod-04", "cw-prod-07", "cw-prod-09", "cw-prod-12"],
    tags: ["Heritage", "Everyday", "Leather"],
  },
  {
    id: "col-performance-lab",
    slug: "performance-lab",
    title: "Performance Lab",
    subtitle: "RACE READY / CARBON FIBER",
    description:
      "Propulsion engineering meets marathon discipline. Dual-density nitrogen foams, full-length curved carbon plates, and featherweight open-mesh racing shells.",
    bannerImage:
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1800&q=80",
    featuredProductIds: ["cw-prod-01", "cw-prod-05", "cw-prod-08", "cw-prod-11"],
    tags: ["Running", "Carbon Plate", "Speed"],
  },
  {
    id: "col-recovery-slides",
    slug: "summer-slides-mules",
    title: "Recovery & Slides",
    subtitle: "OFF-DUTY COMFORT",
    description:
      "Architectural foam comfort for post-training recovery and weekend ease. Waterproof closed-cell EVA construction with ergonomic arch support.",
    bannerImage:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1800&q=80",
    featuredProductIds: ["cw-prod-06", "cw-prod-14"],
    tags: ["Slides", "Mules", "Recovery"],
  },
];

/** Get all collections from the database or fallback seed */
export async function getCollections(): Promise<Collection[]> {
  try {
    if ((db as any).collection && typeof (db as any).collection.findMany === "function") {
      const dbCollections = await (db as any).collection.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
      });
      if (Array.isArray(dbCollections) && dbCollections.length > 0) {
        return dbCollections.map((c: any) => mapPrismaCollection(c));
      }
    }
  } catch {
    // fallback
  }

  return collections;
}

/** Get a collection by slug from the database or fallback seed */
export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  try {
    if ((db as any).collection && typeof (db as any).collection.findUnique === "function") {
      const collection = await (db as any).collection.findUnique({
        where: { slug },
        include: {
          products: {
            include: {
              product: true,
            },
            take: 50,
          },
        },
      });

      if (collection) {
        return mapPrismaCollection(collection);
      }
    }
  } catch {
    // fallback
  }

  return collections.find((c) => c.slug === slug);
}

/** Get products linked to a specific collection */
export async function getProductsByCollection(
  collectionSlug: string
): Promise<{ product: Product; collection: Collection }[]> {
  try {
    if ((db as any).collection && typeof (db as any).collection.findUnique === "function") {
      const collection = await (db as any).collection.findUnique({
        where: { slug: collectionSlug },
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (collection && Array.isArray(collection.products) && collection.products.length > 0) {
        const mappedCol = mapPrismaCollection(collection);
        return collection.products.map((cp: any) => ({
          product: mapPrismaProduct(cp.product),
          collection: mappedCol,
        }));
      }
    }
  } catch {
    // fallback
  }

  // Fallback to matching products from catalog
  const staticCol = collections.find((c) => c.slug === collectionSlug);
  if (!staticCol) return [];

  const allProducts = await getAllProducts();
  const matched = allProducts.filter(
    (p) =>
      (staticCol.featuredProductIds && staticCol.featuredProductIds.includes(p.id)) ||
      (staticCol.tags && p.tags?.some((t) => staticCol.tags?.includes(t)))
  );

  return matched.map((product) => ({
    product,
    collection: staticCol,
  }));
}

/** Map Prisma Collection to canonical Collection type */
function mapPrismaCollection(c: any): Collection {
  return {
    id: c.id,
    slug: c.slug,
    title: c.name || c.title,
    subtitle: c.description || c.subtitle || "",
    bannerImage: c.bannerImage || "",
    tags: Array.isArray(c.tags) ? c.tags : [],
  };
}

/** Map Prisma Product to canonical Product type (reused from products layer) */
function mapPrismaProduct(p: any): Product {
  const categoryMap: Record<string, ProductCategory> = {
    SNEAKERS: "SNEAKERS",
    SLIDES: "SLIDES",
    BOOTS: "BOOTS",
    SANDALS: "SANDALS",
    RUNNING: "RUNNING",
    STREETWEAR: "STREETWEAR",
  };
  const genderMap: Record<string, ProductGender> = {
    MEN: "MEN",
    WOMEN: "WOMEN",
    UNISEX: "UNISEX",
  };

  const displayPrice = p.isOnSale && p.salePrice ? p.salePrice : p.basePrice;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: categoryMap[p.category] || "STREETWEAR",
    gender: genderMap[p.gender] || "UNISEX",
    subCategory: p.subCategory || (p.category ? String(p.category).toLowerCase() : "sneakers"),
    price: displayPrice,
    compareAtPrice: p.compareAtPrice,
    images: Array.isArray(p.images)
      ? p.images.map((img: any) => (typeof img === "string" ? img : img.url))
      : [],
    colors: [
      {
        name: "Obsidian Core",
        hex: "#161616",
        images: Array.isArray(p.images)
          ? p.images.map((img: any) => (typeof img === "string" ? img : img.url))
          : [],
      },
    ],
    sizes: p.variants?.map((v: any) => v.size) || ["UK 7", "UK 8", "UK 9", "UK 10"],
    description: p.description || "",
    materials: p.materials,
    stock: p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
    isNew: p.isNewArrival,
    isFeatured: p.isFeatured,
    tags: p.tags || [],
    details: p.details || [],
  };
}
