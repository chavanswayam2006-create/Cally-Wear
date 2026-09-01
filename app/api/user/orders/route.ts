import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { db } from "@/lib/security/database";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // OBJECT-LEVEL AUTHORIZATION: Only query orders belonging to authenticated session userId
  const customerOrders = db.orders.findByCustomerId(session.userId);

  return NextResponse.json({
    orders: customerOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      items: o.items,
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      trackingNumber: o.trackingNumber,
      estimatedDelivery: o.estimatedDelivery,
      createdAt: o.createdAt,
    })),
  });
}
