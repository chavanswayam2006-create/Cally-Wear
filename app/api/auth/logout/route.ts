import { NextRequest, NextResponse } from "next/server";
import { getSession, revokeSession, serializeLogoutCookie, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { logSecurityEvent } from "@/lib/security/audit-logger";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  if (session) {
    revokeSession(sessionId);
    logSecurityEvent({
      eventType: "AUTH_LOGOUT",
      actor: { userId: session.userId, email: session.email, role: session.role },
      outcome: "SUCCESS",
      metadata: { sessionId },
    });
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.headers.set("Set-Cookie", serializeLogoutCookie());
  return response;
}
