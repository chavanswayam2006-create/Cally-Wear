import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const trackingSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
  carrier: z.string().min(1, "Carrier name is required"),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = trackingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { trackingNumber, carrier } = parsed.data;

    const updated = await db.order.update({
      where: { id },
      data: {
        trackingNumber,
        carrier,
        statusNote: `Tracking updated: ${carrier} - ${trackingNumber}`,
        updatedBy: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: "Tracking details saved successfully",
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to update tracking", details: err.message }, { status: 500 });
  }
}
