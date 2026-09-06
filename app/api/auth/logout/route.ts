import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { revokeSession, SESSION_COOKIE_NAME } from "@/lib/security/session";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    revokeSession(sessionId);
  }

  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  clearAuthCookie(res);
  return res;
}

