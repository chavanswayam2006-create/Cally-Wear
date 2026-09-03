import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  size: z.string().min(1, "Size is required"),
  color: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(3, "Street address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Valid PIN code is required"),
  country: z.string().default("India"),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(["standard", "priority"]).default("standard"),
  paymentMethod: z.enum(["card", "upi", "cod", "netbanking", "prepaid_mock", "COD", "PREPAID_MOCK"]),
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const body = {
      ...rawBody,
      shippingAddress: rawBody.shippingAddress
        ? {
            ...rawBody.shippingAddress,
            address: rawBody.shippingAddress.address || rawBody.shippingAddress.line1 || "",
          }
        : undefined,
    };
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items, shippingAddress, shippingMethod, paymentMethod } = parsed.data;

    // Check customer identity: from session or find/create profile by email
    const currentUser = await getCurrentUser(req);
    let profileId = currentUser?.id;

    if (!profileId) {
      const email = shippingAddress.email.toLowerCase().trim();
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

    // Process items and verify stock
    const validatedItems: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      priceAtPurchase: number;
      name: string;
      size: string;
    }> = [];

    let subtotal = 0;

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      const variant = product.variants.find((v: any) => v.size.toLowerCase() === item.size.toLowerCase());
      if (!variant) {
        return NextResponse.json(
          { error: `Size ${item.size} not available for ${product.name}` },
          { status: 400 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name} (Size: ${item.size}). Only ${variant.stock} left.` },
          { status: 400 }
        );
      }

      // Per Section 8: if isOnSale is true and salePrice exists, use salePrice; otherwise basePrice
      const unitPrice = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice;

      subtotal += unitPrice * item.quantity;
      validatedItems.push({
        productId: product.id,
        variantId: variant.id,
        quantity: item.quantity,
        priceAtPurchase: unitPrice,
        name: product.name,
        size: variant.size,
      });
    }

    const shippingFee = shippingMethod === "priority" ? (subtotal >= 1999 ? 299 : 398) : (subtotal >= 1999 ? 0 : 99);
    const total = subtotal + shippingFee;

    // Determine payment configuration per Section 6
    const isCod = paymentMethod.toLowerCase() === "cod";
    const paymentMethodEnum = isCod ? "COD" : "PREPAID_MOCK";
    const paymentStatusEnum = isCod ? "PENDING" : "PAID";
    const amountPaid = isCod ? 0 : total;

    // Wrap write in transaction
    const orderNumber = `CW-${Math.floor(100000 + Math.random() * 900000)}`;

    const createdOrder = await db.$transaction(async (tx: any) => {
      // Create order with items and payment
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
            create: validatedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
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
          statusHistory: {
            create: {
              status: "PLACED",
              note: "Order placed by customer",
            },
          },
        },
        include: {
          items: true,
          payment: true,
          statusHistory: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      order: createdOrder,
      message: "Order placed successfully",
    });
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return NextResponse.json(
      { error: "Failed to place order", message: err.message },
      { status: 500 }
    );
  }
}
