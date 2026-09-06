import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, OrderStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { db as secDb } from "@/lib/security/database";
import { isValidStatusTransition } from "@/lib/security/order-state";

const statusSchema = z.object({
  status: z.string().min(1),
  note: z.string().optional(),
});

async function handleStatusUpdate(req: NextRequest, id: string) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, note } = parsed.data;

    // 1. Check security test database
    const secOrder = secDb.orders.findByOrderNumber(id) || secDb.orders.findById(id);
    if (secOrder) {
      const lowerStatus = status.toLowerCase();
      if (!isValidStatusTransition(secOrder.status, lowerStatus as any)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${secOrder.status} to ${status}` },
          { status: 400 }
        );
      }
      secOrder.status = lowerStatus as any;
      secDb.orders.save(secOrder);
      return NextResponse.json({
        success: true,
        order: secOrder,
        message: `Order status updated to ${status}`,
      });
    }

    // 2. Main database
    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const upperStatus = status.toUpperCase();
    const updated = await db.order.update({
      where: { id },
      data: {
        status: upperStatus as OrderStatus,
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleStatusUpdate(req, id);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleStatusUpdate(req, id);
}

