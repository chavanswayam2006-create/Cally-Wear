import { Collection, Product } from "@/lib/types/product";
import { db } from "@/lib/db";

/** Get all collections from the database */
export async function getCollections(): Promise<Collection[]> {
  const collections = await db.collection.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });

  return collections.map(mapPrismaCollection);
}

/** Get a collection by slug from the database */
export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  const collection = await db.collection.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              images: true,
              category: true,
              gender: true,
            },
          },
        },
        take: 50, // limit to prevent too many joins
      },
    },
  });

  if (!collection) {
    return undefined;
  }

  return mapPrismaCollection(collection);
}

/** Get products linked to a specific collection */
export async function getProductsByCollection(
  collectionSlug: string
): Promise<{ product: Product; collection: Collection }[]> {
  const collection = await db.collection.findUnique({
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

  if (!collection || collection.products.length === 0) {
    return [];
  }

  return collection.products.map((cp: any) => ({
    product: mapPrismaProduct(cp.product),
    collection: mapPrismaCollection(collection)[0],
  }));
}

/** Map Prisma Collection to canonical Collection type */
function mapPrismaCollection(c: any): Collection {
  return {
    id: c.id,
    slug: c.slug,
    title: c.name,
    subtitle: c.description || "",
    bannerImage: c.bannerImage || "",
  };
}

/** Map Prisma Product to canonical Product type (reused from products layer) */
function mapPrismaProduct(p: any): Product {
  const categoryMap: Record<string, "SNEAKERS" | "SLIDES" | "BOOTS" | "SANDALS" | "RUNNING" | "STREETWEAR"> = {
    SNEAKERS: "SNEAKERS",
    SLIDES: "SLIDES",
    BOOTS: "BOOTS",
    SANDALS: "SANDALS",
    RUNNING: "RUNNING",
    STREETWEAR: "STREETWEAR",
  };
  const genderMap: Record<string, "MEN" | "WOMEN" | "UNISEX"> = {
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
    price: displayPrice,
    compareAtPrice: p.compareAtPrice,
    images: p.images?.map((img: any) => img.url) || [],
    colors: [
      {
        name: "Obsidian Core",
        hex: "#161616",
        images: p.images?.map((img: any) => img.url) || [],
      },
    ],
    sizes: p.variants?.map((v: any) => v.size) || ["UK 7", "UK 8", "UK 9", "UK 10"],
    description: p.description,
    materials: p.materials,
    stock: p.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0,
    isNew: p.isNewArrival,
    isFeatured: p.isFeatured,
    tags: p.tags || [],
    details: p.details || [],
  };
}

