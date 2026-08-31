import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Order } from "@/lib/types/product";

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  addOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,

      addOrder: (order: Order) => {
        set((state) => ({
          orders: [order, ...state.orders],
          currentOrder: order,
        }));
      },

      getOrderById: (orderId: string) => {
        return get().orders.find((o) => o.id === orderId);
      },

      getOrderByNumber: (orderNumber: string) => {
        return get().orders.find((o) => o.orderNumber === orderNumber);
      },
    }),
    {
      name: "cally-wear-orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
