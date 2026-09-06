import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/security/session";
import { db as secDb } from "@/lib/security/database";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    const secUser = secDb.users.findById(session.userId);
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        name: secUser?.name || session.email,
        role: session.role,
      },
    });
  }

  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}

