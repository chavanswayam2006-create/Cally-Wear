import { SessionData, hasActiveStepUp } from "./session";

export type Role = "customer" | "support_rep" | "order_manager" | "catalog_manager" | "super_admin";

export type Permission =
  | "orders:read:self"
  | "orders:create:self"
  | "profile:update:self"
  | "orders:read:all"
  | "orders:status:update"
  | "orders:refund"
  | "catalog:edit"
  | "inventory:edit"
  | "discounts:manage"
  | "audit:read"
  | "users:manage_roles"
  | "system:settings";

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  customer: new Set(["orders:read:self", "orders:create:self", "profile:update:self"]),
  support_rep: new Set([
    "orders:read:self",
    "orders:create:self",
    "profile:update:self",
    "orders:read:all",
    "orders:status:update",
  ]),
  order_manager: new Set([
    "orders:read:self",
    "orders:create:self",
    "profile:update:self",
    "orders:read:all",
    "orders:status:update",
    "orders:refund",
    "inventory:edit",
  ]),
  catalog_manager: new Set([
    "orders:read:self",
    "orders:create:self",
    "profile:update:self",
    "catalog:edit",
    "inventory:edit",
    "discounts:manage",
  ]),
  super_admin: new Set([
    "orders:read:self",
    "orders:create:self",
    "profile:update:self",
    "orders:read:all",
    "orders:status:update",
    "orders:refund",
    "catalog:edit",
    "inventory:edit",
    "discounts:manage",
    "audit:read",
    "users:manage_roles",
    "system:settings",
  ]),
};

// Sensitive permissions that mandate active step-up authentication
const STEP_UP_REQUIRED_PERMISSIONS = new Set<Permission>([
  "orders:refund",
  "users:manage_roles",
  "system:settings",
]);

/**
 * Check if a role possesses the specified permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return !!perms && perms.has(permission);
}

export interface AuthCheckResult {
  allowed: boolean;
  reason?: "unauthenticated" | "forbidden" | "step_up_required";
  session?: SessionData;
}

/**
 * Perform server-side authorization check with optional step-up requirement
 */
export function authorizeRequest(
  session: SessionData | null,
  permission: Permission
): AuthCheckResult {
  if (!session) {
    return { allowed: false, reason: "unauthenticated" };
  }

  if (!hasPermission(session.role, permission)) {
    return { allowed: false, reason: "forbidden", session };
  }

  if (STEP_UP_REQUIRED_PERMISSIONS.has(permission) && !hasActiveStepUp(session)) {
    return { allowed: false, reason: "step_up_required", session };
  }

  return { allowed: true, session };
}
