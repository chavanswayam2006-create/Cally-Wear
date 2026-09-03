import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, ProductStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2).optional(),
  sku: z.string().min(2, "SKU is required"),
  description: z.string().min(10, "Description is required"),
  materials: z.string().min(2, "Materials description is required"),
  basePrice: z.number().min(0, "Base price must be non-negative"),
  salePrice: z.number().min(0).nullable().optional(),
  isOnSale: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  sections: z.array(z.string()).default([]), // array of section IDs
  sizes: z.array(
    z.object({
      size: z.string().min(1),
      stock: z.number().int().min(0),
    })
  ).min(1, "At least one size variant is required"),
  images: z.array(
    z.object({
      url: z.string().min(1),
      altText: z.string().optional().nullable(),
      sortOrder: z.number().int().default(0),
    })
  ).default([]),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ProductStatus | null;
    const sectionId = searchParams.get("sectionId");
    const onSale = searchParams.get("onSale");
    const query = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (onSale === "true") where.isOnSale = true;
    if (onSale === "false") where.isOnSale = false;

    if (sectionId) {
      where.sections = { some: { sectionId } };
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
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { orderBy: { size: "asc" } },
          sections: { include: { section: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const formatted = products.map((p: any) => {
      const displayPrice = p.isOnSale && p.salePrice ? p.salePrice : p.basePrice;
      const compareAtPrice = p.isOnSale && p.salePrice ? p.basePrice : null;
      const totalStock = p.variants.reduce((sum: number, v: any) => sum + v.stock, 0);

      return {
        ...p,
        displayPrice,
        compareAtPrice,
        totalStock,
      };
    });

    return NextResponse.json({
      products: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to fetch products", details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const rawBody = await req.json();
    const body = {
      ...rawBody,
      slug:
        rawBody.slug ||
        (rawBody.name
          ? rawBody.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
          : undefined),
      sizes: rawBody.sizes || rawBody.variants || [],
      sections: rawBody.sections || rawBody.sectionIds || [],
    };
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const finalSlug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check unique SKU and Slug
    const [existingSku, existingSlug] = await Promise.all([
      db.product.findUnique({ where: { sku: data.sku } }),
      db.product.findUnique({ where: { slug: finalSlug } }),
    ]);

    if (existingSku) {
      return NextResponse.json({ error: `Product with SKU "${data.sku}" already exists` }, { status: 400 });
    }
    if (existingSlug) {
      return NextResponse.json({ error: `Product with Slug "${finalSlug}" already exists` }, { status: 400 });
    }

    const discountPercent =
      data.isOnSale && data.salePrice && data.basePrice > 0
        ? Math.round(((data.basePrice - data.salePrice) / data.basePrice) * 100)
        : null;

    const created = await db.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        sku: data.sku,
        description: data.description,
        materials: data.materials,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        isOnSale: data.isOnSale,
        discountPercent,
        isFeatured: data.isFeatured,
        isNewArrival: data.isNewArrival,
        status: data.status,
        images: {
          create: data.images.map((img, idx) => ({
            url: img.url,
            altText: img.altText || `${data.name} image ${idx + 1}`,
            sortOrder: img.sortOrder ?? idx,
          })),
        },
        variants: {
          create: data.sizes.map((s) => ({
            size: s.size,
            stock: s.stock,
          })),
        },
        sections: {
          create: data.sections.map((sectionId) => ({
            sectionId,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: created,
      message: "Product created successfully",
    }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to create product", details: err.message }, { status: 500 });
  }
}
