import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Product } from "@/lib/types/product";

export const FREE_SHIPPING_THRESHOLD = 1999;
export const STANDARD_SHIPPING_FEE = 199;

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string | null;
  discountPercent: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  
  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getFreeShippingProgress: () => { current: number; threshold: number; remaining: number; percent: number };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: null,
      discountPercent: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product, size, color, quantity = 1) => {
        set((state) => {
          const itemId = `${product.id}-${size}-${color}`;
          const existingItemIndex = state.items.findIndex((item) => item.id === itemId);

          // Find colorway image if available
          const colorObj = product.colors.find((c) => c.name === color);
          const itemImage = colorObj?.images?.[0] || product.images[0];

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingItemIndex];
            const newQty = Math.min(currentItem.quantity + quantity, product.stock);
            updatedItems[existingItemIndex] = {
              ...currentItem,
              quantity: newQty,
            };
            return { items: updatedItems, isOpen: true };
          } else {
            const newItem: CartItem = {
              id: itemId,
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              image: itemImage,
              size,
              color,
              quantity: Math.min(quantity, product.stock),
              stock: product.stock,
            };
            return { items: [...state.items, newItem], isOpen: true };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) };
          }
          return {
            items: state.items.map((item) =>
              item.id === itemId
                ? { ...item, quantity: Math.min(quantity, item.stock) }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [], promoCode: null, discountPercent: 0 }),

      applyPromoCode: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === "CALLY10" || cleanCode === "FIRST10") {
          set({ promoCode: cleanCode, discountPercent: 10 });
          return { success: true, message: "10% discount applied successfully!" };
        } else if (cleanCode === "DROP15" || cleanCode === "VIP15") {
          set({ promoCode: cleanCode, discountPercent: 15 });
          return { success: true, message: "15% VIP drop discount applied!" };
        } else {
          return { success: false, message: "Invalid promo code. Try 'CALLY10' or 'VIP15'" };
        }
      },

      removePromoCode: () => set({ promoCode: null, discountPercent: 0 }),

      getItemCount: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const percent = get().discountPercent;
        if (percent <= 0) return 0;
        return Math.round((subtotal * percent) / 100);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
        return STANDARD_SHIPPING_FEE;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount + shipping);
      },

      getFreeShippingProgress: () => {
        const subtotal = get().getSubtotal();
        const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
        const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        return {
          current: subtotal,
          threshold: FREE_SHIPPING_THRESHOLD,
          remaining,
          percent,
        };
      },
    }),
    {
      name: "cally-wear-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        discountPercent: state.discountPercent,
      }),
    }
  )
);
