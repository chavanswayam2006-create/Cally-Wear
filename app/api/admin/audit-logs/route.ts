import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { authorizeRequest } from "@/lib/security/rbac";
import { getAuditLogs, AuditEventType } from "@/lib/security/audit-logger";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  const auth = authorizeRequest(session, "audit:read");
  if (!auth.allowed) {
    if (auth.reason === "unauthenticated") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Access denied: insufficient permissions" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const eventType = searchParams.get("eventType") as AuditEventType | null;
  const actorUserId = searchParams.get("actorUserId") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const logs = getAuditLogs({
    eventType: eventType || undefined,
    actorUserId,
    limit,
  });

  return NextResponse.json({ logs });
}
