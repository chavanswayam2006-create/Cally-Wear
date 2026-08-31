import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Cally Wear customer terms and conditions of purchase.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-8 border-b border-[#E4DFD5]">
          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
            LEGAL & AGREEMENTS
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#12110E]">
            Terms of Service
          </h1>
          <p className="text-xs text-[#6B665F] mt-1">Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>

        <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-[#4A4742] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              1. Overview & Acceptance
            </h2>
            <p>
              By accessing the Cally Wear platform or purchasing any footwear silhouette, you agree to adhere to these Terms of Service. These terms apply to all visitors, registered accounts, and purchasers across India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              2. Product Descriptions & Limited Drops
            </h2>
            <p>
              We make every effort to display footwear colors, materials, and textures accurately. Certain releases are produced in limited production batches and are subject to immediate stock availability.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              3. Pricing & Taxes
            </h2>
            <p>
              All prices listed on Cally Wear are in Indian Rupees (INR ₹) and are inclusive of applicable GST taxes. Delivery fees, if applicable, are clearly calculated before final payment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
