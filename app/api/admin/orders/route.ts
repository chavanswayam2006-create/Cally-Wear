import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { authorizeRequest } from "@/lib/security/rbac";
import { db } from "@/lib/security/database";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  // FUNCTION-LEVEL AUTHORIZATION CHECK
  const auth = authorizeRequest(session, "orders:read:all");
  if (!auth.allowed) {
    if (auth.reason === "unauthenticated") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Access denied: insufficient permissions" }, { status: 403 });
  }

  const allOrders = db.orders.getAll();
  return NextResponse.json({ orders: allOrders });
}
