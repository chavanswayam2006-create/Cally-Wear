// Cally Wear Authentication & Authorization Module
// Supports Supabase Auth and secure JWT session fallback with bcrypt
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, Role } from "@/lib/db";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const AUTH_COOKIE_NAME = "cally_auth_token";
const JWT_SECRET = process.env.AUTH_SECRET || "cally_wear_jwt_secret_dev_key_2026_super_secure";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
  role: Role;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  fullName?: string | null;
}

// Generate JWT token
export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

// Extract authenticated user from Request (cookie or Authorization header)
export async function getCurrentUser(req: NextRequest | Request): Promise<AuthUser | null> {
  let token: string | null = null;

  // 1. Try Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Try Cookie
  if (!token && "cookies" in req) {
    const nextReq = req as NextRequest;
    token = nextReq.cookies.get(AUTH_COOKIE_NAME)?.value || null;
  } else if (!token) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
      if (match) token = decodeURIComponent(match[1]);
    }
  }

  if (!token) return null;

  // Supabase Auth verification if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        const profile = await db.profile.findUnique({ where: { id: data.user.id } });
        if (profile) {
          return {
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role,
          };
        }
      }
    } catch {
      // Fallback to local JWT verification
    }
  }

  // Local JWT verification
  const payload = verifySessionToken(token);
  if (!payload) return null;

  const profile = await db.profile.findUnique({ where: { id: payload.userId } });
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
  };
}

// Customer signup
export async function signUpCustomer(params: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}): Promise<{ user: AuthUser; token: string }> {
  const email = params.email.toLowerCase().trim();

  // Check if user exists
  const existing = await db.profile.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  let userId = `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // If Supabase is active, create user in Supabase Auth
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: params.password,
      user_metadata: { fullName: params.fullName, phone: params.phone },
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    if (data.user) userId = data.user.id;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(params.password, salt);

  const newProfile = await db.profile.create({
    data: {
      id: userId,
      email,
      fullName: params.fullName || null,
      phone: params.phone || null,
      role: "CUSTOMER", // Customers ALWAYS get role CUSTOMER
      passwordHash,
    },
  });

  const authUser: AuthUser = {
    id: newProfile.id,
    email: newProfile.email,
    fullName: newProfile.fullName,
    role: newProfile.role,
  };

  const token = signSessionToken({
    userId: authUser.id,
    email: authUser.email,
    role: authUser.role,
    fullName: authUser.fullName,
  });

  return { user: authUser, token };
}

// User login (handles Customer and Admin)
export async function loginUser(
  emailInput: string,
  passwordInput: string
): Promise<{ user: AuthUser; token: string }> {
  const email = emailInput.toLowerCase().trim();
  const profile = await db.profile.findUnique({ where: { email } });

  if (!profile) {
    throw new Error("Invalid email or password");
  }

  // Supabase Auth verification if active
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });
      if (error) throw new Error(error.message);
      if (data.session) {
        return {
          user: {
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role,
          },
          token: data.session.access_token,
        };
      }
    } catch (err: any) {
      // If error came from Supabase, throw or check fallback
      if (err.message && !err.message.includes("fetch")) {
        throw err;
      }
    }
  }

  // Check password hash
  if (!profile.passwordHash) {
    throw new Error("Authentication failed. Please reset your password.");
  }

  const isMatch = bcrypt.compareSync(passwordInput, profile.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const authUser: AuthUser = {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
  };

  const token = signSessionToken({
    userId: authUser.id,
    email: authUser.email,
    role: authUser.role,
    fullName: authUser.fullName,
  });

  return { user: authUser, token };
}

// Guard: Require Admin or Staff
export async function requireAdmin(req: NextRequest | Request): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized. Please sign in as an admin." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    throw new Response(
      JSON.stringify({ error: "Forbidden. Admin privileges required." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return user;
}

// Guard: Require Customer
export async function requireCustomer(req: NextRequest | Request): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized. Please sign in." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return user;
}

// Set auth cookie on Response
export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Clear auth cookie on Response
export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
