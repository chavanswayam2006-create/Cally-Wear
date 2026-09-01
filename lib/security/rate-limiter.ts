interface RateLimitRecord {
  timestamps: number[];
  failedAttempts: number;
  blockedUntil?: number;
}

const store = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
  exponentialBackoff?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds?: number;
  riskScore?: number;
}

/**
 * Check and consume a rate limit token
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  let record = store.get(key);

  if (!record) {
    record = { timestamps: [], failedAttempts: 0 };
    store.set(key, record);
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTimeMs: record.blockedUntil,
      retryAfterSeconds,
      riskScore: 80,
    };
  }

  // Filter timestamps within window
  record.timestamps = record.timestamps.filter((ts) => ts > now - config.windowMs);

  if (record.timestamps.length >= config.maxRequests) {
    // Exceeded limit: apply block duration if configured
    const blockMs = config.blockDurationMs || config.windowMs;
    record.blockedUntil = now + blockMs;
    const retryAfterSeconds = Math.ceil(blockMs / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetTimeMs: record.blockedUntil,
      retryAfterSeconds,
      riskScore: 60 + Math.min(record.failedAttempts * 10, 40),
    };
  }

  // Allow and record
  record.timestamps.push(now);
  const remaining = config.maxRequests - record.timestamps.length;
  const oldestTimestamp = record.timestamps[0] || now;
  const resetTimeMs = oldestTimestamp + config.windowMs;

  return {
    allowed: true,
    remaining,
    resetTimeMs,
    riskScore: 0,
  };
}

/**
 * Record a security failure event for exponential backoff / anomaly scoring
 */
export function recordFailure(key: string, config: RateLimitConfig): void {
  const now = Date.now();
  let record = store.get(key);
  if (!record) {
    record = { timestamps: [now], failedAttempts: 1 };
    store.set(key, record);
  } else {
    record.failedAttempts += 1;
  }

  if (config.exponentialBackoff && record.failedAttempts >= 3) {
    // 2^(attempts - 2) * 5 seconds
    const backoffMs = Math.min(Math.pow(2, record.failedAttempts - 2) * 5000, 3600000);
    record.blockedUntil = now + backoffMs;
  }
}

/**
 * Reset failure counter on successful operation
 */
export function recordSuccess(key: string): void {
  const record = store.get(key);
  if (record) {
    record.failedAttempts = 0;
    record.blockedUntil = undefined;
  }
}

/**
 * Clear rate limit store for testing
 */
export function __clearRateLimitsForTesting(): void {
  store.clear();
}
