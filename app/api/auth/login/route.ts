import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/security/database";
import { verifyPassword } from "@/lib/security/password";
import { checkRateLimit, recordFailure, recordSuccess } from "@/lib/security/rate-limiter";
import { createSession, serializeSessionCookie, rotateSession } from "@/lib/security/session";
import { logSecurityEvent } from "@/lib/security/audit-logger";

const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check Rate Limit (IP + Account combined key)
    const rateLimitKey = `login_${ip}_${cleanEmail}`;
    const rateLimit = checkRateLimit(rateLimitKey, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
      exponentialBackoff: true,
      blockDurationMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      logSecurityEvent({
        eventType: "RATE_LIMIT_EXCEEDED",
        actor: { ip, email: cleanEmail, userAgent },
        outcome: "BLOCKED",
        riskScore: 85,
        metadata: { action: "login_throttled" },
      });
      return NextResponse.json(
        { error: "Too many failed login attempts. Please try again after 15 minutes." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds || 900) } }
      );
    }

    // 2. Lookup user
    const user = db.users.findByEmail(cleanEmail);

    let isValid = false;
    if (user) {
      isValid = verifyPassword(password, user.passwordHash, user.salt);
    } else {
      // Dummy constant-time work to balance timing against enumeration
      verifyPassword(password, "00".repeat(64), "00".repeat(16));
    }

    if (!isValid || !user) {
      recordFailure(rateLimitKey, { windowMs: 15 * 60 * 1000, maxRequests: 5, exponentialBackoff: true });

      logSecurityEvent({
        eventType: "AUTH_LOGIN_FAILURE",
        actor: { ip, email: cleanEmail, userAgent },
        outcome: "FAILURE",
        riskScore: 40,
        metadata: { reason: "credentials_mismatch" },
      });

      // Generic uniform response
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Reset rate limit failure count on successful login
    recordSuccess(rateLimitKey);

    // 3. Create / Rotate Session
    const session = createSession({
      userId: user.id,
      role: user.role,
      email: user.email,
      ip,
      userAgent,
    });

    logSecurityEvent({
      eventType: "AUTH_LOGIN_SUCCESS",
      actor: { userId: user.id, email: user.email, role: user.role, ip, userAgent },
      outcome: "SUCCESS",
      riskScore: 0,
      metadata: { sessionId: session.sessionId },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVip: user.role !== "customer" || true,
        addresses: user.addresses,
      },
    });

    // Set Secure HttpOnly SameSite=Strict cookie
    response.headers.set("Set-Cookie", serializeSessionCookie(session.sessionId));

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Authentication failed", details: errorMsg }, { status: 500 });
  }
}
