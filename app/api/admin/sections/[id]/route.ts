import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const updateSectionSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const existing = await db.section.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugMatch = await db.section.findUnique({ where: { slug: parsed.data.slug } });
      if (slugMatch) {
        return NextResponse.json({ error: `Slug "${parsed.data.slug}" already in use` }, { status: 400 });
      }
    }

    const updated = await db.section.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({
      success: true,
      section: updated,
      message: "Section updated successfully",
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to update section", details: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const existing = await db.section.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await db.section.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to delete section", details: err.message }, { status: 500 });
  }
}
