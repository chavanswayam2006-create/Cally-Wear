import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME, revokeAllUserSessions } from "@/lib/security/session";
import { db } from "@/lib/security/database";
import { logSecurityEvent } from "@/lib/security/audit-logger";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = db.users.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userOrders = db.orders.findByCustomerId(user.id);

  logSecurityEvent({
    eventType: "USER_DATA_EXPORT",
    actor: { userId: user.id, email: user.email, role: user.role },
    outcome: "SUCCESS",
    metadata: { action: "dpdp_data_portability_export" },
  });

  return NextResponse.json({
    dataInventoryNotice: "Cally Wear DPDP Act 2023 & GDPR Data Portability Export",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: new Date(user.createdAt).toISOString(),
      addresses: user.addresses,
    },
    orders: userOrders,
  });
}

export async function DELETE(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = db.users.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Anonymize user profile (Right to be Forgotten)
  user.name = "Anonymized Customer";
  user.phone = "+91 00000 00000";
  user.addresses = [];
  user.passwordHash = "ANONYMIZED";
  user.salt = "ANONYMIZED";
  db.users.save(user);

  // Revoke all sessions immediately
  revokeAllUserSessions(user.id);

  logSecurityEvent({
    eventType: "USER_DATA_ANONYMIZED",
    actor: { userId: user.id, email: user.email, role: user.role },
    outcome: "SUCCESS",
    metadata: { action: "dpdp_right_to_be_forgotten" },
  });

  return NextResponse.json({
    success: true,
    message: "Your personal data has been securely anonymized and all active sessions revoked per DPDP Act guidelines.",
  });
}
