import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const MAX_ACTIVE_SLIDES = 6;

const updateHeroSlideSchema = z.object({
  productId: z.string().min(1).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  eyebrowLabel: z.string().min(2).optional(),
  headlineOverride: z.string().nullable().optional(),
  descriptionOverride: z.string().nullable().optional(),
  ctaPrimaryLabel: z.string().min(1).optional(),
  ctaSecondaryLabel: z.string().nullable().optional(),
  ctaSecondaryLink: z.string().nullable().optional(),
  ctaPrimaryLink: z.string().nullable().optional(),
  cutoutImageUrl: z.string().url("Invalid image URL").nullable().optional().or(z.literal("")),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/hero-showcase/:id
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const slide = await db.heroSlide.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    return NextResponse.json({ slide });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to fetch hero slide", details: err.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/hero-showcase/:id
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const existing = await db.heroSlide.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateHeroSlideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Validation: Require at least 1 active slide at all times
    if (parsed.data.isActive === false && existing.isActive) {
      const activeCount = await db.heroSlide.count({
        where: { isActive: true },
      });
      if (activeCount <= 1) {
        return NextResponse.json(
          {
            error:
              "At least 1 active slide is required at all times. Deactivating the last active slide is not permitted.",
          },
          { status: 400 }
        );
      }
    }

    // Validation: Cap active slides at MAX_ACTIVE_SLIDES (6)
    if (parsed.data.isActive === true && !existing.isActive) {
      const activeCount = await db.heroSlide.count({
        where: { isActive: true },
      });
      if (activeCount >= MAX_ACTIVE_SLIDES) {
        return NextResponse.json(
          {
            error: `Maximum active slides limit (${MAX_ACTIVE_SLIDES}) reached. Deactivate another slide first.`,
          },
          { status: 400 }
        );
      }
    }

    // If changing product, verify product exists
    if (parsed.data.productId && parsed.data.productId !== existing.productId) {
      const product = await db.product.findUnique({
        where: { id: parsed.data.productId },
      });
      if (!product) {
        return NextResponse.json(
          { error: "Referenced product does not exist" },
          { status: 404 }
        );
      }
    }

    const updated = await db.heroSlide.update({
      where: { id },
      data: {
        ...(parsed.data.productId ? { productId: parsed.data.productId } : {}),
        ...(parsed.data.displayOrder !== undefined
          ? { displayOrder: parsed.data.displayOrder }
          : {}),
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
        ...(parsed.data.eyebrowLabel
          ? { eyebrowLabel: parsed.data.eyebrowLabel.trim().toUpperCase() }
          : {}),
        ...(parsed.data.headlineOverride !== undefined
          ? { headlineOverride: parsed.data.headlineOverride?.trim() || null }
          : {}),
        ...(parsed.data.descriptionOverride !== undefined
          ? { descriptionOverride: parsed.data.descriptionOverride?.trim() || null }
          : {}),
        ...(parsed.data.ctaPrimaryLabel
          ? { ctaPrimaryLabel: parsed.data.ctaPrimaryLabel.trim() }
          : {}),
        ...(parsed.data.ctaSecondaryLabel !== undefined
          ? { ctaSecondaryLabel: parsed.data.ctaSecondaryLabel?.trim() || null }
          : {}),
        ...(parsed.data.ctaSecondaryLink !== undefined
          ? { ctaSecondaryLink: parsed.data.ctaSecondaryLink?.trim() || null }
          : {}),
        ...(parsed.data.ctaPrimaryLink !== undefined
          ? { ctaPrimaryLink: parsed.data.ctaPrimaryLink?.trim() || null }
          : {}),
        ...(parsed.data.cutoutImageUrl !== undefined
          ? { cutoutImageUrl: parsed.data.cutoutImageUrl?.trim() || null }
          : {}),
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ slide: updated });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to update hero slide", details: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hero-showcase/:id
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const existing = await db.heroSlide.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    // Validation: Require at least 1 active slide at all times
    if (existing.isActive) {
      const activeCount = await db.heroSlide.count({
        where: { isActive: true },
      });
      if (activeCount <= 1) {
        return NextResponse.json(
          {
            error:
              "At least 1 active slide is required at all times. Cannot delete the only active slide.",
          },
          { status: 400 }
        );
      }
    }

    await db.heroSlide.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Hero slide removed successfully",
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to delete hero slide", details: err.message },
      { status: 500 }
    );
  }
}
