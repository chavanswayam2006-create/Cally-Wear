"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const announcements = [
  {
    text: "FREE EXPRESS DELIVERY ACROSS INDIA ON ALL ORDERS OVER ₹1,999",
    link: "/shop",
    highlight: "FREE EXPRESS DELIVERY",
  },
  {
    text: "DROP 04 IS LIVE: APEX TECH RUNNER & MONOCHROME VAULT",
    link: "/collections/monochrome-vault",
    highlight: "DROP 04 IS LIVE",
  },

  {
    text: "HASSLE-FREE 7-DAY DOORSTEP EXCHANGES & EASY RETURNS",
    link: "/shipping-returns",
    highlight: "7-DAY DOORSTEP EXCHANGES",
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const current = announcements[currentIndex];

  return (
    <div className="relative bg-[#12110E] text-[#FAF8F5] border-b border-[#282622] text-xs py-2 px-4 select-none z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={handlePrev}
          aria-label="Previous announcement"
          className="text-[#99948D] hover:text-white transition-colors p-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 text-center overflow-hidden px-4">
          <Link
            href={current.link}
            className="inline-flex items-center gap-2 tracking-wider font-semibold text-[11px] md:text-xs uppercase hover:underline group"
          >
            <Sparkles className="w-3 h-3 text-[#E85D2C] shrink-0" />
            <span className="truncate">{current.text}</span>
          </Link>
        </div>

        <button
          onClick={handleNext}
          aria-label="Next announcement"
          className="text-[#99948D] hover:text-white transition-colors p-1"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
