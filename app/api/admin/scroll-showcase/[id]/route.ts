import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const updateShowcaseItemSchema = z.object({
  productId: z.string().min(1).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  overrideImageUrl: z.string().url("Invalid image URL").nullable().optional(),
  highlightLabel: z.string().min(2).optional(),
  highlightDescription: z.string().min(5).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/scroll-showcase/:id
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const existing = await db.scrollShowcaseItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Showcase item not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updateShowcaseItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (parsed.data.productId) {
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

    const updated = await db.scrollShowcaseItem.update({
      where: { id },
      data: {
        ...(parsed.data.productId ? { productId: parsed.data.productId } : {}),
        ...(parsed.data.displayOrder !== undefined ? { displayOrder: parsed.data.displayOrder } : {}),
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
        ...(parsed.data.overrideImageUrl !== undefined ? { overrideImageUrl: parsed.data.overrideImageUrl } : {}),
        ...(parsed.data.highlightLabel ? { highlightLabel: parsed.data.highlightLabel.trim().toUpperCase() } : {}),
        ...(parsed.data.highlightDescription ? { highlightDescription: parsed.data.highlightDescription.trim() } : {}),
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to update showcase item", details: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/scroll-showcase/:id
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const existing = await db.scrollShowcaseItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Showcase item not found" },
        { status: 404 }
      );
    }

    await db.scrollShowcaseItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Showcase item removed" });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to delete showcase item", details: err.message },
      { status: 500 }
    );
  }
}
