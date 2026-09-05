import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const MAX_ACTIVE_SLIDES = 6;

const createHeroSlideSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().default(true),
  eyebrowLabel: z.string().min(2, "Eyebrow label is required (e.g. 'WOMEN\\'S STREETWEAR ICON')"),
  headlineOverride: z.string().nullable().optional(),
  descriptionOverride: z.string().nullable().optional(),
  ctaPrimaryLabel: z.string().min(1, "Primary CTA label is required (e.g. 'Shop Strata')"),
  ctaSecondaryLabel: z.string().nullable().optional(),
  ctaSecondaryLink: z.string().nullable().optional(),
  ctaPrimaryLink: z.string().nullable().optional(),
  cutoutImageUrl: z.string().url("Invalid image URL").nullable().optional().or(z.literal("")),
});

// GET /api/admin/hero-showcase - List all slides (active & inactive)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const slides = await db.heroSlide.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ slides });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to fetch hero slides", details: err.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/hero-showcase - Create a new hero slide
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    const parsed = createHeroSlideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: parsed.data.productId },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Referenced product does not exist" },
        { status: 404 }
      );
    }

    // Cap active slides at MAX_ACTIVE_SLIDES (6)
    if (parsed.data.isActive) {
      const activeCount = await db.heroSlide.count({
        where: { isActive: true },
      });
      if (activeCount >= MAX_ACTIVE_SLIDES) {
        return NextResponse.json(
          {
            error: `Maximum active slides limit (${MAX_ACTIVE_SLIDES}) reached. Deactivate an existing slide first to keep autoplay pacing optimal.`,
          },
          { status: 400 }
        );
      }
    }

    // Determine displayOrder
    const existingSlides = await db.heroSlide.findMany({});
    const nextOrder =
      parsed.data.displayOrder !== undefined
        ? parsed.data.displayOrder
        : existingSlides.length;

    const newSlide = await db.heroSlide.create({
      data: {
        productId: parsed.data.productId,
        displayOrder: nextOrder,
        isActive: parsed.data.isActive,
        eyebrowLabel: parsed.data.eyebrowLabel.trim().toUpperCase(),
        headlineOverride: parsed.data.headlineOverride?.trim() || null,
        descriptionOverride: parsed.data.descriptionOverride?.trim() || null,
        ctaPrimaryLabel: parsed.data.ctaPrimaryLabel.trim(),
        ctaSecondaryLabel: parsed.data.ctaSecondaryLabel?.trim() || null,
        ctaSecondaryLink: parsed.data.ctaSecondaryLink?.trim() || null,
        ctaPrimaryLink:
          parsed.data.ctaPrimaryLink?.trim() || `/products/${product.slug}`,
        cutoutImageUrl: parsed.data.cutoutImageUrl?.trim() || null,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ slide: newSlide }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to create hero slide", details: err.message },
      { status: 500 }
    );
  }
}
