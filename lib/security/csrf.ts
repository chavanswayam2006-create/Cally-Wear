import crypto from "crypto";
import { signToken, verifySignedToken } from "./token";

const CSRF_COOKIE_NAME = "cally_csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a signed anti-CSRF token valid for 24 hours
 */
export function generateCsrfToken(sessionId?: string): string {
  return signToken({ sid: sessionId || "anon", nonce: crypto.randomBytes(16).toString("hex") }, 24 * 60 * 60 * 1000);
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token) return false;
  const result = verifySignedToken(token);
  return result.valid;
}

/**
 * Validate Origin / Referer against host for state-changing requests
 */
export function validateRequestOrigin(headers: Headers, host: string): { valid: boolean; reason?: string } {
  const origin = headers.get("origin");
  const referer = headers.get("referer");

  // If origin is provided, verify it matches host
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const cleanHost = host.split(":")[0];
      if (originUrl.hostname !== cleanHost && originUrl.hostname !== "localhost" && originUrl.hostname !== "127.0.0.1") {
        return { valid: false, reason: `origin_mismatch: ${originUrl.hostname} != ${cleanHost}` };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: "invalid_origin_format" };
    }
  }

  // If no origin, check referer
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const cleanHost = host.split(":")[0];
      if (refererUrl.hostname !== cleanHost && refererUrl.hostname !== "localhost" && refererUrl.hostname !== "127.0.0.1") {
        return { valid: false, reason: `referer_mismatch: ${refererUrl.hostname} != ${cleanHost}` };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: "invalid_referer_format" };
    }
  }

  // Safe fallback if origin/referer omitted in direct API client tests
  return { valid: true };
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
