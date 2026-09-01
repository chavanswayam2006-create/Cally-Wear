import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/security/database";
import { hashPassword } from "@/lib/security/password";
import { revokeAllUserSessions } from "@/lib/security/session";
import { logSecurityEvent } from "@/lib/security/audit-logger";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid password reset submission" }, { status: 400 });
    }

    const { email, token, newPassword } = parsed.data;
    const user = db.users.findByEmail(email);

    if (
      !user ||
      !user.passwordResetToken ||
      user.passwordResetToken !== token ||
      !user.passwordResetExp ||
      Date.now() > user.passwordResetExp
    ) {
      return NextResponse.json(
        { error: "Invalid or expired password reset token" },
        { status: 400 }
      );
    }

    // 1. Hash new password
    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    user.passwordResetToken = undefined;
    user.passwordResetExp = undefined;
    db.users.save(user);

    // 2. CRITICAL: Revoke all existing sessions across all devices
    revokeAllUserSessions(user.id);

    logSecurityEvent({
      eventType: "AUTH_PASSWORD_RESET_SUCCESS",
      actor: { userId: user.id, email: user.email, ip },
      outcome: "SUCCESS",
      metadata: { action: "password_reset_and_sessions_revoked" },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful. All active sessions have been signed out.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Password reset failed", details: errorMsg }, { status: 500 });
  }
}
