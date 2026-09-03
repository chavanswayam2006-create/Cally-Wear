import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await db.product.findUnique({
      where: { slug },
    });

    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice;
    const compareAtPrice = product.isOnSale && product.salePrice ? product.basePrice : null;

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        materials: product.materials,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        isOnSale: product.isOnSale,
        discountPercent: product.isOnSale ? product.discountPercent : null,
        displayPrice,
        compareAtPrice,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        images: product.images.map((img: any) => img.url),
        imageObjects: product.images,
        variants: product.variants.map((v: any) => ({
          id: v.id,
          size: v.size,
          stock: v.stock,
          inStock: v.stock > 0,
        })),
        sections: product.sections.map((s: any) => ({
          id: s.section.id,
          name: s.section.name,
          slug: s.section.slug,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch product", message: err.message },
      { status: 500 }
    );
  }
}
