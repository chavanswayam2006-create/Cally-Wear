export type ProductCategory = "SNEAKERS" | "SLIDES" | "BOOTS" | "SANDALS" | "RUNNING" | "STREETWEAR";

export type ProductGender = "MEN" | "WOMEN" | "UNISEX";

export type ProductColor = {
  name: string;
  hex: string;
  images?: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  gender: ProductGender;
  price: number;
  compareAtPrice?: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  description: string;
  materials?: string;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  details?: string[];
};

// Cart item type — keyed by product id + size + color for deduplication
export type CartItem = {
  id: string; // composite key: `${productId}-${size}-${color}`
  productId: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
};

// Order shipping address
export type OrderShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

// Order type
export type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status:
    | "awaiting_payment"
    | "pending"
    | "paid"
    | "confirmed"
    | "packed"
    | "in_transit"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "delivery_failed";
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: OrderShippingAddress;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  trackingNumber?: string;
  estimatedDelivery?: string;
};

// Filter state — all filters query against enum values
export type FilterState = {
  category?: ProductCategory | "all";
  gender?: ProductGender;
  subCategory?: string[];
  sizes?: string[];
  colors?: string[];
  priceRange?: [number, number];
  tags?: string[];
  inStockOnly?: boolean;
  sortBy?: "featured" | "price-asc" | "price-desc" | "newest" | "discount";
};