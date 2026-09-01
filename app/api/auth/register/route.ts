import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/security/database";
import { hashPassword } from "@/lib/security/password";
import { checkRateLimit, recordFailure } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { generateRandomToken } from "@/lib/security/token";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  password: z.string().min(8).max(128),
  phone: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  
  // Rate limit: 5 registrations per 15 mins per IP
  const rateLimit = checkRateLimit(`reg_${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 5 });
  if (!rateLimit.allowed) {
    logSecurityEvent({
      eventType: "RATE_LIMIT_EXCEEDED",
      actor: { ip },
      outcome: "BLOCKED",
      riskScore: 70,
      metadata: { action: "register" },
    });
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds || 60) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = db.users.findByEmail(cleanEmail);
    if (existing) {
      // Uniform generic response: don't reveal email exists
      return NextResponse.json(
        { success: true, message: "Registration successful. Please verify your email." },
        { status: 201 }
      );
    }

    const { hash, salt } = hashPassword(password);
    const verifyToken = generateRandomToken(32);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    db.users.save({
      id: userId,
      name,
      email: cleanEmail,
      phone,
      role: "customer",
      passwordHash: hash,
      salt,
      isEmailVerified: false,
      emailVerificationToken: verifyToken,
      emailVerificationExp: Date.now() + 24 * 60 * 60 * 1000, // 24h
      createdAt: Date.now(),
      addresses: [],
    });

    logSecurityEvent({
      eventType: "AUTH_LOGIN_SUCCESS",
      actor: { userId, email: cleanEmail, ip, role: "customer" },
      resource: { type: "user", id: userId },
      outcome: "SUCCESS",
      metadata: { action: "user_registered" },
    });

    return NextResponse.json(
      { success: true, message: "Registration successful. Please verify your email.", verificationToken: verifyToken },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Registration failed", details: errorMsg }, { status: 500 });
  }
}
