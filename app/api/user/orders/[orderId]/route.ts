import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { db } from "@/lib/security/database";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orderId } = await params;
  const order = db.orders.findById(orderId) || db.orders.findByOrderNumber(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // OBJECT-LEVEL AUTHORIZATION CHECK
  // Customer can only view their own order. Non-customer roles require administrative permission.
  if (session.role === "customer" && order.customerId !== session.userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
    },
  });
}
