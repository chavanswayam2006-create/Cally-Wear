import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, PaymentStatus } from "@/lib/db";

// Webhook payload schema for future live gateway (e.g. Razorpay / Stripe)
const webhookSchema = z.object({
  orderId: z.string(),
  event: z.string(),
  amount: z.number(),
  status: z.enum(["PENDING", "PARTIALLY_PAID", "PAID", "FAILED", "REFUNDED"]),
  transactionId: z.string().optional(),
  signature: z.string().optional(),
  note: z.string().optional(),
});

// ASSUMPTION: This webhook endpoint is structured to accept future gateway callbacks (Razorpay/Stripe).
// It appends a PaymentLogEvent and updates Payment.status and Payment.amountPaid transactionally.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = webhookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid webhook payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orderId, amount, status, note, transactionId } = parsed.data;

    const payment = await db.payment.findUnique({ where: { orderId } });
    if (!payment) {
      return NextResponse.json({ error: "Payment record for order not found" }, { status: 404 });
    }

    const newAmountPaid = status === "PAID" ? amount : payment.amountPaid;

    const updatedPayment = await db.payment.update({
      where: { orderId },
      data: {
        status: status as PaymentStatus,
        amountPaid: newAmountPaid,
        logEvent: {
          amount,
          status: status as PaymentStatus,
          source: "system",
          note: note || `Webhook event: transaction ${transactionId || "N/A"}`,
        },
      },
    });

    return NextResponse.json({
      received: true,
      orderId,
      payment: updatedPayment,
    });
  } catch (err: any) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed", message: err.message }, { status: 500 });
  }
}
