import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FAF8F5]">
      <div className="flex flex-col items-center space-y-4">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-[#E4DFD5] border-t-[#E85D2C] rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <span className="font-display font-black text-sm uppercase tracking-wider text-[#12110E] block">
            CALLY WEAR
          </span>
          <span className="text-[10px] text-[#8C877E] uppercase font-mono tracking-widest">
            Loading Drop Catalog...
          </span>
        </div>
      </div>
    </div>
  );
}
