import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/security/database";
import { logSecurityEvent } from "@/lib/security/audit-logger";

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || "cally_webhook_secret_key_razorpay_2026";
const MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-cally-signature") || req.headers.get("x-razorpay-signature") || "";
  const timestampHeader = req.headers.get("x-cally-timestamp") || req.headers.get("x-razorpay-timestamp") || "";
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  try {
    const rawBody = await req.text();

    // 1. Signature Verification
    if (!signature) {
      logSecurityEvent({
        eventType: "WEBHOOK_REJECTED",
        actor: { ip },
        outcome: "BLOCKED",
        riskScore: 90,
        metadata: { reason: "missing_signature" },
      });
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 401 });
    }

    const payloadToVerify = timestampHeader ? `${timestampHeader}.${rawBody}` : rawBody;
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payloadToVerify)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expectedSignature, "hex");

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      logSecurityEvent({
        eventType: "WEBHOOK_REJECTED",
        actor: { ip },
        outcome: "BLOCKED",
        riskScore: 95,
        metadata: { reason: "invalid_hmac_signature" },
      });
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    // 2. Timestamp Replay Prevention
    if (timestampHeader) {
      const eventTime = Number(timestampHeader);
      const now = Date.now();
      if (isNaN(eventTime) || Math.abs(now - eventTime) > MAX_TIMESTAMP_DRIFT_MS) {
        logSecurityEvent({
          eventType: "WEBHOOK_REJECTED",
          actor: { ip },
          outcome: "BLOCKED",
          riskScore: 85,
          metadata: { reason: "timestamp_replay_attack", eventTime, now },
        });
        return NextResponse.json({ error: "Webhook timestamp out of tolerance window" }, { status: 400 });
      }
    }

    const parsed = JSON.parse(rawBody);
    const { eventId, eventType, orderNumber, paymentId } = parsed;

    if (!eventId || !orderNumber) {
      return NextResponse.json({ error: "Missing required webhook parameters" }, { status: 400 });
    }

    // 3. Webhook Event Idempotency
    if (db.webhooks.hasProcessed(eventId)) {
      // Return 200 without reprocessing duplicate event
      return NextResponse.json({ success: true, message: "Webhook already processed (idempotent duplicate)" });
    }

    // 4. Update Order State Safely
    const order = db.orders.findByOrderNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Referenced order not found" }, { status: 404 });
    }

    if (eventType === "payment.captured" || eventType === "order.paid") {
      order.status = "confirmed";
      order.paymentStatus = "paid";
      db.orders.save(order);

      logSecurityEvent({
        eventType: "WEBHOOK_PROCESSED",
        actor: { ip },
        resource: { type: "order", id: orderNumber },
        outcome: "SUCCESS",
        metadata: { eventId, paymentId, newStatus: order.status },
      });
    }

    // Mark event processed
    db.webhooks.markProcessed(eventId);

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Webhook handling failed", details: errorMsg }, { status: 500 });
  }
}
