import crypto from "crypto";

/**
 * Enterprise Password Hashing and Constant-Time Verification
 * Uses Node.js native crypto scrypt with high-cost parameters and per-password unique salt.
 * Ensures timing-attack resistance via crypto.timingSafeEqual.
 */

const SCRYPT_PARAMS = {
  N: 32768, // CPU/memory cost
  r: 8,     // Block size
  p: 1,     // Parallelization
  maxmem: 64 * 1024 * 1024, // 64 MB
};
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export interface HashResult {
  hash: string;
  salt: string;
  algorithm: "scrypt-v1";
}

/**
 * Hashes a password with a cryptographically secure unique salt.
 */
export function hashPassword(password: string): HashResult {
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return {
    hash: derivedKey.toString("hex"),
    salt,
    algorithm: "scrypt-v1",
  };
}

/**
 * Constant-time verification of password against stored hash and salt.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  if (!password || !storedHash || !salt) {
    return false;
  }
  try {
    const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
    const storedHashBuffer = Buffer.from(storedHash, "hex");
    if (derivedKey.length !== storedHashBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, storedHashBuffer);
  } catch {
    return false;
  }
}
