import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginUser, setAuthCookie } from "@/lib/auth";

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

    const { user, token } = await loginUser(parsed.data.email, parsed.data.password);

    const res = NextResponse.json({
      success: true,
      user,
      token,
      message: "Signed in successfully",
    });

    setAuthCookie(res, token);
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Invalid email or password" },
      { status: 401 }
    );
  }
}
