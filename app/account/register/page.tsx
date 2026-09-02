"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuthStore } from "@/lib/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister, isLoading } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");

    const result = await authRegister(name, email, password, phone);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/account/login");
      }, 2000);
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-16 bg-[#FAF8F5]">
      <div className="w-full max-w-md bg-white border border-[#E4DFD5] p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-[#12110E] pt-2">
            Create Cally Account
          </h1>
          <p className="text-xs text-[#6B665F]">
            Join the inner circle for priority drop alerts and exclusive releases.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <strong className="block font-display font-black uppercase text-sm">Account Created!</strong>
            <p className="text-[#6B665F]">Redirecting to member sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                Email Address *
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
              <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#12110E] block mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E4DFD5] text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#E4DFD5] text-center text-xs text-[#6B665F]">
          <span>Already have an account? </span>
          <Link href="/account/login" className="font-bold text-[#12110E] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
