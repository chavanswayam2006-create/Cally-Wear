import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, grantStepUp, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { db } from "@/lib/security/database";
import { verifyPassword } from "@/lib/security/password";
import { logSecurityEvent } from "@/lib/security/audit-logger";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = db.users.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Password is required for step-up authentication" }, { status: 400 });
    }

    const isValid = verifyPassword(parsed.data.password, user.passwordHash, user.salt);
    if (!isValid) {
      logSecurityEvent({
        eventType: "AUTH_STEP_UP_CHALLENGE",
        actor: { userId: user.id, email: user.email, role: user.role },
        outcome: "FAILURE",
        riskScore: 50,
        metadata: { reason: "incorrect_step_up_password" },
      });
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }

    grantStepUp(session.sessionId, 10);

    logSecurityEvent({
      eventType: "AUTH_STEP_UP_SUCCESS",
      actor: { userId: user.id, email: user.email, role: user.role },
      outcome: "SUCCESS",
      metadata: { durationMinutes: 10 },
    });

    return NextResponse.json({
      success: true,
      message: "Step-up authentication verified for 10 minutes",
      stepUpUntil: session.stepUpUntil,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: "Step-up failed", details: errorMsg }, { status: 500 });
  }
}
