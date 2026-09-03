"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role !== "ADMIN" && data.user.role !== "STAFF") {
        throw new Error("Access denied. Admin credentials required.");
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12110E] text-white flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-[#181714] border border-[#282622] p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#282622] text-[#E85D2C] text-xs font-mono font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-white">
            Staff Portal Sign-In
          </h1>
          <p className="text-xs text-[#99948D]">
            Enter your authorized administrative credentials to manage store operations.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6B665F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 bg-[#12110E] border border-[#282622] text-white text-xs font-medium focus:outline-none focus:border-[#E85D2C] placeholder:text-[#6B665F]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#C5C0B8]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B665F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 bg-[#12110E] border border-[#282622] text-white text-xs font-medium focus:outline-none focus:border-[#E85D2C] placeholder:text-[#6B665F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Enter Admin Dashboard"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
