import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sku: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  materials: z.string().min(2).optional(),
  basePrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).nullable().optional(),
  isOnSale: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  sections: z.array(z.string()).optional(),
  sizes: z.array(
    z.object({
      size: z.string().min(1),
      stock: z.number().int().min(0),
    })
  ).optional(),
  images: z.array(
    z.object({
      url: z.string().min(1),
      altText: z.string().optional().nullable(),
      sortOrder: z.number().int().default(0),
    })
  ).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        ...product,
        sectionIds: product.sections.map((s: any) => s.sectionId),
        sectionNames: product.sections.map((s: any) => s.section.name),
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to fetch product", details: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check uniqueness if SKU or Slug is changing
    if (data.sku && data.sku !== existing.sku) {
      const match = await db.product.findUnique({ where: { sku: data.sku } });
      if (match) return NextResponse.json({ error: `SKU "${data.sku}" already in use` }, { status: 400 });
    }

    if (data.slug && data.slug !== existing.slug) {
      const match = await db.product.findUnique({ where: { slug: data.slug } });
      if (match) return NextResponse.json({ error: `Slug "${data.slug}" already in use` }, { status: 400 });
    }

    const basePrice = data.basePrice !== undefined ? data.basePrice : existing.basePrice;
    const salePrice = data.salePrice !== undefined ? data.salePrice : existing.salePrice;
    const isOnSale = data.isOnSale !== undefined ? data.isOnSale : existing.isOnSale;

    const discountPercent =
      isOnSale && salePrice && basePrice > 0
        ? Math.round(((basePrice - salePrice) / basePrice) * 100)
        : null;

    const updatePayload: any = {
      ...data,
      basePrice,
      salePrice,
      isOnSale,
      discountPercent,
    };

    if (data.images) {
      updatePayload.images = {
        create: data.images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || `${data.name || existing.name} image ${idx + 1}`,
          sortOrder: img.sortOrder ?? idx,
        })),
      };
    }

    if (data.sizes) {
      updatePayload.variants = {
        create: data.sizes.map((s) => ({
          size: s.size,
          stock: s.stock,
        })),
      };
    }

    if (data.sections) {
      updatePayload.sections = {
        create: data.sections.map((sectionId) => ({
          sectionId,
        })),
      };
    }

    const updated = await db.product.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json({
      success: true,
      product: updated,
      message: "Product updated successfully",
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to update product", details: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Never hard-delete if referenced in orders; archive instead per Section 5.1
    const deletedOrArchived = await db.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      product: deletedOrArchived,
      message: deletedOrArchived.status === "ARCHIVED"
        ? "Product has past orders so it was archived instead of permanently deleted"
        : "Product deleted permanently",
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to delete product", details: err.message }, { status: 500 });
  }
}
