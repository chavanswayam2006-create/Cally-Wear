import crypto from "crypto";
import { hashIp } from "./redactor";

export interface SessionData {
  sessionId: string;
  userId: string;
  role: "customer" | "support_rep" | "order_manager" | "catalog_manager" | "super_admin";
  email: string;
  createdAt: number;
  lastActiveAt: number;
  ipHash: string;
  userAgent?: string;
  isStepUpVerified?: boolean;
  stepUpUntil?: number;
}

const SESSION_COOKIE_NAME = "cally_session_id";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 mins for privileged roles

// In-memory active session store
const activeSessions = new Map<string, SessionData>();
// User ID -> Set of Session IDs (for multi-device tracking / revocation)
const userSessionIndex = new Map<string, Set<string>>();

/**
 * Generate a cryptographically secure random session ID
 */
export function generateSessionId(): string {
  return `csess_${crypto.randomBytes(32).toString("hex")}`;
}

/**
 * Create a new authenticated session
 */
export function createSession(params: {
  userId: string;
  role: "customer" | "support_rep" | "order_manager" | "catalog_manager" | "super_admin";
  email: string;
  ip?: string;
  userAgent?: string;
}): SessionData {
  const sessionId = generateSessionId();
  const now = Date.now();
  const session: SessionData = {
    sessionId,
    userId: params.userId,
    role: params.role,
    email: params.email,
    createdAt: now,
    lastActiveAt: now,
    ipHash: hashIp(params.ip || ""),
    userAgent: params.userAgent,
    isStepUpVerified: false,
  };

  activeSessions.set(sessionId, session);

  let userSessions = userSessionIndex.get(params.userId);
  if (!userSessions) {
    userSessions = new Set();
    userSessionIndex.set(params.userId, userSessions);
  }
  userSessions.add(sessionId);

  return session;
}

/**
 * Validate active session token
 */
export function getSession(sessionId: string): SessionData | null {
  if (!sessionId) return null;
  const session = activeSessions.get(sessionId);
  if (!session) return null;

  const now = Date.now();

  // Expiration check
  if (now - session.createdAt > SESSION_MAX_AGE_MS) {
    revokeSession(sessionId);
    return null;
  }

  // Privileged idle check
  if (session.role !== "customer" && now - session.lastActiveAt > ADMIN_IDLE_TIMEOUT_MS) {
    revokeSession(sessionId);
    return null;
  }

  // Update touch
  session.lastActiveAt = now;
  return session;
}

/**
 * Rotate session ID (prevents session fixation on login/privilege escalation)
 */
export function rotateSession(oldSessionId: string): SessionData | null {
  const oldSession = activeSessions.get(oldSessionId);
  if (!oldSession) return null;

  // Revoke old
  revokeSession(oldSessionId);

  // Create new session with preserved identity
  const newSessionId = generateSessionId();
  const now = Date.now();
  const newSession: SessionData = {
    ...oldSession,
    sessionId: newSessionId,
    createdAt: now,
    lastActiveAt: now,
  };

  activeSessions.set(newSessionId, newSession);

  let userSessions = userSessionIndex.get(newSession.userId);
  if (!userSessions) {
    userSessions = new Set();
    userSessionIndex.set(newSession.userId, userSessions);
  }
  userSessions.add(newSessionId);

  return newSession;
}

/**
 * Revoke single session
 */
export function revokeSession(sessionId: string): void {
  const session = activeSessions.get(sessionId);
  if (session) {
    activeSessions.delete(sessionId);
    const userSessions = userSessionIndex.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
    }
  }
}

/**
 * Revoke ALL active sessions for a user (e.g. on password reset or account recovery)
 */
export function revokeAllUserSessions(userId: string): void {
  const sessionIds = userSessionIndex.get(userId);
  if (sessionIds) {
    for (const sid of sessionIds) {
      activeSessions.delete(sid);
    }
    userSessionIndex.delete(userId);
  }
}

/**
 * Grant step-up authentication for sensitive operations
 */
export function grantStepUp(sessionId: string, durationMinutes: number = 10): boolean {
  const session = activeSessions.get(sessionId);
  if (!session) return false;
  session.isStepUpVerified = true;
  session.stepUpUntil = Date.now() + durationMinutes * 60 * 1000;
  return true;
}

/**
 * Check if session has active step-up verification
 */
export function hasActiveStepUp(session: SessionData): boolean {
  if (!session.isStepUpVerified || !session.stepUpUntil) return false;
  return Date.now() <= session.stepUpUntil;
}

/**
 * Helper to generate secure Set-Cookie header string
 */
export function serializeSessionCookie(sessionId: string, maxAgeSeconds: number = 7 * 86400): string {
  const isProd = process.env.NODE_ENV === "production";
  const flags = [
    `${SESSION_COOKIE_NAME}=${sessionId}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isProd) {
    flags.push("Secure");
  }
  return flags.join("; ");
}

/**
 * Helper to generate deletion Set-Cookie header string
 */
export function serializeLogoutCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { SESSION_COOKIE_NAME };
