import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Zap, Sparkles, MapPin, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us & Craftsmanship",
  description:
    "Learn about the origins of Cally Wear. Designed in Mumbai for relentless street rotation and runway-grade aesthetics.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Banner */}
      <div className="relative w-full h-[50vh] min-h-[380px] bg-[#12110E] text-white flex flex-col justify-end p-6 md:p-12 border-b border-[#282622]">
        <Image
          src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1800&q=80"
          alt="Cally Wear Story"
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12110E] via-[#12110E]/60 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto w-full space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C]">
            OUR ORIGINS & ETHOS
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
            Engineered For The Asphalt
          </h1>
          <p className="text-xs sm:text-sm text-[#D4CFC7] max-w-xl leading-relaxed">
            Born out of Mumbai&apos;s relentless sneaker and streetwear culture. Bridging high-performance tactical architecture with runway-grade silhouettes.
          </p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        {/* Paragraphs */}
        <div className="space-y-6 text-sm text-[#4A4742] leading-relaxed">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#12110E]">
            The Cally Wear Manifesto
          </h2>
          <p>
            Cally Wear was founded with an uncompromising mission: to craft premium footwear that withstands the grit and abrasive energy of daily street rotation while retaining the sharp editorial aesthetic of boutique streetwear culture.
          </p>
          <p>
            Too often, contemporary sneakers make you choose between fragile hype silhouettes that fall apart after a month on concrete, or clunky utility shoes stripped of any design soul. We rejected that compromise.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 bg-white border border-[#E4DFD5] space-y-3">
            <Zap className="w-6 h-6 text-[#E85D2C]" />
            <h3 className="font-display font-black text-base uppercase text-[#12110E]">
              Nitrogen Superfoams
            </h3>
            <p className="text-xs text-[#6B665F] leading-relaxed">
              Proprietary nitrogen-injected EVA and Pebax midsoles tuned for 72% energy return on hard concrete.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E4DFD5] space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#E85D2C]" />
            <h3 className="font-display font-black text-base uppercase text-[#12110E]">
              Ballistic Materials
            </h3>
            <p className="text-xs text-[#6B665F] leading-relaxed">
              Tumbled full-grain leathers and reinforced Cordura ballistic nylon uppers built for years of rotation.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E4DFD5] space-y-3">
            <MapPin className="w-6 h-6 text-[#E85D2C]" />
            <h3 className="font-display font-black text-base uppercase text-[#12110E]">
              Rooted in Mumbai
            </h3>
            <p className="text-xs text-[#6B665F] leading-relaxed">
              Designed and curated from our creative studio and retail space at Liberty Garden, Malad West, Mumbai.
            </p>
          </div>
        </div>

        {/* Store CTA */}
        <div className="p-8 bg-[#12110E] text-white border border-[#282622] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Visit The Cally Wear Space
            </h3>
            <p className="text-xs text-[#99948D]">
              Shop No. 9, Sadguru Darshan, Liberty Garden, Road No. 3, Malad West, Mumbai
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white font-display font-black text-xs uppercase tracking-wider transition-colors shrink-0 text-center"
          >
            Get Directions & Hours
          </Link>
        </div>
      </div>
    </div>
  );
}
