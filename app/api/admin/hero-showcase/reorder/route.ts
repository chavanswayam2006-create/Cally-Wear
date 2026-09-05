import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      displayOrder: z.number().int(),
    })
  ).min(1, "At least one item required"),
});

// POST /api/admin/hero-showcase/reorder - Batch update displayOrder
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid reorder payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    for (const item of parsed.data.items) {
      await db.heroSlide.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      });
    }

    const updatedSlides = await db.heroSlide.findMany({
      orderBy: { displayOrder: "asc" },
      include: { product: true },
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      slides: updatedSlides,
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: "Failed to reorder hero slides", details: err.message },
      { status: 500 }
    );
  }
}
