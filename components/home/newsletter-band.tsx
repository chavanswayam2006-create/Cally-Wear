"use client";

import React, { useState } from "react";
import { Mail, Check, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address");
      return;
    }

    setError("");
    setIsSubscribed(true);
  };

  return (
    <section className="bg-[#12110E] text-white py-16 md:py-20 border-b border-[#282622] relative overflow-hidden">
      {/* Background Graphic Watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 font-display font-black text-[120px] md:text-[180px] text-[#181714] select-none pointer-events-none uppercase tracking-tighter opacity-40 leading-none">
        CALLY
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1C1A17] border border-[#282622] text-xs font-black uppercase tracking-widest text-[#E85D2C]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JOIN THE INNER CIRCLE</span>
        </div>

        <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-none">
          Get VIP Drop Alerts & 10% Off
        </h2>

        <p className="text-xs sm:text-sm text-[#99948D] max-w-xl mx-auto leading-relaxed">
          Be first to access limited production runs, private archive sales, and exclusive footwear colorways before public release.
        </p>

        {isSubscribed ? (
          <div className="p-6 bg-[#181714] border border-[#E85D2C] max-w-md mx-auto space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-10 h-10 bg-[#E85D2C] text-white flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
              You&apos;re On The VIP List
            </h3>
            <p className="text-xs text-[#C5C0B8]">
              Check your inbox for your 10% discount code <strong>CALLY10</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full pl-10 pr-4 py-3.5 bg-[#181714] border border-[#282622] text-white text-xs font-medium focus:outline-none focus:border-[#E85D2C] placeholder:text-[#6B665F]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg"
              >
                <span>Unlock VIP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 font-semibold">{error}</p>
            )}
            <div className="flex items-center justify-center gap-2 text-[10px] text-[#6B665F]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C877E]" />
              <span>Zero spam. One-click unsubscribe at any time.</span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
