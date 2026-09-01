"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, PhoneCall, Sparkles } from "lucide-react";

const faqCategories = [
  {
    category: "Sizing & Fit",
    questions: [
      {
        q: "How do Cally Wear sneakers fit compared to standard athletic shoes?",
        a: "All our footwear silhouettes follow true-to-size standard UK / Indian men's and women's sizing. If you possess wider feet or fall between half sizes, we recommend sizing up by half a size. Consult our interactive Size Guide on any product detail page for exact centimeter foot measurements.",
      },
      {
        q: "What if the size I ordered doesn't fit my feet?",
        a: "We provide 100% free doorstep size exchanges within 7 calendar days of delivery. Our courier partner will pick up the existing pair and deliver your replacement size simultaneously.",
      },
    ],
  },
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "What are the shipping charges and delivery timeframes?",
        a: "We offer FREE Express Courier delivery across India on all orders exceeding ₹1,999. Orders below ₹1,999 incur a flat ₹199 delivery charge. Orders are packaged and dispatched within 24 hours from our Mumbai fulfillment hub. Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) are delivered within 2–3 business days. Rest of India arrives within 3–5 business days.",
      },
      {
        q: "Is Cash on Delivery (COD) available?",
        a: "Yes! Cash on Delivery is supported across 18,000+ pin codes in India. You may pay in cash or via QR/UPI directly to the courier agent upon delivery.",
      },
      {
        q: "How do I track my dispatched order?",
        a: "As soon as your pair leaves our fulfillment warehouse, you receive an automated SMS and email containing your live tracking reference code (e.g. EXP-IN-XXXXXXXX). You can also view your live status anytime in your Account dashboard.",
      },
    ],
  },
  {
    category: "Product & Authenticity",
    questions: [
      {
        q: "Are Cally Wear materials 100% genuine and verified?",
        a: "Yes. Every single shoe upper, nitrogen-injected midsole, and ballistic mesh is crafted under rigorous quality control standards and tested against abrasive tarmac stress. Zero imitation foams.",
      },
      {
        q: "How should I clean and maintain my Cally Wear sneakers?",
        a: "Wipe clean with a soft microfiber cloth lightly dampened with lukewarm water and mild soap. Avoid soaking leather models in washing machines or exposing them to high artificial heating.",
      },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "0-0": true,
    "1-0": true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="pb-8 border-b border-[#E4DFD5]">
          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
            HELP & KNOWLEDGE BASE
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#12110E]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#6B665F] max-w-xl mt-2 leading-relaxed">
            Everything you need to know regarding sizing, drops, express shipping, and 7-day doorstep size exchanges.
          </p>
        </div>

        {/* FAQ Accordions by Category */}
        <div className="space-y-10">
          {faqCategories.map((cat, catIdx) => (
            <div key={cat.category} className="space-y-4">
              <h2 className="font-display font-black text-lg uppercase tracking-wider text-[#12110E] pb-2 border-b border-[#E4DFD5]">
                {cat.category}
              </h2>

              <div className="bg-white border border-[#E4DFD5] divide-y divide-[#E4DFD5]">
                {cat.questions.map((item, qIdx) => {
                  const key = `${catIdx}-${qIdx}`;
                  const isOpen = openItems[key];

                  return (
                    <div key={item.q} className="p-4 sm:p-5">
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between text-left gap-4 group"
                      >
                        <span className="font-display font-black text-sm uppercase text-[#12110E] group-hover:text-[#E85D2C] transition-colors">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#8C877E] shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-[#E85D2C]" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="text-xs sm:text-sm text-[#6B665F] leading-relaxed pt-3 animate-in fade-in duration-200">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions? */}
        <div className="p-8 bg-[#12110E] text-white border border-[#282622] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Still Need Sizing or Drop Advice?
            </h3>
            <p className="text-xs text-[#99948D]">
              Our VIP WhatsApp concierge desk is available 7 days a week.
            </p>
          </div>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#25D366] text-black font-black text-xs uppercase tracking-wider transition-opacity hover:opacity-90 shrink-0 flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
