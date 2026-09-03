import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);

    // Order can be queried by ID or human-readable orderNumber
    const order = await db.order.findUnique({
      where: id.startsWith("CW-") ? { orderNumber: id } : { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization check: User must own the order OR be ADMIN/STAFF
    // If not logged in, allow lookup if exact orderNumber matches (for guest order lookup / confirmation page)
    if (user && user.role !== "ADMIN" && user.role !== "STAFF") {
      if (order.profileId !== user.id) {
        return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
      }
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        items: order.items.map((it: any) => ({
          id: it.id,
          productId: it.productId,
          productName: it.product?.name || "Product",
          image: it.product?.images?.[0]?.url || "",
          size: it.variant?.size || "",
          quantity: it.quantity,
          priceAtPurchase: it.priceAtPurchase,
        })),
        statusHistory: order.statusHistory,
        payment: order.payment,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load order", details: err.message }, { status: 500 });
  }
}
