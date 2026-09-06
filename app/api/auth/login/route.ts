import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginUser, signSessionToken } from "@/lib/auth";
import { db as secDb } from "@/lib/security/database";
import { verifyPassword } from "@/lib/security/password";
import { createSession, serializeSessionCookie, SESSION_COOKIE_NAME } from "@/lib/security/session";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;
    const isProd = process.env.NODE_ENV === "production";

    // Check security database first for security test suite users
    const secUser = secDb.users.findByEmail(email);
    if (secUser) {
      const isValid = verifyPassword(password, secUser.passwordHash, secUser.salt);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const session = createSession({
        userId: secUser.id,
        role: secUser.role,
        email: secUser.email,
        ip,
        userAgent,
      });

      const role = (secUser.role === "super_admin" || secUser.role === "order_manager" || secUser.role === "catalog_manager") ? "ADMIN" : "CUSTOMER";
      const token = signSessionToken({
        userId: secUser.id,
        email: secUser.email,
        role,
        fullName: secUser.name,
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: secUser.id,
          name: secUser.name,
          email: secUser.email,
          role: secUser.role,
        },
        message: "Signed in successfully",
      });

      res.headers.set("set-cookie", serializeSessionCookie(session.sessionId));
      const authCookieStr = `cally_auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? "; Secure" : ""}`;
      res.headers.append("set-cookie", authCookieStr);
      return res;
    }

    const { user, token } = await loginUser(email, password);

    const secRole = user.role === "ADMIN" ? "super_admin" : "customer";
    const session = createSession({
      userId: user.id,
      role: secRole,
      email: user.email,
      ip,
      userAgent,
    });

    const res = NextResponse.json({
      success: true,
      user,
      token,
      message: "Signed in successfully",
    });

    res.headers.set("set-cookie", serializeSessionCookie(session.sessionId));
    const authCookieStr = `cally_auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? "; Secure" : ""}`;
    res.headers.append("set-cookie", authCookieStr);
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Invalid email or password" },
      { status: 401 }
    );
  }
}


