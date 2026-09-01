import { products } from "@/lib/data/products";

// Server-side inventory state map (productId -> stock)
const stockMap = new Map<string, number>();
const activeLocks = new Set<string>();

// Initialize stock from seed catalog
for (const p of products) {
  stockMap.set(p.id, p.stock);
}

/**
 * Get current server-side stock level
 */
export function getProductStock(productId: string): number {
  return stockMap.get(productId) ?? 0;
}

/**
 * Atomically reserve and decrement inventory for order items.
 * Uses mutex lock to guarantee zero overselling during concurrent checkout races.
 */
export async function atomicallyDeductStock(
  items: Array<{ productId: string; quantity: number }>
): Promise<{ success: boolean; error?: string; failedProductId?: string }> {
  // Simple in-memory mutex acquisition
  const lockKey = "inventory_global_mutex";
  while (activeLocks.has(lockKey)) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  activeLocks.add(lockKey);

  try {
    // 1. Pre-check all items have sufficient stock
    for (const item of items) {
      const currentStock = stockMap.get(item.productId) ?? 0;
      if (currentStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for product ID ${item.productId}. Available: ${currentStock}, requested: ${item.quantity}`,
          failedProductId: item.productId,
        };
      }
    }

    // 2. Decrement stock atomically
    for (const item of items) {
      const currentStock = stockMap.get(item.productId) ?? 0;
      stockMap.set(item.productId, currentStock - item.quantity);
    }

    return { success: true };
  } finally {
    activeLocks.delete(lockKey);
  }
}

/**
 * Restock inventory (on cancellation or refund)
 */
export function restockInventory(items: Array<{ productId: string; quantity: number }>): void {
  for (const item of items) {
    const currentStock = stockMap.get(item.productId) ?? 0;
    stockMap.set(item.productId, currentStock + item.quantity);
  }
}

/**
 * Reset inventory to seed state for tests
 */
export function __resetInventoryForTesting(): void {
  stockMap.clear();
  for (const p of products) {
    stockMap.set(p.id, p.stock);
  }
}
