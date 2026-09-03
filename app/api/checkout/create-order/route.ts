import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      size: z.string().min(1),
      color: z.string().optional(),
      quantity: z.number().int().min(1).max(10),
    })
  ).min(1),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    apartment: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(6),
    country: z.string().optional().default("India"),
  }),
  shippingMethod: z.enum(["standard", "priority"]).default("standard"),
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"]).default("upi"),
  promoCode: z.string().optional().nullable(),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { items, shippingAddress, shippingMethod, paymentMethod } = parsed.data;

    // Authenticated session or find/create profile
    const currentUser = await getCurrentUser(req);
    let profileId = currentUser?.id;

    const email = shippingAddress.email.toLowerCase().trim();
    if (!profileId) {
      let profile = await db.profile.findUnique({ where: { email } });
      if (!profile) {
        profile = await db.profile.create({
          data: {
            email,
            fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            phone: shippingAddress.phone,
            role: "CUSTOMER",
          },
        });
      }
      profileId = profile.id;
    }

    // Resolve products and variants
    let subtotal = 0;
    const validatedItems: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      priceAtPurchase: number;
    }> = [];

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      // Match variant by size or first variant
      let variant = product.variants.find((v: any) => v.size.toLowerCase() === item.size.toLowerCase());
      if (!variant && product.variants.length > 0) {
        variant = product.variants[0];
      }
      if (!variant) {
        return NextResponse.json({ error: `Variant for size ${item.size} not found` }, { status: 400 });
      }

      const unitPrice = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice;
      subtotal += unitPrice * item.quantity;

      validatedItems.push({
        productId: product.id,
        variantId: variant.id,
        quantity: item.quantity,
        priceAtPurchase: unitPrice,
      });
    }

    const shippingFee = shippingMethod === "priority" ? 299 : (subtotal >= 1999 ? 0 : 99);
    const total = subtotal + shippingFee;

    const isCod = paymentMethod === "cod";
    const paymentMethodEnum = isCod ? "COD" : "PREPAID_MOCK";
    const paymentStatusEnum = isCod ? "PENDING" : "PAID";
    const amountPaid = isCod ? 0 : total;

    const orderNumber = `CW-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = await db.$transaction(async (tx: any) => {
      return await tx.order.create({
        data: {
          orderNumber,
          profileId,
          shippingAddress,
          subtotal,
          shippingFee,
          total,
          status: "PLACED",
          items: {
            create: validatedItems.map((it) => ({
              productId: it.productId,
              variantId: it.variantId,
              quantity: it.quantity,
              priceAtPurchase: it.priceAtPurchase,
            })),
          },
          payment: {
            create: {
              method: paymentMethodEnum,
              status: paymentStatusEnum,
              amountDue: total,
              amountPaid,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          status: newOrder.status,
          subtotal: newOrder.subtotal,
          discount: 0,
          shipping: newOrder.shippingFee,
          total: newOrder.total,
          paymentStatus: paymentStatusEnum,
          trackingNumber: newOrder.trackingNumber || `CW-TRK-${newOrder.orderNumber}`,
          estimatedDelivery: "3–5 business days",
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Checkout order error:", err);
    return NextResponse.json({ error: "Order creation failed", details: err.message }, { status: 500 });
  }
}
