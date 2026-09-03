import { NextRequest, NextResponse } from "next/server";
import { db, OrderStatus, PaymentStatus, PaymentMethod } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const paymentStatus = searchParams.get("paymentStatus") as PaymentStatus | null;
    const paymentMethod = searchParams.get("paymentMethod") as PaymentMethod | null;
    const query = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) {
      where.payment = { status: paymentStatus };
    }
    if (paymentMethod) {
      where.payment = { ...where.payment, method: paymentMethod };
    }

    if (query) {
      where.OR = [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { profile: { email: { contains: query, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.order.count({ where }),
    ]);

    const formatted = orders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerEmail: o.profile?.email || o.shippingAddress?.email || "Guest",
      customerName: o.profile?.fullName || `${o.shippingAddress?.firstName || ""} ${o.shippingAddress?.lastName || ""}`.trim() || "Customer",
      status: o.status,
      total: o.total,
      itemCount: o.items.reduce((sum: number, it: any) => sum + it.quantity, 0),
      paymentMethod: o.payment?.method || "N/A",
      paymentStatus: o.payment?.status || "PENDING",
      amountPaid: o.payment?.amountPaid || 0,
      trackingNumber: o.trackingNumber,
      carrier: o.carrier,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      orders: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to fetch orders", details: err.message }, { status: 500 });
  }
}
