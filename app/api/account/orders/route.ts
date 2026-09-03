import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireCustomer(req);

    const orders = await db.order.findMany({
      where: { profileId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      createdAt: o.createdAt,
      total: o.total,
      itemCount: o.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      items: o.items.map((it: any) => ({
        id: it.id,
        name: it.product?.name || "Footwear",
        size: it.variant?.size || "",
        image: it.product?.images?.[0]?.url || "",
        quantity: it.quantity,
        price: it.priceAtPurchase,
      })),
      paymentMethod: o.payment?.method,
      paymentStatus: o.payment?.status,
      trackingNumber: o.trackingNumber,
      carrier: o.carrier,
    }));

    return NextResponse.json({ orders: formatted });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to load orders", details: err.message }, { status: 500 });
  }
}
