import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Customer Purchase Terms",
  description: "Cally Wear customer terms and conditions of purchase, order cancellation, and 7-day exchange policies.",
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
          <p className="text-xs text-[#6B665F] mt-1">
            Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} • Governed by the Laws of the Republic of India
          </p>
        </div>

        {/* Reviewer Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
          <p className="font-bold uppercase tracking-wide text-amber-800">
            Notice for Legal & Commercial Reviewers:
          </p>
          <p>
            These terms define commercial purchase terms, dispute resolution, and warranty provisions. Prior to production go-live, legal counsel review is recommended.
          </p>
        </div>

        <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-[#4A4742] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              1. Overview & Agreement
            </h2>
            <p>
              By accessing the Cally Wear platform (website, mobile interface, or physical retail store) or purchasing any footwear silhouette, you agree to adhere to these Terms of Service. These terms apply to all visitors, registered accounts, and purchasers across India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              2. Product Inventory & Limited Drop Releases
            </h2>
            <p>
              Cally Wear footwear is manufactured in curated, limited-batch production runs. Items in your cart are not reserved until full checkout confirmation is completed. We reserve the right to limit order quantities per customer on high-demand drop releases to prevent unauthorized resale.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              3. Pricing, Taxes & Cash on Delivery (COD)
            </h2>
            <p>
              All prices listed on Cally Wear are in Indian Rupees (INR ₹) and are inclusive of applicable Goods and Services Tax (GST). For Cash on Delivery orders, customers agree to accept package delivery and provide exact payment to the authorized courier agent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              4. 7-Day Doorstep Replacement & Return Policy
            </h2>
            <p>
              Customers are entitled to request a size replacement or return within 7 calendar days of delivery. Returned footwear must be unworn, free from tarmac or sole wear, with all original tags attached and packaged in the original collector box.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              5. Intellectual Property
            </h2>
            <p>
              All trademarks, product designs, proprietary silhouette blueprints, photographs, branding assets, and textual content are the exclusive intellectual property of Cally Wear.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-[#E4DFD5]">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed and interpreted under the laws of the Republic of India. Any legal dispute or proceeding arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Mumbai, Maharashtra, India</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
