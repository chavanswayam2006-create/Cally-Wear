"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { PhoneCall, MapPin, Mail, ShieldCheck, Truck, RefreshCw, Sparkles } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="bg-[#12110E] text-[#FAF8F5] border-t border-[#282622] pt-16 pb-12">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#282622]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3 p-4 bg-[#181714] border border-[#282622]">
            <Truck className="w-6 h-6 text-[#E85D2C] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-black text-sm uppercase tracking-tight text-white">
                Express Delivery
              </h4>
              <p className="text-xs text-[#99948D] mt-1">
                Free dispatch across India on all orders over ₹1,999.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#181714] border border-[#282622]">
            <ShieldCheck className="w-6 h-6 text-[#E85D2C] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-black text-sm uppercase tracking-tight text-white">
                100% Authentic Kicks
              </h4>
              <p className="text-xs text-[#99948D] mt-1">
                Verified materials, precision craftsmanship, zero fakes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#181714] border border-[#282622]">
            <RefreshCw className="w-6 h-6 text-[#E85D2C] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-black text-sm uppercase tracking-tight text-white">
                7-Day Easy Returns
              </h4>
              <p className="text-xs text-[#99948D] mt-1">
                Doorstep size exchange and transparent return policy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#181714] border border-[#282622]">
            <PhoneCall className="w-6 h-6 text-[#E85D2C] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-black text-sm uppercase tracking-tight text-white">
                VIP WhatsApp Desk
              </h4>
              <p className="text-xs text-[#99948D] mt-1">
                Direct sizing assistance & order updates via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            {/* // TODO: swap for real logo from @cally_wear */}
            <Logo size="lg" />
            <p className="text-xs text-[#99948D] leading-relaxed max-w-sm">
              Cally Wear is a direct-to-consumer footwear label engineered for relentless street rotation. High-octane aesthetics, responsive cushions, and raw streetwear silhouettes.
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#C5C0B8]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E85D2C] shrink-0 mt-0.5" />
                <span>Shop No. 9, Sadguru Darshan, Liberty Garden, Road No. 3, Malad West, Mumbai 400064</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E85D2C] shrink-0" />
                <a href="mailto:support@callywear.com" className="hover:text-white transition-colors">
                  support@callywear.com
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/cally_wear"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1A17] border border-[#282622] text-xs font-bold uppercase tracking-wider text-white hover:border-[#E85D2C] hover:text-[#E85D2C] transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>@cally_wear</span>
              </a>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-display font-black text-sm uppercase tracking-wider text-white">
              Shop
            </h4>
            <ul className="space-y-2 text-xs text-[#99948D]">
              <li>
                <Link href="/shop/men" className="hover:text-white transition-colors">
                  Men&apos;s Footwear
                </Link>
              </li>
              <li>
                <Link href="/shop/women" className="hover:text-white transition-colors">
                  Women&apos;s Footwear
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=newest" className="hover:text-white transition-colors">
                  New Releases
                </Link>
              </li>
              <li>
                <Link href="/collections/monochrome-vault" className="hover:text-white transition-colors">
                  Monochrome Vault
                </Link>
              </li>
              <li>
                <Link href="/collections/street-classics" className="hover:text-white transition-colors">
                  Street Classics
                </Link>
              </li>
              <li>
                <Link href="/shop?sale=true" className="hover:text-[#E85D2C] transition-colors font-bold">
                  Archive Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Help */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-display font-black text-sm uppercase tracking-wider text-white">
              Customer Desk
            </h4>
            <ul className="space-y-2 text-xs text-[#99948D]">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Store Visit & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Brand */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-display font-black text-sm uppercase tracking-wider text-white">
              Brand & Story
            </h4>
            <ul className="space-y-2 text-xs text-[#99948D]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story & Origins
                </Link>
              </li>
              <li>
                <Link href="/collections/performance-lab" className="hover:text-white transition-colors">
                  Materials & Tech Lab
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & WhatsApp */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-display font-black text-sm uppercase tracking-wider text-white">
              Drop Alerts
            </h4>
            <p className="text-xs text-[#99948D]">
              Never miss limited batch drops and private archive sales.
            </p>
            <Link
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-[#25D366] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Join WhatsApp VIP</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#282622] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#736F68]">
        <div>
          © {new Date().getFullYear()} Cally Wear Footwear Co. All rights reserved. Designed in Mumbai.
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#99948D]">
            SECURE PAYMENTS: UPI • VISA • MASTERCARD • RUPAY • COD
          </span>
        </div>
      </div>
    </footer>
  );
}
