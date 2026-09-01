"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuthStore } from "@/lib/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");

    const result = await login(email, password);
    if (result.success) {
      router.push("/account");
    } else {
      setError(result.error || "Invalid email or password.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-16 bg-[#FAF8F5]">
      <div className="w-full max-w-md bg-white border border-[#E4DFD5] p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-[#12110E] pt-2">
            Member Sign In
          </h1>
          <p className="text-xs text-[#6B665F]">
            Sign in to access VIP drops, saved wishlist, and track orders.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#12110E]">
                Password
              </label>
              <span className="text-[11px] text-[#E85D2C] hover:underline font-semibold cursor-pointer">
                Forgot?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <span>{isLoading ? "Authenticating..." : "Sign In to Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E4DFD5] text-center text-xs text-[#6B665F]">
          <span>New to Cally Wear? </span>
          <Link href="/account/register" className="font-bold text-[#E85D2C] hover:underline">
            Create an Account
          </Link>
        </div>

        <div className="text-center text-xs text-[#8C877E]">
          <Link href="/track-order" className="hover:text-black underline">
            Track an order as a guest without signing in →
          </Link>
        </div>
      </div>
    </div>
  );
}
