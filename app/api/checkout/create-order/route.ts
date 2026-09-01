import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, StoredOrder } from "@/lib/security/database";
import { calculateServerOrderTotals, MAX_COD_ORDER_VALUE } from "@/lib/security/pricing";
import { atomicallyDeductStock } from "@/lib/security/inventory";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { generateTrackingSecret } from "@/lib/security/token";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      size: z.string().min(1),
      color: z.string().min(1),
      quantity: z.number().int().min(1).max(5),
    })
  ).min(1),
  shippingAddress: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email().max(120),
    phone: z.string().min(10).max(20),
    address: z.string().min(5).max(200),
    apartment: z.string().optional(),
    city: z.string().min(2).max(60),
    state: z.string().min(2).max(60),
    pincode: z.string().min(6).max(6),
    country: z.string().optional().default("India"),
  }),
  shippingMethod: z.enum(["standard", "priority"]).default("standard"),
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"]).default("upi"),
  promoCode: z.string().optional().nullable(),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const idempotencyKey = req.headers.get("idempotency-key") || req.headers.get("x-idempotency-key") || "";

  // 1. Rate Limiting
  const rateLimit = checkRateLimit(`checkout_${ip}`, {
    windowMs: 10 * 60 * 1000,
    maxRequests: 15,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout requests. Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  // 2. Check Idempotency Store
  if (idempotencyKey) {
    const existing = db.idempotency.get(idempotencyKey);
    if (existing) {
      return NextResponse.json(existing.response, { status: 200 });
    }
  }

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { items, shippingAddress, shippingMethod, paymentMethod, promoCode } = parsed.data;

    // 3. Optional authenticated session association
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
    const session = getSession(sessionId);
    const customerId = session ? session.userId : undefined;

    // 4. Server-Authoritative Price and Total Recalculation
    const calculation = calculateServerOrderTotals({
      items,
      promoCode,
      shippingMethod,
    });

    if (!calculation.valid) {
      return NextResponse.json({ error: calculation.error || "Price calculation failed" }, { status: 400 });
    }

    // 5. COD Abuse Prevention & Velocity Rules
    if (paymentMethod === "cod") {
      if (calculation.total > MAX_COD_ORDER_VALUE) {
        return NextResponse.json(
          { error: `Cash on Delivery is limited to orders up to ₹${MAX_COD_ORDER_VALUE.toLocaleString("en-IN")}. Please choose an online payment method.` },
          { status: 400 }
        );
      }
    }

    // 6. Atomic Inventory Reservation & Concurrency Lock
    const stockDeduction = await atomicallyDeductStock(
      items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    );

    if (!stockDeduction.success) {
      return NextResponse.json(
        { error: stockDeduction.error || "One or more items are out of stock." },
        { status: 409 }
      );
    }

    // 7. Generate Secure Order Identifiers
    const orderNumber = `CW-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingSecret = generateTrackingSecret();
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newOrder: StoredOrder = {
      id: orderId,
      orderNumber,
      customerId,
      trackingSecret,
      status: paymentMethod === "cod" ? "pending" : "awaiting_payment",
      items: calculation.items,
      subtotal: calculation.subtotal,
      discount: calculation.discountAmount,
      shipping: calculation.shippingFee,
      total: calculation.total,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        apartment: shippingAddress.apartment,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || "India",
      },
      paymentMethod:
        paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod === "card"
          ? "Credit / Debit Card"
          : paymentMethod === "netbanking"
          ? "Net Banking"
          : "UPI",
      paymentStatus: "pending",
      trackingNumber: `EXP-IN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      estimatedDelivery: "2–5 business days",
      createdAt: new Date().toISOString(),
      idempotencyKey: idempotencyKey || undefined,
    };

    db.orders.save(newOrder);

    logSecurityEvent({
      eventType: "ORDER_CREATED",
      actor: { userId: customerId, email: shippingAddress.email, ip },
      resource: { type: "order", id: orderNumber },
      outcome: "SUCCESS",
      metadata: {
        total: calculation.total,
        paymentMethod,
        itemCount: calculation.items.length,
      },
    });

    const responsePayload = {
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount,
        shipping: newOrder.shipping,
        total: newOrder.total,
        paymentStatus: newOrder.paymentStatus,
        trackingSecret: newOrder.trackingSecret,
        trackingNumber: newOrder.trackingNumber,
        estimatedDelivery: newOrder.estimatedDelivery,
      },
    };

    // Save to idempotency store if key was provided
    if (idempotencyKey) {
      db.idempotency.set(idempotencyKey, {
        orderNumber,
        createdAt: Date.now(),
        response: responsePayload,
      });
    }

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Order creation failed", details: errorMsg }, { status: 500 });
  }
}
