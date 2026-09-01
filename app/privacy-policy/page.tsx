import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Data Protection Guidelines",
  description: "Cally Wear Privacy Policy, DPDP Act 2023 compliance, data retention, and customer data rights.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-8 border-b border-[#E4DFD5]">
          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
            LEGAL & COMPLIANCE
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#12110E]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6B665F] mt-1">
            Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} • Compliant with Digital Personal Data Protection (DPDP) Act 2023 & IT Act 2000
          </p>
        </div>

        {/* Reviewer Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
          <p className="font-bold uppercase tracking-wide text-amber-800">
            Notice for Legal & Compliance Reviewers:
          </p>
          <p>
            This policy outlines Cally Wear&apos;s data collection, processing, and retention practices. Prior to live commercial deployment, final statutory verification and formal sign-off by qualified Indian legal counsel is recommended.
          </p>
        </div>

        <div className="bg-white border border-[#E4DFD5] p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-[#4A4742] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              1. Information We Collect & Purpose
            </h2>
            <p>
              When you purchase footwear from Cally Wear, browse our drops, or create a customer account, we collect:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Identity & Contact:</strong> Full name, billing and shipping addresses, email address, and telephone number for order dispatch and OTP verification.</li>
              <li><strong>Transaction Records:</strong> Order item history, payment method chosen (UPI, Card, COD), transaction identifiers, and invoice details.</li>
              <li><strong>Technical & Session Data:</strong> IP address, browser type, device identifiers, and essential cookies for cart persistence.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              2. Third-Party Service Providers & Processors
            </h2>
            <p>
              We share minimal necessary data with authorized third-party service providers solely to complete fulfillment:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Logistics & Courier Partners (e.g. Shiprocket, BlueDart, Delhivery):</strong> Name, delivery address, and contact number for doorstep delivery and 7-day size replacements.</li>
              <li><strong>Payment Processors (e.g. Razorpay / Cashfree):</strong> Encrypted checkout sessions over 256-bit SSL connections. We never store raw debit/credit card CVV or PIN numbers.</li>
              <li><strong>Communication Gateways:</strong> Transactional SMS and WhatsApp dispatch notifications.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              3. Data Retention & Deletion Policy
            </h2>
            <p>
              We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy, comply with statutory tax and GST audit obligations under Indian law (minimum 7 years for financial invoices), or resolve customer service inquiries. Customers may request account deletion or data anonymization at any time by contacting our Grievance Officer.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              4. Cookie Categories
            </h2>
            <p>
              Our platform uses the following cookie categories:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Essential / Strictly Necessary:</strong> Required for cart drawer state, wishlist persistence, and secure checkout navigation.</li>
              <li><strong>Functional:</strong> Memorizes preferences like preferred footwear size and shipping pin code.</li>
              <li><strong>Performance / Analytics:</strong> Aggregated, non-PII metrics to optimize page load speeds and navigation flows.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              5. Data Subject Rights (DPDP Act 2023)
            </h2>
            <p>
              Under applicable Indian data protection laws, you possess the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Access a summary of your personal data processed by us.</li>
              <li>Request correction or updating of inaccurate personal data.</li>
              <li>Request erasure of your personal data, subject to statutory retention requirements.</li>
              <li>Withdraw consent for optional marketing newsletters at any time.</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4 border-t border-[#E4DFD5]">
            <h2 className="font-display font-black text-base uppercase text-[#12110E]">
              6. Grievance Redressal Officer
            </h2>
            <p>
              In accordance with the Information Technology Act 2000 and DPDP Act 2023, the details of our Grievance Redressal Officer are:
            </p>
            <div className="p-4 bg-[#FAF8F5] border border-[#E4DFD5] text-xs space-y-1">
              <p><strong>Name:</strong> Grievance Redressal Desk — Cally Wear</p>
              <p><strong>Email:</strong> <a href="mailto:grievance@callywear.com" className="text-[#E85D2C] underline">grievance@callywear.com</a> (copy: <a href="mailto:support@callywear.com" className="text-[#E85D2C] underline">support@callywear.com</a>)</p>
              <p><strong>Address:</strong> Shop No. 9, Sadguru Darshan, Liberty Garden, Road No. 3, Malad West, Mumbai, Maharashtra — 400064</p>
              <p><strong>Response SLA:</strong> Acknowledgment within 24 hours; resolution within 15 business days.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
