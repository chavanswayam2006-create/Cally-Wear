import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, PaymentStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const manualPaymentSchema = z.object({
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
  status: z.enum(["PENDING", "PARTIALLY_PAID", "PAID", "FAILED", "REFUNDED"]),
  note: z.string().min(2, "A detailed note is required for manual payment audit trail"),
});

export async function POST(
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

    const payment = await db.payment.findUnique({ where: { orderId: order.id } });
    if (!payment) {
      return NextResponse.json({ error: "Payment record for this order not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = manualPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, status, note } = parsed.data;

    // Determine amountPaid based on transaction
    let newAmountPaid = payment.amountPaid;
    if (status === "PAID") {
      newAmountPaid = amount > 0 ? amount : payment.amountDue;
    } else if (status === "PARTIALLY_PAID") {
      newAmountPaid = amount;
    } else if (status === "REFUNDED") {
      newAmountPaid = Math.max(0, payment.amountPaid - amount);
    }

    const updatedPayment = await db.payment.update({
      where: { orderId: order.id },
      data: {
        status: status as PaymentStatus,
        amountPaid: newAmountPaid,
        logEvent: {
          amount,
          status: status as PaymentStatus,
          source: admin.id,
          note,
        },
      },
    });

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: "Payment record updated with audit log entry",
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to update payment", details: err.message }, { status: 500 });
  }
}
