import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const [allOrders, allProducts, allCustomers] = await Promise.all([
      db.order.findMany({}),
      db.product.findMany({}),
      db.profile.findMany({ where: { role: "CUSTOMER" } }),
    ]);

    // 1. Orders by Status count
    const statusCounts: Record<string, number> = {
      PLACED: 0,
      CONFIRMED: 0,
      PACKED: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      RETURNED: 0,
    };

    let totalRevenue = 0;
    let pendingCodTotal = 0;
    let pendingCodCount = 0;

    allOrders.forEach((o: any) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }

      if (o.status !== "CANCELLED") {
        totalRevenue += o.total;
      }

      if (o.payment?.method === "COD" && o.payment?.status === "PENDING" && o.status !== "CANCELLED") {
        pendingCodTotal += o.total;
        pendingCodCount++;
      }
    });

    // 2. Low-stock variants (threshold = 10 units or customizable)
    const lowStockThreshold = 10;
    const lowStockVariants: Array<{
      productId: string;
      productName: string;
      productSku: string;
      size: string;
      stock: number;
    }> = [];

    allProducts.forEach((p: any) => {
      p.variants.forEach((v: any) => {
        if (v.stock <= lowStockThreshold) {
          lowStockVariants.push({
            productId: p.id,
            productName: p.name,
            productSku: p.sku,
            size: v.size,
            stock: v.stock,
          });
        }
      });
    });

    // 3. Recent orders (top 6)
    const recentOrders = allOrders.slice(0, 6).map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.profile?.fullName || `${o.shippingAddress?.firstName || ""} ${o.shippingAddress?.lastName || ""}`.trim() || "Customer",
      customerEmail: o.profile?.email || o.shippingAddress?.email || "",
      total: o.total,
      status: o.status,
      paymentMethod: o.payment?.method || "N/A",
      paymentStatus: o.payment?.status || "PENDING",
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      metrics: {
        totalOrders: allOrders.length,
        totalRevenue,
        pendingCodTotal,
        pendingCodCount,
        totalProducts: allProducts.length,
        publishedProducts: allProducts.filter((p: any) => p.status === "PUBLISHED").length,
        totalCustomers: allCustomers.length,
      },
      statusCounts,
      lowStockVariants,
      recentOrders,
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Failed to load dashboard stats", details: err.message }, { status: 500 });
  }
}
