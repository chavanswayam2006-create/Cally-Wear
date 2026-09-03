import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionSlug = searchParams.get("section");
    const onSaleOnly = searchParams.get("sale") === "true";
    const featuredOnly = searchParams.get("featured") === "true";
    const newArrivalOnly = searchParams.get("new") === "true";
    const query = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      status: "PUBLISHED", // DRAFT and ARCHIVED products NEVER show on the storefront
    };

    if (onSaleOnly) {
      where.isOnSale = true;
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    if (newArrivalOnly) {
      where.isNewArrival = true;
    }

    if (sectionSlug) {
      where.sections = {
        some: {
          section: {
            slug: sectionSlug,
          },
        },
      };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.product.count({ where }),
    ]);

    // Format products according to Section 8:
    // If isOnSale = false, display basePrice only even if salePrice is populated.
    const formattedProducts = products.map((p: any) => {
      const displayPrice = p.isOnSale && p.salePrice ? p.salePrice : p.basePrice;
      const compareAtPrice = p.isOnSale && p.salePrice ? p.basePrice : null;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        materials: p.materials,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        isOnSale: p.isOnSale,
        discountPercent: p.isOnSale ? p.discountPercent : null,
        displayPrice,
        compareAtPrice,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        images: p.images.map((img: any) => img.url),
        imageObjects: p.images,
        variants: p.variants.map((v: any) => ({
          id: v.id,
          size: v.size,
          stock: v.stock,
          inStock: v.stock > 0,
        })),
        sections: p.sections.map((s: any) => ({
          id: s.section.id,
          name: s.section.name,
          slug: s.section.slug,
        })),
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch products", message: err.message },
      { status: 500 }
    );
  }
}
