import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { db } from "@/lib/security/database";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get("x-session-id") || "";
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = db.users.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Response Minimization: Do not return password hash, salt, tokens
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVip: true,
      isEmailVerified: user.isEmailVerified,
      addresses: user.addresses,
      createdAt: user.createdAt,
    },
  });
}
