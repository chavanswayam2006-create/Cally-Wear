"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alex.streets@gmail.com");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/account");
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-16 bg-[#FAF8F5]">
      <div className="w-full max-w-md bg-white border border-[#E4DFD5] p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          {/* // TODO: swap for real logo from @cally_wear */}
          <Logo size="lg" />
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-[#12110E] pt-2">
            Member Sign In
          </h1>
          <p className="text-xs text-[#6B665F]">
            Sign in to access VIP drops, saved wishlist, and track orders.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
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
              <a href="#" className="text-[11px] text-[#E85D2C] hover:underline font-semibold">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <span>{loading ? "Signing In..." : "Sign In to Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E4DFD5] text-center text-xs text-[#6B665F]">
          <span>New to Cally Wear? </span>
          <Link href="/account/register" className="font-bold text-[#E85D2C] hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
