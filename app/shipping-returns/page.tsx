import React from "react";
import { Metadata } from "next";
import { Truck, RefreshCw, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & 7-Day Doorstep Returns",
  description:
    "Learn about our express delivery across India, 7-day doorstep size replacement policy, and tracking details.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="pb-8 border-b border-[#E4DFD5]">
          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
            DELIVERY & EXCHANGE POLICY
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#12110E]">
            Shipping & Doorstep Returns
          </h1>
          <p className="text-xs sm:text-sm text-[#6B665F] max-w-xl mt-2 leading-relaxed">
            Fast, insured courier dispatch across India and effortless 7-day size replacements.
          </p>
        </div>

        <div className="space-y-10">
          {/* Shipping Policy */}
          <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#E85D2C]" />
              <h2 className="font-display font-black text-xl uppercase text-[#12110E]">
                Express Courier Shipping
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-[#4A4742] space-y-3 leading-relaxed">
              <p>
                • <strong>Free Shipping Threshold:</strong> All orders with a subtotal of <strong>₹1,999 or greater</strong> automatically receive free express shipping across all states in India. Orders below this threshold incur a flat ₹199 standard delivery fee.
              </p>
              <p>
                • <strong>Dispatch Schedule:</strong> Orders confirmed before 3:00 PM IST are inspected and dispatched from our Mumbai hub on the same business day.
              </p>
              <p>
                • <strong>Transit Timelines:</strong> Metro cities (Mumbai, Delhi NCR, Bangalore, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days. Non-metro regions arrive within 3–5 business days.
              </p>
            </div>
          </div>

          {/* 7-Day Returns */}
          <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#E85D2C]" />
              <h2 className="font-display font-black text-xl uppercase text-[#12110E]">
                7-Day Doorstep Size Replacement & Returns
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-[#4A4742] space-y-3 leading-relaxed">
              <p>
                We want you to feel complete confidence in your rotation. If your new pair does not fit properly or you wish to exchange it for another size:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>Notify us via WhatsApp or Email within 7 calendar days of delivery.</li>
                <li>Ensure the sneakers are in unworn, brand-new condition with original tags and collector shoe box intact.</li>
                <li>Our courier partner will arrange a doorstep pickup from your address and dispatch your replacement size immediately.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
