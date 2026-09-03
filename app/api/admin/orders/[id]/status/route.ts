import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, OrderStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const statusSchema = z.object({
  status: z.enum([
    "PLACED",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
  ]),
  note: z.string().optional(),
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
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, note } = parsed.data;

    // Execute status update with event log and stock restoration if cancelled
    const updated = await db.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        statusNote: note || `Status updated to ${status} by admin`,
        updatedBy: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Order status updated to ${status}`,
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to update order status", details: err.message }, { status: 500 });
  }
}
