import { redactSensitiveData, hashIp } from "./redactor";

export type AuditEventType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILURE"
  | "AUTH_LOGOUT"
  | "AUTH_PASSWORD_RESET_REQUEST"
  | "AUTH_PASSWORD_RESET_SUCCESS"
  | "AUTH_STEP_UP_CHALLENGE"
  | "AUTH_STEP_UP_SUCCESS"
  | "ORDER_CREATED"
  | "ORDER_STATE_TRANSITION"
  | "ORDER_REFUND_INITIATED"
  | "GUEST_TRACKING_ATTEMPT"
  | "GUEST_TRACKING_BLOCKED"
  | "ADMIN_ROLE_CHANGE"
  | "ADMIN_CATALOG_UPDATE"
  | "ADMIN_INVENTORY_UPDATE"
  | "USER_DATA_EXPORT"
  | "USER_DATA_ANONYMIZED"
  | "RATE_LIMIT_EXCEEDED"
  | "CSRF_VERIFICATION_FAILED"
  | "WEBHOOK_PROCESSED"
  | "WEBHOOK_REJECTED";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  actor: {
    userId?: string;
    email?: string;
    role?: string;
    hashedIp: string;
    userAgent?: string;
  };
  resource?: {
    type: string;
    id: string;
  };
  outcome: "SUCCESS" | "FAILURE" | "DENIED" | "BLOCKED";
  riskScore: number; // 0 (normal) to 100 (critical)
  metadata: Record<string, unknown>;
}

// In-memory append-only audit log store
const auditLogs: AuditLogEntry[] = [];

/**
 * Log a structured, redacted security event to the audit trail
 */
export function logSecurityEvent(params: {
  eventType: AuditEventType;
  actor?: {
    userId?: string;
    email?: string;
    role?: string;
    ip?: string;
    userAgent?: string;
  };
  resource?: {
    type: string;
    id: string;
  };
  outcome: "SUCCESS" | "FAILURE" | "DENIED" | "BLOCKED";
  riskScore?: number;
  metadata?: Record<string, unknown>;
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    eventType: params.eventType,
    actor: {
      userId: params.actor?.userId,
      email: params.actor?.email ? params.actor.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : undefined,
      role: params.actor?.role || "anonymous",
      hashedIp: hashIp(params.actor?.ip || ""),
      userAgent: params.actor?.userAgent ? params.actor.userAgent.slice(0, 120) : undefined,
    },
    resource: params.resource,
    outcome: params.outcome,
    riskScore: params.riskScore ?? 0,
    metadata: redactSensitiveData(params.metadata || {}),
  };

  // Append-only
  auditLogs.push(Object.freeze(entry));

  // Console output for structured log collectors (Datadog/CloudWatch)
  if (process.env.NODE_ENV !== "test") {
    console.info(`[AUDIT_LOG] ${JSON.stringify(entry)}`);
  }

  return entry;
}

/**
 * Query audit logs (Admin only)
 */
export function getAuditLogs(filter?: {
  eventType?: AuditEventType;
  actorUserId?: string;
  limit?: number;
}): AuditLogEntry[] {
  let list = [...auditLogs].reverse();
  if (filter?.eventType) {
    list = list.filter((e) => e.eventType === filter.eventType);
  }
  if (filter?.actorUserId) {
    list = list.filter((e) => e.actor.userId === filter.actorUserId);
  }
  return list.slice(0, filter?.limit || 50);
}

/**
 * Clear logs for testing environment
 */
export function __clearAuditLogsForTesting(): void {
  auditLogs.length = 0;
}
