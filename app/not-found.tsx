import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
      <div className="w-20 h-20 bg-[#12110E] text-[#E85D2C] flex items-center justify-center mb-6">
        <Compass className="w-10 h-10" />
      </div>

      <span className="text-xs font-black uppercase tracking-widest text-[#E85D2C] block mb-1">
        ERROR 404 // DEAD DROP
      </span>

      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-[#12110E]">
        Out of Bounds
      </h1>

      <p className="text-xs sm:text-sm text-[#6B665F] mt-2 max-w-sm leading-relaxed">
        The page or sneaker release you are looking for has either retired to the archive or never existed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#12110E] hover:bg-[#E85D2C] text-white font-display font-black text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E4DFD5] hover:border-black text-[#12110E] font-display font-black text-xs uppercase tracking-wider transition-colors"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
