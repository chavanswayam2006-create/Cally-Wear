import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signUpCustomer, setAuthCookie } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const fullName = parsed.data.fullName || parsed.data.name;
    const { user, token } = await signUpCustomer({
      email: parsed.data.email,
      password: parsed.data.password,
      fullName,
      phone: parsed.data.phone,
    });

    const res = NextResponse.json({
      success: true,
      user,
      message: "Account created successfully",
    });

    setAuthCookie(res, token);
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Registration failed. Please try again." },
      { status: 400 }
    );
  }
}
