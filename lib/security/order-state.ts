export type OrderStatus =
  | "awaiting_payment"
  | "pending"
  | "paid"
  | "confirmed"
  | "packed"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "delivery_failed";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, Set<OrderStatus>> = {
  awaiting_payment: new Set(["paid", "confirmed", "cancelled"]),
  pending: new Set(["confirmed", "cancelled", "awaiting_payment"]),
  paid: new Set(["confirmed", "refunded", "cancelled"]),
  confirmed: new Set(["packed", "cancelled"]),
  packed: new Set(["in_transit", "cancelled"]),
  in_transit: new Set(["delivered", "delivery_failed", "cancelled"]),
  delivered: new Set(["refunded"]),
  cancelled: new Set([]), // Terminal state
  refunded: new Set([]),  // Terminal state
  delivery_failed: new Set(["in_transit", "cancelled", "refunded"]),
};

/**
 * Validates if an order state transition is permitted by the state machine
 */
export function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return !!allowed && allowed.has(newStatus);
}

/**
 * Check if the transition requires privileged role (admin / webhook)
 */
export function requiresPrivilegedRole(newStatus: OrderStatus): boolean {
  return ["confirmed", "packed", "in_transit", "delivered", "refunded"].includes(newStatus);
}
