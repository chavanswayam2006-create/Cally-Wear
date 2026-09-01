import { hashPassword } from "./password";
import { OrderStatus, PaymentStatus } from "./order-state";
import { VerifiedOrderItem } from "./pricing";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "support_rep" | "order_manager" | "catalog_manager" | "super_admin";
  passwordHash: string;
  salt: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExp?: number;
  passwordResetToken?: string;
  passwordResetExp?: number;
  createdAt: number;
  addresses: Array<{
    id: string;
    isDefault: boolean;
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  }>;
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  trackingSecret: string;
  status: OrderStatus;
  items: VerifiedOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shippingAddress: {
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
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  idempotencyKey?: string;
}

export interface NewsletterRecord {
  email: string;
  status: "pending" | "confirmed" | "unsubscribed";
  consentTimestamp: number;
  consentIp: string;
  unsubscribeToken: string;
}

// In-Memory Data Collections
const users = new Map<string, UserRecord>(); // email -> UserRecord
const orders = new Map<string, StoredOrder>(); // orderNumber -> StoredOrder
const processedWebhookEvents = new Set<string>(); // eventId -> processed
const idempotencyStore = new Map<string, { orderNumber: string; createdAt: number; response: unknown }>();
const newsletterStore = new Map<string, NewsletterRecord>(); // email -> record

// Initialize Seed Users
function initSeedUsers() {
  users.clear();

  // 1. Regular Customer
  const customerHash = hashPassword("Password123!");
  users.set("alex.streets@gmail.com", {
    id: "usr_alex_001",
    name: "Alex Kapoor",
    email: "alex.streets@gmail.com",
    phone: "+91 98765 43210",
    role: "customer",
    passwordHash: customerHash.hash,
    salt: customerHash.salt,
    isEmailVerified: true,
    createdAt: Date.now() - 30 * 86400000,
    addresses: [
      {
        id: "addr_01",
        isDefault: true,
        name: "Alex Kapoor",
        street: "Flat 402, High Street Towers, Linking Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
        phone: "+91 98765 43210",
      },
    ],
  });

  // 2. Second Customer for IDOR test
  const customer2Hash = hashPassword("Password123!");
  users.set("riya.sneakers@gmail.com", {
    id: "usr_riya_002",
    name: "Riya Sharma",
    email: "riya.sneakers@gmail.com",
    phone: "+91 98765 43211",
    role: "customer",
    passwordHash: customer2Hash.hash,
    salt: customer2Hash.salt,
    isEmailVerified: true,
    createdAt: Date.now() - 20 * 86400000,
    addresses: [],
  });

  // 3. Super Admin
  const adminHash = hashPassword("AdminSecretPass2026!");
  users.set("security.admin@callywear.com", {
    id: "usr_admin_001",
    name: "Security Admin",
    email: "security.admin@callywear.com",
    phone: "+91 98765 00000",
    role: "super_admin",
    passwordHash: adminHash.hash,
    salt: adminHash.salt,
    isEmailVerified: true,
    createdAt: Date.now() - 100 * 86400000,
    addresses: [],
  });

  // 4. Order Manager
  const opsHash = hashPassword("OpsSecretPass2026!");
  users.set("ops.lead@callywear.com", {
    id: "usr_ops_001",
    name: "Operations Lead",
    email: "ops.lead@callywear.com",
    phone: "+91 98765 00001",
    role: "order_manager",
    passwordHash: opsHash.hash,
    salt: opsHash.salt,
    isEmailVerified: true,
    createdAt: Date.now() - 50 * 86400000,
    addresses: [],
  });

  // Seed initial order for Alex
  const seedOrder: StoredOrder = {
    id: "ord_seed_001",
    orderNumber: "CW-98241",
    customerId: "usr_alex_001",
    trackingSecret: "TRK-SEEDA1-B2C3D4-E5F6G7",
    status: "in_transit",
    items: [
      {
        productId: "cw-prod-01",
        name: "Cally Apex Tech Runner",
        slug: "cally-apex-tech-runner",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        size: "UK 9",
        color: "Obsidian Core",
        unitPrice: 7999,
        quantity: 1,
        totalPrice: 7999,
      },
    ],
    subtotal: 7999,
    discount: 0,
    shipping: 0,
    total: 7999,
    shippingAddress: {
      firstName: "Alex",
      lastName: "Kapoor",
      email: "alex.streets@gmail.com",
      phone: "+91 98765 43210",
      address: "Flat 402, High Street Towers, Linking Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      country: "India",
    },
    paymentMethod: "UPI (sneakerhead@okaxis)",
    paymentStatus: "paid",
    trackingNumber: "EXP-IN-839201948",
    estimatedDelivery: "2–3 business days",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  };
  orders.set(seedOrder.orderNumber, seedOrder);
}

// Run initial seed
initSeedUsers();

export const db = {
  users: {
    findByEmail(email: string): UserRecord | null {
      return users.get(email.toLowerCase().trim()) || null;
    },
    findById(id: string): UserRecord | null {
      for (const u of users.values()) {
        if (u.id === id) return u;
      }
      return null;
    },
    save(user: UserRecord): void {
      users.set(user.email.toLowerCase().trim(), user);
    },
    delete(userId: string): boolean {
      for (const [email, u] of users.entries()) {
        if (u.id === userId) {
          users.delete(email);
          return true;
        }
      }
      return false;
    },
  },
  orders: {
    findByOrderNumber(orderNumber: string): StoredOrder | null {
      return orders.get(orderNumber.trim().toUpperCase()) || null;
    },
    findById(id: string): StoredOrder | null {
      for (const o of orders.values()) {
        if (o.id === id) return o;
      }
      return null;
    },
    findByCustomerId(customerId: string): StoredOrder[] {
      const list: StoredOrder[] = [];
      for (const o of orders.values()) {
        if (o.customerId === customerId) {
          list.push(o);
        }
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    save(order: StoredOrder): void {
      orders.set(order.orderNumber.toUpperCase(), order);
    },
    getAll(): StoredOrder[] {
      return Array.from(orders.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  },
  webhooks: {
    hasProcessed(eventId: string): boolean {
      return processedWebhookEvents.has(eventId);
    },
    markProcessed(eventId: string): void {
      processedWebhookEvents.add(eventId);
    },
  },
  idempotency: {
    get(key: string) {
      return idempotencyStore.get(key);
    },
    set(key: string, data: { orderNumber: string; createdAt: number; response: unknown }) {
      idempotencyStore.set(key, data);
    },
  },
  newsletter: {
    get(email: string): NewsletterRecord | null {
      return newsletterStore.get(email.toLowerCase().trim()) || null;
    },
    save(record: NewsletterRecord): void {
      newsletterStore.set(record.email.toLowerCase().trim(), record);
    },
  },
  __resetForTesting() {
    initSeedUsers();
    processedWebhookEvents.clear();
    idempotencyStore.clear();
    newsletterStore.clear();
  },
};
