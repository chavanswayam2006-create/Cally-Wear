import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { authorizeRequest } from "@/lib/security/rbac";
import { db } from "@/lib/security/database";
import { isValidStatusTransition, OrderStatus } from "@/lib/security/order-state";
import { logSecurityEvent } from "@/lib/security/audit-logger";

const statusSchema = z.object({
  status: z.enum([
    "awaiting_payment",
    "pending",
    "confirmed",
    "packed",
    "in_transit",
    "delivered",
    "cancelled",
    "refunded",
    "delivery_failed",
  ]),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  // 1. RBAC Check for status update
  const auth = authorizeRequest(session, "orders:status:update");
  if (!auth.allowed) {
    if (auth.reason === "unauthenticated") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Access denied: insufficient permissions" }, { status: 403 });
  }

  const { orderId } = await params;
  const order = db.orders.findById(orderId) || db.orders.findByOrderNumber(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status value", details: parsed.error.format() }, { status: 400 });
    }

    const newStatus = parsed.data.status as OrderStatus;

    // 2. Sensitive Operation Check: Refund mandates step-up authentication
    if (newStatus === "refunded") {
      const refundAuth = authorizeRequest(session, "orders:refund");
      if (!refundAuth.allowed) {
        if (refundAuth.reason === "step_up_required") {
          return NextResponse.json(
            { error: "Step-up re-authentication required for refunds", stepUpRequired: true },
            { status: 403 }
          );
        }
        return NextResponse.json({ error: "Access denied: missing refund permission" }, { status: 403 });
      }
    }

    // 3. State Machine Transition Validation
    if (!isValidStatusTransition(order.status, newStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition: cannot move order from '${order.status}' to '${newStatus}'`,
          currentStatus: order.status,
          attemptedStatus: newStatus,
        },
        { status: 400 }
      );
    }

    const previousStatus = order.status;
    order.status = newStatus;
    if (newStatus === "refunded") {
      order.paymentStatus = "refunded";
    }
    db.orders.save(order);

    logSecurityEvent({
      eventType: newStatus === "refunded" ? "ORDER_REFUND_INITIATED" : "ORDER_STATE_TRANSITION",
      actor: { userId: session?.userId, email: session?.email, role: session?.role },
      resource: { type: "order", id: order.orderNumber },
      outcome: "SUCCESS",
      riskScore: newStatus === "refunded" ? 40 : 10,
      metadata: { previousStatus, newStatus, notes: parsed.data.notes },
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to '${newStatus}'`,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Status update failed", details: errorMsg }, { status: 500 });
  }
}
