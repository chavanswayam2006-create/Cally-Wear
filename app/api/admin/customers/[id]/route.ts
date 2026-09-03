import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const profile = await db.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const [orders, addresses] = await Promise.all([
      db.order.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: "desc" },
      }),
      db.address.findMany({
        where: { profileId: profile.id },
      }),
    ]);

    const totalSpend = orders.reduce((sum: number, o: any) => sum + o.total, 0);

    return NextResponse.json({
      customer: {
        ...profile,
        totalSpend,
        ordersCount: orders.length,
        orders,
        addresses,
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to fetch customer details", details: err.message }, { status: 500 });
  }
}
