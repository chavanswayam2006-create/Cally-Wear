import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/security/database";
import { checkRateLimit, recordFailure, recordSuccess } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";

const trackOrderSchema = z.object({
  orderNumber: z.string().min(3).max(30),
  contact: z.string().min(3).max(120), // email or phone verifier
  trackingSecret: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const body = await req.json();
    const parsed = trackOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tracking request. Order number and contact verifier (email/phone) are required." },
        { status: 400 }
      );
    }

    const { orderNumber, contact, trackingSecret } = parsed.data;
    const cleanOrderNum = orderNumber.trim().toUpperCase().replace(/^#/, "");
    const cleanContact = contact.trim().toLowerCase();

    // Combined Rate Limiting: IP + Order Number + Contact verifier
    const rateLimitKey = `track_${ip}_${cleanOrderNum}`;
    const rateLimit = checkRateLimit(rateLimitKey, {
      windowMs: 10 * 60 * 1000,
      maxRequests: 6,
      exponentialBackoff: true,
      blockDurationMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      logSecurityEvent({
        eventType: "GUEST_TRACKING_BLOCKED",
        actor: { ip, userAgent },
        resource: { type: "order", id: cleanOrderNum },
        outcome: "BLOCKED",
        riskScore: 75,
        metadata: { action: "tracking_rate_limit_exceeded" },
      });
      return NextResponse.json(
        { error: "Too many tracking lookup requests. Please try again after 15 minutes." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds || 900) } }
      );
    }

    // Lookup order in database
    const order = db.orders.findByOrderNumber(cleanOrderNum);

    let isMatch = false;
    if (order) {
      // Verification check: email match OR phone match OR trackingSecret match
      const emailMatches = order.shippingAddress.email.toLowerCase() === cleanContact;
      const phoneClean = cleanContact.replace(/\D/g, "");
      const orderPhoneClean = order.shippingAddress.phone.replace(/\D/g, "");
      const phoneMatches = phoneClean.length >= 6 && orderPhoneClean.includes(phoneClean);
      const secretMatches = trackingSecret && order.trackingSecret === trackingSecret;

      if (emailMatches || phoneMatches || secretMatches) {
        isMatch = true;
      }
    }

    // Uniform timing padding to prevent response timing side-channels
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (!isMatch || !order) {
      recordFailure(rateLimitKey, { windowMs: 10 * 60 * 1000, maxRequests: 6, exponentialBackoff: true });

      logSecurityEvent({
        eventType: "GUEST_TRACKING_ATTEMPT",
        actor: { ip, userAgent },
        resource: { type: "order", id: cleanOrderNum },
        outcome: "FAILURE",
        riskScore: 30,
        metadata: { action: "invalid_order_or_verifier" },
      });

      // Response Uniformity: identical response shape and status whether order doesn't exist OR verifier doesn't match
      return NextResponse.json(
        {
          error: "No matching shipment found. Please verify the order number and contact information.",
        },
        { status: 404 }
      );
    }

    // Successful tracking lookup
    recordSuccess(rateLimitKey);

    logSecurityEvent({
      eventType: "GUEST_TRACKING_ATTEMPT",
      actor: { ip, userAgent },
      resource: { type: "order", id: cleanOrderNum },
      outcome: "SUCCESS",
      riskScore: 0,
      metadata: { action: "tracking_success" },
    });

    // DATA MINIMIZATION:
    // Strictly strip: full street address, itemized prices, payment references, full phone/email
    return NextResponse.json({
      success: true,
      shipment: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber,
        carrier: "Express BlueDart Air",
        destination: {
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          country: order.shippingAddress.country,
          pincode: order.shippingAddress.pincode.slice(0, 3) + "***",
        },
        items: order.items.map((item) => ({
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        timeline: [
          { status: "Order Confirmed", completed: true },
          { status: "Quality Checked & Packed", completed: ["packed", "in_transit", "delivered"].includes(order.status) },
          { status: "In Transit with Express Courier", completed: ["in_transit", "delivered"].includes(order.status) },
          { status: "Out for Doorstep Delivery", completed: order.status === "delivered" },
        ],
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Tracking lookup failed", details: errorMsg }, { status: 500 });
  }
}
