import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const createShowcaseItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  overrideImageUrl: z.string().url("Invalid image URL").nullable().optional(),
  highlightLabel: z.string().min(2, "Highlight label is required (e.g. 'NITROGEN-INJECTED FOAM')"),
  highlightDescription: z.string().min(5, "Highlight description is required"),
});

// GET /api/admin/scroll-showcase
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const items = await db.scrollShowcaseItem.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ items });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to fetch showcase items", details: err.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/scroll-showcase
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    const parsed = createShowcaseItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: parsed.data.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Referenced product does not exist" },
        { status: 404 }
      );
    }

    const newItem = await db.scrollShowcaseItem.create({
      data: {
        productId: parsed.data.productId,
        displayOrder: parsed.data.displayOrder,
        isActive: parsed.data.isActive,
        overrideImageUrl: parsed.data.overrideImageUrl || null,
        highlightLabel: parsed.data.highlightLabel.trim().toUpperCase(),
        highlightDescription: parsed.data.highlightDescription.trim(),
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to create showcase item", details: err.message },
      { status: 500 }
    );
  }
}
