import crypto from "crypto";

const SECRET_KEY = process.env.SECURITY_HMAC_SECRET || "cally_wear_enterprise_secure_token_secret_k8s_2026";

/**
 * Generate cryptographically secure random hexadecimal token
 */
export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generate a high-entropy tracking secret for guest orders (format: TRK-XXXX-XXXX-XXXX)
 */
export function generateTrackingSecret(): string {
  const buf = crypto.randomBytes(9).toString("hex").toUpperCase();
  return `TRK-${buf.slice(0, 6)}-${buf.slice(6, 12)}-${buf.slice(12, 18)}`;
}

/**
 * Sign payload with HMAC-SHA256 and expiration timestamp
 */
export function signToken(payload: Record<string, unknown>, expiresInMs: number = 24 * 60 * 60 * 1000): string {
  const exp = Date.now() + expiresInMs;
  const data = JSON.stringify({ ...payload, exp });
  const encodedData = Buffer.from(data).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(encodedData).digest("base64url");
  return `${encodedData}.${signature}`;
}

/**
 * Verify and decode HMAC-SHA256 signed token
 */
export function verifySignedToken<T = Record<string, unknown>>(token: string): { valid: boolean; payload?: T; reason?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing_token" };
  }
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "malformed_token" };
  }
  const [encodedData, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(encodedData).digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expectedSigBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
    return { valid: false, reason: "invalid_signature" };
  }

  try {
    const raw = Buffer.from(encodedData, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.exp && typeof parsed.exp === "number" && Date.now() > parsed.exp) {
      return { valid: false, reason: "token_expired" };
    }
    return { valid: true, payload: parsed as T };
  } catch {
    return { valid: false, reason: "unparseable_payload" };
  }
}
