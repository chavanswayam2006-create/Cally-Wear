import { products } from "@/lib/data/products";

export const FREE_SHIPPING_THRESHOLD = 1999;
export const STANDARD_SHIPPING_FEE = 199;
export const PRIORITY_SHIPPING_SURCHARGE = 299;
export const MAX_ITEM_QUANTITY_PER_ORDER = 5;
export const MAX_COD_ORDER_VALUE = 15000;

export interface ClientOrderItemInput {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface VerifiedOrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface PriceCalculationResult {
  valid: boolean;
  error?: string;
  items: VerifiedOrderItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  shippingMethod: "standard" | "priority";
  shippingFee: number;
  total: number;
  promoCode: string | null;
}

const PROMO_CODES: Record<string, number> = {
  CALLY10: 10,
  FIRST10: 10,
  DROP15: 15,
  VIP15: 15,
};

/**
 * Server-authoritative price, quantity, discount and shipping calculation.
 * Client-submitted prices/discounts/totals are completely ignored.
 */
export function calculateServerOrderTotals(params: {
  items: ClientOrderItemInput[];
  promoCode?: string | null;
  shippingMethod: "standard" | "priority";
}): PriceCalculationResult {
  if (!params.items || !Array.isArray(params.items) || params.items.length === 0) {
    return {
      valid: false,
      error: "Cart cannot be empty",
      items: [],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      shippingMethod: params.shippingMethod || "standard",
      shippingFee: 0,
      total: 0,
      promoCode: null,
    };
  }

  const verifiedItems: VerifiedOrderItem[] = [];
  let subtotal = 0;

  for (const rawItem of params.items) {
    if (!rawItem.productId || typeof rawItem.productId !== "string") {
      return { valid: false, error: "Invalid product identifier", items: [], subtotal: 0, discountPercent: 0, discountAmount: 0, shippingMethod: params.shippingMethod, shippingFee: 0, total: 0, promoCode: null };
    }

    const product = products.find((p) => p.id === rawItem.productId);
    if (!product) {
      return { valid: false, error: `Product '${rawItem.productId}' not found in catalog`, items: [], subtotal: 0, discountPercent: 0, discountAmount: 0, shippingMethod: params.shippingMethod, shippingFee: 0, total: 0, promoCode: null };
    }

    const qty = Math.floor(Number(rawItem.quantity) || 0);
    if (qty <= 0) {
      return { valid: false, error: `Invalid quantity for product '${product.name}'`, items: [], subtotal: 0, discountPercent: 0, discountAmount: 0, shippingMethod: params.shippingMethod, shippingFee: 0, total: 0, promoCode: null };
    }
    if (qty > MAX_ITEM_QUANTITY_PER_ORDER) {
      return { valid: false, error: `Quantity limit exceeded (maximum ${MAX_ITEM_QUANTITY_PER_ORDER} per item)`, items: [], subtotal: 0, discountPercent: 0, discountAmount: 0, shippingMethod: params.shippingMethod, shippingFee: 0, total: 0, promoCode: null };
    }

    // Match image from colorway if available
    const colorObj = product.colors.find((c) => c.name === rawItem.color);
    const itemImage = colorObj?.images?.[0] || product.images[0] || "";

    const unitPrice = product.price; // Server-authoritative catalog price
    const itemTotal = unitPrice * qty;
    subtotal += itemTotal;

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: itemImage,
      size: rawItem.size || "Standard",
      color: rawItem.color || "Default",
      unitPrice,
      quantity: qty,
      totalPrice: itemTotal,
    });
  }

  // Calculate discount from trusted promo code table
  let discountPercent = 0;
  let cleanPromoCode: string | null = null;
  if (params.promoCode && typeof params.promoCode === "string") {
    const code = params.promoCode.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      discountPercent = PROMO_CODES[code];
      cleanPromoCode = code;
    }
  }

  const discountAmount = discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : 0;

  // Calculate shipping
  let shippingFee = 0;
  if (subtotal < FREE_SHIPPING_THRESHOLD) {
    shippingFee = STANDARD_SHIPPING_FEE;
  }
  if (params.shippingMethod === "priority") {
    shippingFee += PRIORITY_SHIPPING_SURCHARGE;
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return {
    valid: true,
    items: verifiedItems,
    subtotal,
    discountPercent,
    discountAmount,
    shippingMethod: params.shippingMethod,
    shippingFee,
    total: finalTotal,
    promoCode: cleanPromoCode,
  };
}
