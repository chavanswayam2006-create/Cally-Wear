import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/security/database";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { generateRandomToken } from "@/lib/security/token";
import { logSecurityEvent } from "@/lib/security/audit-logger";

const schema = z.object({
  email: z.string().email().max(120),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  const rateLimit = checkRateLimit(`fp_${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 3 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many password reset requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds || 60) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "If an account with this email exists, password reset instructions have been sent." },
        { status: 200 }
      );
    }

    const cleanEmail = parsed.data.email.toLowerCase().trim();
    const user = db.users.findByEmail(cleanEmail);

    let resetToken: string | undefined = undefined;

    if (user) {
      resetToken = generateRandomToken(32);
      user.passwordResetToken = resetToken;
      user.passwordResetExp = Date.now() + 15 * 60 * 1000; // 15 minutes
      db.users.save(user);

      logSecurityEvent({
        eventType: "AUTH_PASSWORD_RESET_REQUEST",
        actor: { userId: user.id, email: user.email, ip },
        outcome: "SUCCESS",
        metadata: { action: "password_reset_token_issued" },
      });
    }

    // Always return generic success response
    return NextResponse.json({
      message: "If an account with this email exists, password reset instructions have been sent.",
      // Token returned only in dev / test mode for automated test verification
      ...(process.env.NODE_ENV !== "production" && resetToken ? { testResetToken: resetToken } : {}),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Password reset request failed", details: errorMsg }, { status: 500 });
  }
}
