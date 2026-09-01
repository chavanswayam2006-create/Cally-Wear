import crypto from "crypto";

const SENSITIVE_KEYS = new Set([
  "password",
  "newpassword",
  "oldpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "authorization",
  "cookie",
  "set-cookie",
  "cvv",
  "cardnumber",
  "creditcard",
  "otp",
  "salt",
  "privatekey",
  "webhooksecret",
]);

/**
 * Hash IP address for privacy-preserving logging
 */
export function hashIp(ip: string): string {
  if (!ip) return "anonymous";
  return crypto.createHash("sha256").update(ip + "cally_ip_salt").digest("hex").slice(0, 16);
}

/**
 * Deep redaction of objects, masking sensitive keys and patterns
 */
export function redactSensitiveData<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input !== "object") return input;

  if (Array.isArray(input)) {
    return input.map((item) => redactSensitiveData(item)) as unknown as T;
  }

  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      output[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      output[key] = redactSensitiveData(value);
    } else if (typeof value === "string") {
      // Mask potential credit cards: 13-19 digits
      if (/^\d{13,19}$/.test(value.replace(/[\s-]/g, ""))) {
        output[key] = "[REDACTED_CARD]";
      } else {
        output[key] = value;
      }
    } else {
      output[key] = value;
    }
  }
  return output as T;
}
