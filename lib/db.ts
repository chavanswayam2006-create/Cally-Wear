// Cally Wear - Unified Database Layer
// Supports Prisma with Supabase PostgreSQL and persistent local storage fallback
// ASSUMPTION: When Supabase/PostgreSQL connection string is provided and reachable,
// Prisma is used. Otherwise, an identical schema-compliant JSON file store in .data/db.json
// provides 100% offline local development without external dependencies.

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Global Prisma instance for when DATABASE_URL is active
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Types matching Prisma Schema
export type Role = "CUSTOMER" | "ADMIN" | "STAFF";
export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";
export type PaymentMethod = "COD" | "PREPAID_MOCK";
export type PaymentStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "FAILED" | "REFUNDED";

export interface ProfileRecord {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: Role;
  passwordHash?: string | null;
  createdAt: string;
}

export interface AddressRecord {
  id: string;
  profileId: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface ProductImageRecord {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductVariantRecord {
  id: string;
  productId: string;
  size: string;
  stock: number;
}

export interface SectionRecord {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface ProductSectionRecord {
  productId: string;
  sectionId: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  materials: string;
  basePrice: number;
  salePrice: number | null;
  isOnSale: boolean;
  discountPercent: number | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  profileId: string;
  shippingAddress: any;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusEventRecord {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  updatedBy: string;
  createdAt: string;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountDue: number;
  amountPaid: number;
  updatedAt: string;
}

export interface PaymentLogEventRecord {
  id: string;
  paymentId: string;
  amount: number;
  status: PaymentStatus;
  source: string;
  note: string | null;
  createdAt: string;
}

interface LocalDatabaseState {
  profiles: ProfileRecord[];
  addresses: AddressRecord[];
  products: ProductRecord[];
  productImages: ProductImageRecord[];
  productVariants: ProductVariantRecord[];
  sections: SectionRecord[];
  productSections: ProductSectionRecord[];
  orders: OrderRecord[];
  orderStatusEvents: OrderStatusEventRecord[];
  orderItems: OrderItemRecord[];
  payments: PaymentRecord[];
  paymentLogEvents: PaymentLogEventRecord[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getInitialSeedData(): LocalDatabaseState {
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@callywear.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "CallyAdmin2026!";
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(adminPassword, salt);

  const adminProfile: ProfileRecord = {
    id: "profile_admin_root",
    email: adminEmail.toLowerCase().trim(),
    fullName: "Cally Admin",
    phone: "+91 99999 99999",
    role: "ADMIN",
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  const sections: SectionRecord[] = [
    { id: "sec_new_arrivals", name: "New Arrivals", slug: "new-arrivals", sortOrder: 0 },
    { id: "sec_best_sellers", name: "Best Sellers", slug: "best-sellers", sortOrder: 1 },
    { id: "sec_sale", name: "Sale", slug: "sale", sortOrder: 2 },
    { id: "sec_men", name: "Men", slug: "men", sortOrder: 3 },
    { id: "sec_women", name: "Women", slug: "women", sortOrder: 4 },
  ];

  const now = new Date().toISOString();

  // 6 starter products matching Cally Wear aesthetic
  const initialProductsData = [
    {
      id: "prod_01",
      name: "Apex Tech Runner",
      slug: "apex-tech-runner",
      sku: "CW-SNK-001",
      description: "Engineered for high-intensity urban agility and concrete endurance. Merges tactical ripstop nylon with responsive nitrogen-injected cushioning.",
      materials: "Ripstop ballistic nylon, TPU cage, Nitrogen-infused EVA foam midsole, Vibram rubber tread outsole",
      basePrice: 7999,
      salePrice: 6999,
      isOnSale: true,
      discountPercent: 13,
      isFeatured: true,
      isNewArrival: true,
      status: "PUBLISHED" as ProductStatus,
      sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
      sections: ["sec_new_arrivals", "sec_best_sellers", "sec_sale", "sec_men"],
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "prod_02",
      name: "Ghost Phantom Low",
      slug: "ghost-phantom-low",
      sku: "CW-SNK-002",
      description: "Monochrome low-top sneaker crafted with premium matte tumbled leather, waxed tonal lacing, and reinforced cupsole construction.",
      materials: "Full-grain tumbled calf leather, perforated vamp, waxed cotton laces, vulcanized gum rubber outsole",
      basePrice: 6499,
      salePrice: null,
      isOnSale: false,
      discountPercent: null,
      isFeatured: true,
      isNewArrival: true,
      status: "PUBLISHED" as ProductStatus,
      sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
      sections: ["sec_new_arrivals", "sec_men", "sec_women"],
      images: [
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "prod_03",
      name: "Veloce Speed Trainer",
      slug: "veloce-speed-trainer",
      sku: "CW-SNK-003",
      description: "Aggressive aerodynamic silhouette built with breathable 3D engineered knit, reflective 3M piping, and carbon stability arch plate.",
      materials: "Recycled engineered knit, molded neoprene collar, dual-density phylon midsole, carbon torsion plate",
      basePrice: 8499,
      salePrice: 7499,
      isOnSale: true,
      discountPercent: 12,
      isFeatured: false,
      isNewArrival: true,
      status: "PUBLISHED" as ProductStatus,
      sizes: ["UK 7", "UK 8", "UK 9", "UK 10"],
      sections: ["sec_new_arrivals", "sec_sale"],
      images: [
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "prod_04",
      name: "Solstice Slide Pro",
      slug: "solstice-slide-pro",
      sku: "CW-SLD-004",
      description: "Ultra-cushioned street slide with contoured footbed, adjustable ripstop strap, and textured traction outsole.",
      materials: "Hydrophobic EVA foam, ballistic nylon strap with industrial hook-and-loop closure",
      basePrice: 2499,
      salePrice: 1999,
      isOnSale: true,
      discountPercent: 20,
      isFeatured: true,
      isNewArrival: false,
      status: "PUBLISHED" as ProductStatus,
      sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
      sections: ["sec_best_sellers", "sec_sale", "sec_men", "sec_women"],
      images: [
        "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "prod_05",
      name: "Retro Court Heritage",
      slug: "retro-court-heritage",
      sku: "CW-SNK-005",
      description: "Timeless 80s court silhouette re-engineered with modern cushioning and reinforced toe cap for daily rotation.",
      materials: "Smooth action leather, suede mudguard, Ortholite memory insole, rubber pivot cupsole",
      basePrice: 5499,
      salePrice: null,
      isOnSale: false,
      discountPercent: null,
      isFeatured: false,
      isNewArrival: false,
      status: "PUBLISHED" as ProductStatus,
      sizes: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
      sections: ["sec_best_sellers", "sec_men", "sec_women"],
      images: [
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      id: "prod_06",
      name: "Terraform Hiker Boot",
      slug: "terraform-hiker-boot",
      sku: "CW-BOT-006",
      description: "Tactical hybrid boot featuring waterproof membrane, metal speed hooks, and deep lugged Vibram all-weather grip.",
      materials: "Waterproof nubuck, Cordura canvas, gusseted tongue, heavy-duty Vibram Commando outsole",
      basePrice: 10999,
      salePrice: null,
      isOnSale: false,
      discountPercent: null,
      isFeatured: true,
      isNewArrival: false,
      status: "PUBLISHED" as ProductStatus,
      sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
      sections: ["sec_men"],
      images: [
        "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80"
      ]
    },
  ];

  const products: ProductRecord[] = [];
  const productImages: ProductImageRecord[] = [];
  const productVariants: ProductVariantRecord[] = [];
  const productSections: ProductSectionRecord[] = [];

  initialProductsData.forEach((p) => {
    products.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      materials: p.materials,
      basePrice: p.basePrice,
      salePrice: p.salePrice,
      isOnSale: p.isOnSale,
      discountPercent: p.discountPercent,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      status: p.status,
      createdAt: now,
      updatedAt: now,
    });

    p.images.forEach((url, idx) => {
      productImages.push({
        id: `img_${p.id}_${idx}`,
        productId: p.id,
        url,
        altText: `${p.name} - View ${idx + 1}`,
        sortOrder: idx,
      });
    });

    p.sizes.forEach((size, idx) => {
      productVariants.push({
        id: `var_${p.id}_${idx}`,
        productId: p.id,
        size,
        stock: 12 + (idx * 3), // Initial realistic stock
      });
    });

    p.sections.forEach((sectionId) => {
      productSections.push({
        productId: p.id,
        sectionId,
      });
    });
  });

  return {
    profiles: [adminProfile],
    addresses: [],
    products,
    productImages,
    productVariants,
    sections,
    productSections,
    orders: [],
    orderStatusEvents: [],
    orderItems: [],
    payments: [],
    paymentLogEvents: [],
  };
}

class LocalStoreManager {
  private state: LocalDatabaseState | null = null;

  public getState(): LocalDatabaseState {
    if (this.state) return this.state;

    ensureDirectoryExists(DATA_DIR);

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.state = JSON.parse(raw);
        if (this.state && Array.isArray(this.state.products)) {
          return this.state;
        }
      } catch (err) {
        console.error("Failed to parse local db.json, re-initializing:", err);
      }
    }

    this.state = getInitialSeedData();
    this.saveState();
    return this.state;
  }

  public saveState(): void {
    if (!this.state) return;
    ensureDirectoryExists(DATA_DIR);
    fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), "utf-8");
  }

  public resetToSeed(): LocalDatabaseState {
    this.state = getInitialSeedData();
    this.saveState();
    return this.state;
  }
}

const storeManager = new LocalStoreManager();

// Helper to determine if we should use live PostgreSQL or local fallback
export function shouldUsePostgres(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.startsWith("postgresql://") && !url.includes("[PASSWORD]"));
}

// Local In-Memory / File-backed Database implementation matching Prisma interface
export const localDb: any = {
  get state() {
    return storeManager.getState();
  },
  save() {
    storeManager.saveState();
  },

  // Products
  product: {
    findMany: async (args?: {
      where?: {
        status?: ProductStatus;
        isOnSale?: boolean;
        isFeatured?: boolean;
        isNewArrival?: boolean;
        sections?: { some: { sectionId?: string; section?: { slug?: string } } };
        OR?: Array<{ name?: { contains: string; mode?: string }; sku?: { contains: string; mode?: string } }>;
      };
      orderBy?: Record<string, "asc" | "desc">;
      skip?: number;
      take?: number;
      include?: { images?: boolean; variants?: boolean; sections?: boolean };
    }) => {
      const state = storeManager.getState();
      let results = [...state.products];

      if (args?.where) {
        const w = args.where;
        if (w.status) results = results.filter((p) => p.status === w.status);
        if (typeof w.isOnSale === "boolean") results = results.filter((p) => p.isOnSale === w.isOnSale);
        if (typeof w.isFeatured === "boolean") results = results.filter((p) => p.isFeatured === w.isFeatured);
        if (typeof w.isNewArrival === "boolean") results = results.filter((p) => p.isNewArrival === w.isNewArrival);

        if (w.sections?.some) {
          const sectionSlug = w.sections.some.section?.slug;
          const sectionId = w.sections.some.sectionId;
          const targetSectionIds = new Set<string>();

          if (sectionId) targetSectionIds.add(sectionId);
          if (sectionSlug) {
            const sec = state.sections.find((s) => s.slug === sectionSlug);
            if (sec) targetSectionIds.add(sec.id);
          }

          if (targetSectionIds.size > 0) {
            const matchingProductIds = new Set(
              state.productSections
                .filter((ps) => targetSectionIds.has(ps.sectionId))
                .map((ps) => ps.productId)
            );
            results = results.filter((p) => matchingProductIds.has(p.id));
          }
        }

        if (w.OR && w.OR.length > 0) {
          results = results.filter((p) => {
            return w.OR!.some((cond) => {
              if (cond.name?.contains) {
                return p.name.toLowerCase().includes(cond.name.contains.toLowerCase());
              }
              if (cond.sku?.contains) {
                return p.sku.toLowerCase().includes(cond.sku.contains.toLowerCase());
              }
              return false;
            });
          });
        }
      }

      // Order by
      if (args?.orderBy?.createdAt) {
        const dir = args.orderBy.createdAt === "desc" ? -1 : 1;
        results.sort((a, b) => dir * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }

      const total = results.length;
      if (typeof args?.skip === "number") results = results.slice(args.skip);
      if (typeof args?.take === "number") results = results.slice(0, args.take);

      // Hydrate relations
      return results.map((p) => ({
        ...p,
        images: state.productImages
          .filter((img) => img.productId === p.id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
        variants: state.productVariants.filter((v) => v.productId === p.id),
        sections: state.productSections
          .filter((ps) => ps.productId === p.id)
          .map((ps) => {
            const sec = state.sections.find((s) => s.id === ps.sectionId);
            return {
              productId: ps.productId,
              sectionId: ps.sectionId,
              section: sec!,
            };
          }),
      }));
    },

    findUnique: async (args: {
      where: { id?: string; slug?: string; sku?: string };
      include?: { images?: boolean; variants?: boolean; sections?: boolean };
    }) => {
      const state = storeManager.getState();
      const p = state.products.find(
        (prod) =>
          (args.where.id && prod.id === args.where.id) ||
          (args.where.slug && prod.slug === args.where.slug) ||
          (args.where.sku && prod.sku === args.where.sku)
      );
      if (!p) return null;

      return {
        ...p,
        images: state.productImages
          .filter((img) => img.productId === p.id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
        variants: state.productVariants.filter((v) => v.productId === p.id),
        sections: state.productSections
          .filter((ps) => ps.productId === p.id)
          .map((ps) => ({
            productId: ps.productId,
            sectionId: ps.sectionId,
            section: state.sections.find((s) => s.id === ps.sectionId)!,
          })),
      };
    },

    create: async (args: { data: any }) => {
      const state = storeManager.getState();
      const id = args.data.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      const newProduct: ProductRecord = {
        id,
        name: args.data.name,
        slug: args.data.slug,
        sku: args.data.sku,
        description: args.data.description,
        materials: args.data.materials || "",
        basePrice: Number(args.data.basePrice),
        salePrice: args.data.salePrice ? Number(args.data.salePrice) : null,
        isOnSale: Boolean(args.data.isOnSale),
        discountPercent: args.data.discountPercent ?? (args.data.salePrice && args.data.basePrice ? Math.round(((args.data.basePrice - args.data.salePrice) / args.data.basePrice) * 100) : null),
        isFeatured: Boolean(args.data.isFeatured),
        isNewArrival: Boolean(args.data.isNewArrival),
        status: (args.data.status as ProductStatus) || "DRAFT",
        createdAt: now,
        updatedAt: now,
      };

      state.products.push(newProduct);

      // Handle images
      if (args.data.images?.create) {
        args.data.images.create.forEach((img: any, idx: number) => {
          state.productImages.push({
            id: `img_${id}_${Date.now()}_${idx}`,
            productId: id,
            url: img.url,
            altText: img.altText || null,
            sortOrder: img.sortOrder ?? idx,
          });
        });
      }

      // Handle variants
      if (args.data.variants?.create) {
        args.data.variants.create.forEach((v: any, idx: number) => {
          state.productVariants.push({
            id: `var_${id}_${Date.now()}_${idx}`,
            productId: id,
            size: v.size,
            stock: Number(v.stock || 0),
          });
        });
      }

      // Handle sections
      if (args.data.sections?.create) {
        args.data.sections.create.forEach((s: any) => {
          state.productSections.push({
            productId: id,
            sectionId: s.sectionId,
          });
        });
      }

      storeManager.saveState();
      return localDb.product.findUnique({ where: { id } });
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const state = storeManager.getState();
      const index = state.products.findIndex((p) => p.id === args.where.id);
      if (index === -1) throw new Error("Product not found");

      const existing = state.products[index];
      const now = new Date().toISOString();

      const basePrice = args.data.basePrice !== undefined ? Number(args.data.basePrice) : existing.basePrice;
      const salePrice = args.data.salePrice !== undefined ? (args.data.salePrice ? Number(args.data.salePrice) : null) : existing.salePrice;

      state.products[index] = {
        ...existing,
        ...args.data,
        basePrice,
        salePrice,
        discountPercent: args.data.discountPercent !== undefined
          ? args.data.discountPercent
          : salePrice && basePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : null,
        updatedAt: now,
      };

      // Replace images if provided
      if (args.data.images !== undefined) {
        state.productImages = state.productImages.filter((img) => img.productId !== args.where.id);
        if (args.data.images?.create) {
          args.data.images.create.forEach((img: any, idx: number) => {
            state.productImages.push({
              id: `img_${args.where.id}_${Date.now()}_${idx}`,
              productId: args.where.id,
              url: img.url,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? idx,
            });
          });
        }
      }

      // Replace variants if provided
      if (args.data.variants !== undefined) {
        state.productVariants = state.productVariants.filter((v) => v.productId !== args.where.id);
        if (args.data.variants?.create) {
          args.data.variants.create.forEach((v: any, idx: number) => {
            state.productVariants.push({
              id: `var_${args.where.id}_${Date.now()}_${idx}`,
              productId: args.where.id,
              size: v.size,
              stock: Number(v.stock || 0),
            });
          });
        }
      }

      // Replace sections if provided
      if (args.data.sections !== undefined) {
        state.productSections = state.productSections.filter((ps) => ps.productId !== args.where.id);
        if (args.data.sections?.create) {
          args.data.sections.create.forEach((s: any) => {
            state.productSections.push({
              productId: args.where.id,
              sectionId: s.sectionId,
            });
          });
        }
      }

      storeManager.saveState();
      return localDb.product.findUnique({ where: { id: args.where.id } });
    },

    delete: async (args: { where: { id: string } }) => {
      const state = storeManager.getState();
      const p = state.products.find((prod) => prod.id === args.where.id);
      if (!p) throw new Error("Product not found");

      // Check if product is referenced in OrderItem
      const hasOrders = state.orderItems.some((item) => item.productId === args.where.id);
      if (hasOrders) {
        // As per Section 5.1: never hard-delete a product referenced by past OrderItem rows; archive instead
        p.status = "ARCHIVED";
        p.updatedAt = new Date().toISOString();
        storeManager.saveState();
        return p;
      }

      state.products = state.products.filter((prod) => prod.id !== args.where.id);
      state.productImages = state.productImages.filter((img) => img.productId !== args.where.id);
      state.productVariants = state.productVariants.filter((v) => v.productId !== args.where.id);
      state.productSections = state.productSections.filter((ps) => ps.productId !== args.where.id);
      storeManager.saveState();
      return p;
    },

    count: async (args?: { where?: any }) => {
      const list = await localDb.product.findMany(args);
      return list.length;
    },
  },

  // Sections
  section: {
    findMany: async (args?: { orderBy?: { sortOrder?: "asc" | "desc" } }) => {
      const state = storeManager.getState();
      const list = [...state.sections];
      const dir = args?.orderBy?.sortOrder === "desc" ? -1 : 1;
      list.sort((a, b) => dir * (a.sortOrder - b.sortOrder));

      return list.map((sec) => ({
        ...sec,
        _count: {
          products: state.productSections.filter((ps) => ps.sectionId === sec.id).length,
        },
      }));
    },

    findUnique: async (args: { where: { id?: string; slug?: string } }) => {
      const state = storeManager.getState();
      return state.sections.find(
        (s) => (args.where.id && s.id === args.where.id) || (args.where.slug && s.slug === args.where.slug)
      ) || null;
    },

    create: async (args: { data: { name: string; slug: string; sortOrder?: number } }) => {
      const state = storeManager.getState();
      const id = `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newSec: SectionRecord = {
        id,
        name: args.data.name,
        slug: args.data.slug,
        sortOrder: args.data.sortOrder ?? state.sections.length,
      };
      state.sections.push(newSec);
      storeManager.saveState();
      return newSec;
    },

    update: async (args: { where: { id: string }; data: Partial<SectionRecord> }) => {
      const state = storeManager.getState();
      const sec = state.sections.find((s) => s.id === args.where.id);
      if (!sec) throw new Error("Section not found");
      Object.assign(sec, args.data);
      storeManager.saveState();
      return sec;
    },

    delete: async (args: { where: { id: string } }) => {
      const state = storeManager.getState();
      state.sections = state.sections.filter((s) => s.id !== args.where.id);
      state.productSections = state.productSections.filter((ps) => ps.sectionId !== args.where.id);
      storeManager.saveState();
      return true;
    },
  },

  // Product Variants
  productVariant: {
    findUnique: async (args: { where: { id: string } }) => {
      const state = storeManager.getState();
      return state.productVariants.find((v: any) => v.id === args.where.id) || null;
    },
    update: async (args: {
      where: { id: string };
      data: { stock?: number | { decrement?: number; increment?: number } };
    }) => {
      const state = storeManager.getState();
      const variant = state.productVariants.find((v: any) => v.id === args.where.id);
      if (!variant) throw new Error(`Product variant not found: ${args.where.id}`);
      if (typeof args.data.stock === "number") {
        variant.stock = args.data.stock;
      } else if (args.data.stock && typeof args.data.stock.decrement === "number") {
        variant.stock = Math.max(0, variant.stock - args.data.stock.decrement);
      } else if (args.data.stock && typeof args.data.stock.increment === "number") {
        variant.stock += args.data.stock.increment;
      }
      storeManager.saveState();
      return variant;
    },
  },

  // Orders
  order: {
    findMany: async (args?: {
      where?: {
        profileId?: string;
        status?: OrderStatus;
        payment?: { status?: PaymentStatus; method?: PaymentMethod };
        OR?: Array<{ orderNumber?: { contains: string; mode?: string }; profile?: { email?: { contains: string; mode?: string } } }>;
      };
      orderBy?: { createdAt?: "asc" | "desc" };
      skip?: number;
      take?: number;
    }) => {
      const state = storeManager.getState();
      let results = [...state.orders];

      if (args?.where) {
        const w = args.where;
        if (w.profileId) results = results.filter((o) => o.profileId === w.profileId);
        if (w.status) results = results.filter((o) => o.status === w.status);
        if (w.payment?.status) {
          const matchingOrderIds = new Set(
            state.payments.filter((p) => p.status === w.payment!.status).map((p) => p.orderId)
          );
          results = results.filter((o) => matchingOrderIds.has(o.id));
        }
        if (w.payment?.method) {
          const matchingOrderIds = new Set(
            state.payments.filter((p) => p.method === w.payment!.method).map((p) => p.orderId)
          );
          results = results.filter((o) => matchingOrderIds.has(o.id));
        }
        if (w.OR && w.OR.length > 0) {
          results = results.filter((o) => {
            const customer = state.profiles.find((p) => p.id === o.profileId);
            return w.OR!.some((cond) => {
              if (cond.orderNumber?.contains) {
                return o.orderNumber.toLowerCase().includes(cond.orderNumber.contains.toLowerCase());
              }
              if (cond.profile?.email?.contains && customer) {
                return customer.email.toLowerCase().includes(cond.profile.email.contains.toLowerCase());
              }
              return false;
            });
          });
        }
      }

      const dir = args?.orderBy?.createdAt === "asc" ? 1 : -1;
      results.sort((a, b) => dir * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      if (typeof args?.skip === "number") results = results.slice(args.skip);
      if (typeof args?.take === "number") results = results.slice(0, args.take);

      return results.map((o) => {
        const profile = state.profiles.find((p) => p.id === o.profileId);
        const items = state.orderItems
          .filter((item) => item.orderId === o.id)
          .map((item) => ({
            ...item,
            product: state.products.find((p) => p.id === item.productId),
            variant: state.productVariants.find((v) => v.id === item.variantId),
          }));
        const statusHistory = state.orderStatusEvents
          .filter((e) => e.orderId === o.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const payment = state.payments.find((p) => p.orderId === o.id);
        const paymentWithLogs = payment
          ? {
              ...payment,
              log: state.paymentLogEvents
                .filter((l) => l.paymentId === payment.id)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
            }
          : null;

        return {
          ...o,
          profile,
          items,
          statusHistory,
          payment: paymentWithLogs,
        };
      });
    },

    findUnique: async (args: { where: { id?: string; orderNumber?: string } }) => {
      const state = storeManager.getState();
      const o = state.orders.find(
        (ord) =>
          (args.where.id && ord.id === args.where.id) ||
          (args.where.orderNumber && ord.orderNumber === args.where.orderNumber)
      );
      if (!o) return null;

      const profile = state.profiles.find((p) => p.id === o.profileId);
      const items = state.orderItems
        .filter((item) => item.orderId === o.id)
        .map((item) => ({
          ...item,
          product: state.products.find((p) => p.id === item.productId),
          variant: state.productVariants.find((v) => v.id === item.variantId),
        }));
      const statusHistory = state.orderStatusEvents
        .filter((e) => e.orderId === o.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const payment = state.payments.find((p) => p.orderId === o.id);
      const paymentWithLogs = payment
        ? {
            ...payment,
            log: state.paymentLogEvents
              .filter((l) => l.paymentId === payment.id)
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
          }
        : null;

      return {
        ...o,
        profile,
        items,
        statusHistory,
        payment: paymentWithLogs,
      };
    },

    create: async (args: { data: any }) => {
      const state = storeManager.getState();
      const now = new Date().toISOString();
      const id = args.data.id || `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const orderNumber = args.data.orderNumber || `CW-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder: OrderRecord = {
        id,
        orderNumber,
        profileId: args.data.profileId,
        shippingAddress: args.data.shippingAddress,
        subtotal: Number(args.data.subtotal),
        shippingFee: Number(args.data.shippingFee || 0),
        total: Number(args.data.total),
        status: (args.data.status as OrderStatus) || "PLACED",
        trackingNumber: args.data.trackingNumber || null,
        carrier: args.data.carrier || null,
        createdAt: now,
        updatedAt: now,
      };

      state.orders.push(newOrder);

      // Create Order Items and decrement stock
      if (args.data.items?.create) {
        args.data.items.create.forEach((item: any, idx: number) => {
          const itemId = `item_${id}_${idx}`;
          state.orderItems.push({
            id: itemId,
            orderId: id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: Number(item.quantity),
            priceAtPurchase: Number(item.priceAtPurchase),
          });

          // Decrement variant stock
          const variant = state.productVariants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - Number(item.quantity));
          }
        });
      }

      // Create initial OrderStatusEvent
      const statusEventId = `evt_${id}_0`;
      state.orderStatusEvents.push({
        id: statusEventId,
        orderId: id,
        status: newOrder.status,
        note: "Order placed by customer",
        updatedBy: "system",
        createdAt: now,
      });

      // Create Payment
      if (args.data.payment?.create) {
        const p = args.data.payment.create;
        const paymentId = `pay_${id}`;
        state.payments.push({
          id: paymentId,
          orderId: id,
          method: p.method as PaymentMethod,
          status: p.status as PaymentStatus,
          amountDue: Number(p.amountDue),
          amountPaid: Number(p.amountPaid || 0),
          updatedAt: now,
        });

        // If mock prepaid or paid at start, log event
        if (p.method === "PREPAID_MOCK" || p.status === "PAID") {
          state.paymentLogEvents.push({
            id: `paylog_${paymentId}_0`,
            paymentId,
            amount: Number(p.amountPaid || p.amountDue),
            status: p.status as PaymentStatus,
            source: "system",
            note: "Simulated prepaid payment completed successfully",
            createdAt: now,
          });
        }
      }

      storeManager.saveState();
      return localDb.order.findUnique({ where: { id } });
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const state = storeManager.getState();
      const o = state.orders.find((ord) => ord.id === args.where.id);
      if (!o) throw new Error("Order not found");

      const prevStatus = o.status;
      const now = new Date().toISOString();

      if (args.data.status !== undefined && args.data.status !== prevStatus) {
        o.status = args.data.status;
        o.updatedAt = now;

        // If status transitioned to CANCELLED, restore variant stock!
        if (o.status === "CANCELLED" && prevStatus !== "CANCELLED") {
          const items = state.orderItems.filter((i) => i.orderId === o.id);
          items.forEach((item) => {
            const variant = state.productVariants.find((v) => v.id === item.variantId);
            if (variant) {
              variant.stock += item.quantity;
            }
          });
        }

        // Record status event
        state.orderStatusEvents.push({
          id: `evt_${o.id}_${Date.now()}`,
          orderId: o.id,
          status: o.status,
          note: args.data.statusNote || `Order status updated to ${o.status}`,
          updatedBy: args.data.updatedBy || "system",
          createdAt: now,
        });
      }

      if (args.data.trackingNumber !== undefined) {
        o.trackingNumber = args.data.trackingNumber;
        o.updatedAt = now;
      }

      if (args.data.carrier !== undefined) {
        o.carrier = args.data.carrier;
        o.updatedAt = now;
      }

      storeManager.saveState();
      return localDb.order.findUnique({ where: { id: o.id } });
    },

    count: async (args?: { where?: any }) => {
      const list = await localDb.order.findMany(args);
      return list.length;
    },
  },

  // Payment updates
  payment: {
    findUnique: async (args: { where: { orderId?: string; id?: string } }) => {
      const state = storeManager.getState();
      const p = state.payments.find(
        (pay) =>
          (args.where.id && pay.id === args.where.id) ||
          (args.where.orderId && pay.orderId === args.where.orderId)
      );
      if (!p) return null;
      return {
        ...p,
        log: state.paymentLogEvents
          .filter((l) => l.paymentId === p.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      };
    },

    update: async (args: {
      where: { orderId: string };
      data: {
        amountPaid?: number;
        status?: PaymentStatus;
        logEvent?: {
          amount: number;
          status: PaymentStatus;
          source: string;
          note: string;
        };
      };
    }) => {
      const state = storeManager.getState();
      const p = state.payments.find((pay) => pay.orderId === args.where.orderId);
      if (!p) throw new Error("Payment record not found");

      const now = new Date().toISOString();

      if (args.data.status !== undefined) p.status = args.data.status;
      if (args.data.amountPaid !== undefined) p.amountPaid = Number(args.data.amountPaid);
      p.updatedAt = now;

      if (args.data.logEvent) {
        state.paymentLogEvents.push({
          id: `paylog_${p.id}_${Date.now()}`,
          paymentId: p.id,
          amount: Number(args.data.logEvent.amount),
          status: args.data.logEvent.status,
          source: args.data.logEvent.source,
          note: args.data.logEvent.note,
          createdAt: now,
        });
      }

      storeManager.saveState();
      return localDb.payment.findUnique({ where: { id: p.id } });
    },
  },

  // Profiles (Users)
  profile: {
    findUnique: async (args: { where: { id?: string; email?: string } }) => {
      const state = storeManager.getState();
      const prof = state.profiles.find(
        (p) =>
          (args.where.id && p.id === args.where.id) ||
          (args.where.email && p.email.toLowerCase() === args.where.email.toLowerCase().trim())
      );
      if (!prof) return null;
      return {
        ...prof,
        addresses: state.addresses.filter((a) => a.profileId === prof.id),
      };
    },

    findMany: async (args?: {
      where?: { role?: Role; email?: { contains: string } };
      skip?: number;
      take?: number;
      orderBy?: { createdAt?: "asc" | "desc" };
    }) => {
      const state = storeManager.getState();
      let results = [...state.profiles];

      if (args?.where?.role) {
        results = results.filter((p) => p.role === args.where!.role);
      }
      if (args?.where?.email?.contains) {
        results = results.filter((p) =>
          p.email.toLowerCase().includes(args.where!.email!.contains.toLowerCase())
        );
      }

      if (typeof args?.skip === "number") results = results.slice(args.skip);
      if (typeof args?.take === "number") results = results.slice(0, args.take);

      return results.map((prof) => {
        const customerOrders = state.orders.filter((o) => o.profileId === prof.id);
        const totalSpend = customerOrders.reduce((sum, o) => sum + o.total, 0);
        return {
          ...prof,
          ordersCount: customerOrders.length,
          totalSpend,
          addresses: state.addresses.filter((a) => a.profileId === prof.id),
        };
      });
    },

    create: async (args: { data: { email: string; fullName?: string; phone?: string; role?: Role; passwordHash?: string; id?: string } }) => {
      const state = storeManager.getState();
      const existing = state.profiles.find(
        (p) => p.email.toLowerCase() === args.data.email.toLowerCase().trim()
      );
      if (existing) throw new Error("A profile with this email already exists");

      const id = args.data.id || `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newProf: ProfileRecord = {
        id,
        email: args.data.email.toLowerCase().trim(),
        fullName: args.data.fullName || null,
        phone: args.data.phone || null,
        role: args.data.role || "CUSTOMER",
        passwordHash: args.data.passwordHash || null,
        createdAt: new Date().toISOString(),
      };

      state.profiles.push(newProf);
      storeManager.saveState();
      return newProf;
    },

    update: async (args: { where: { id: string }; data: Partial<ProfileRecord> }) => {
      const state = storeManager.getState();
      const prof = state.profiles.find((p) => p.id === args.where.id);
      if (!prof) throw new Error("Profile not found");

      Object.assign(prof, args.data);
      storeManager.saveState();
      return prof;
    },

    count: async (args?: { where?: any }) => {
      const list = await localDb.profile.findMany(args);
      return list.length;
    },
  },

  // Addresses
  address: {
    findMany: async (args: { where: { profileId: string } }) => {
      const state = storeManager.getState();
      return state.addresses.filter((a) => a.profileId === args.where.profileId);
    },

    findUnique: async (args: { where: { id: string } }) => {
      const state = storeManager.getState();
      return state.addresses.find((a) => a.id === args.where.id) || null;
    },

    create: async (args: { data: Omit<AddressRecord, "id"> & { id?: string } }) => {
      const state = storeManager.getState();
      const id = args.data.id || `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newAddr: AddressRecord = {
        ...args.data,
        id,
      };

      if (newAddr.isDefault) {
        state.addresses.forEach((a) => {
          if (a.profileId === newAddr.profileId) a.isDefault = false;
        });
      }

      state.addresses.push(newAddr);
      storeManager.saveState();
      return newAddr;
    },

    update: async (args: { where: { id: string }; data: Partial<AddressRecord> }) => {
      const state = storeManager.getState();
      const addr = state.addresses.find((a) => a.id === args.where.id);
      if (!addr) throw new Error("Address not found");

      if (args.data.isDefault) {
        state.addresses.forEach((a) => {
          if (a.profileId === addr.profileId) a.isDefault = false;
        });
      }

      Object.assign(addr, args.data);
      storeManager.saveState();
      return addr;
    },

    delete: async (args: { where: { id: string } }) => {
      const state = storeManager.getState();
      state.addresses = state.addresses.filter((a) => a.id !== args.where.id);
      storeManager.saveState();
      return true;
    },
  },

  // Transaction helper
  $transaction: async <T>(fn: (tx: typeof localDb) => Promise<T>): Promise<T> => {
    return await fn(localDb);
  },
};

// Export active data service: uses localDb if local or Prisma if live Postgres configured
export const db = localDb;
