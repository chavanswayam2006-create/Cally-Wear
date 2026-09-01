export type ProductCategory = "men" | "women" | "unisex";

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
  subCategory: string; // "sneakers" | "running" | "slides" | "basketball" | "streetwear" | "retro"
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

export type Collection = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  featuredProductIds: string[];
  tags: string[];
};

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
    | "processing"
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

export type FilterState = {
  category?: ProductCategory | "all";
  subCategory?: string[];
  sizes?: string[];
  colors?: string[];
  priceRange?: [number, number];
  tags?: string[];
  inStockOnly?: boolean;
  sortBy?: "featured" | "price-asc" | "price-desc" | "newest" | "discount";
};
