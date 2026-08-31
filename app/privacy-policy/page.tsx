import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Cally Wear Privacy Policy and customer data protection guidelines.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-8 border-b border-[#E4DFD5]">
          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
            LEGAL & PRIVACY
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#12110E]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6B665F] mt-1">Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>

        <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-[#4A4742] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              1. Information We Collect
            </h2>
            <p>
              When you purchase footwear from Cally Wear or create a customer profile, we collect details necessary to process your delivery, including your name, email address, shipping coordinates, telephone number, and payment preference.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              2. How Your Information is Used
            </h2>
            <p>
              Your information is strictly utilized to fulfill footwear orders, send live SMS/email tracking updates, administer 7-day doorstep size exchanges, and provide VIP drop alert notifications if subscribed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              3. Security & Payments
            </h2>
            <p>
              All online payment transactions are processed over encrypted 256-bit SSL connections through certified PCI-DSS compliant payment gateways. Cally Wear does not store unencrypted card numbers on its servers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
