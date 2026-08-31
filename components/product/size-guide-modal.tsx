"use client";

import React from "react";
import { X, Ruler, CheckCircle } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sizeTable = [
  { uk: "UK 4", usMen: "US 4.5", usWomen: "US 6.0", eu: "EU 37", cm: "23.0 cm" },
  { uk: "UK 5", usMen: "US 5.5", usWomen: "US 7.0", eu: "EU 38", cm: "24.0 cm" },
  { uk: "UK 6", usMen: "US 6.5", usWomen: "US 8.0", eu: "EU 39", cm: "24.5 cm" },
  { uk: "UK 7", usMen: "US 7.5", usWomen: "US 9.0", eu: "EU 40.5", cm: "25.5 cm" },
  { uk: "UK 8", usMen: "US 8.5", usWomen: "US 10.0", eu: "EU 42", cm: "26.5 cm" },
  { uk: "UK 9", usMen: "US 9.5", usWomen: "US 11.0", eu: "EU 43.5", cm: "27.5 cm" },
  { uk: "UK 10", usMen: "US 10.5", usWomen: "US 12.0", eu: "EU 45", cm: "28.5 cm" },
  { uk: "UK 11", usMen: "US 11.5", usWomen: "US 13.0", eu: "EU 46", cm: "29.5 cm" },
  { uk: "UK 12", usMen: "US 12.5", usWomen: "US 14.0", eu: "EU 47.5", cm: "30.5 cm" },
];

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] text-[#12110E] shadow-2xl border border-[#282622] z-10 max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#E4DFD5] bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-[#E85D2C]" />
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#12110E]">
              Footwear Size Conversion Chart
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close size guide"
            className="p-1.5 text-[#12110E] hover:text-[#E85D2C] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Fit Tip Banner */}
          <div className="p-4 bg-[#12110E] text-white border-l-4 border-[#E85D2C] flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#E85D2C] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-display uppercase tracking-wider text-sm block text-white mb-0.5">
                Cally Wear Fit Guarantee
              </strong>
              <p className="text-[#FAF8F5]/80 leading-relaxed">
                All our sneaker silhouettes follow standard Indian / UK sizing. If you possess wide feet or are between two sizes, we recommend ordering half a size or one size up. We offer <strong>free doorstep size exchange</strong> within 7 days.
              </p>
            </div>
          </div>

          {/* Size Conversion Table */}
          <div className="border border-[#E4DFD5] overflow-x-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12110E] text-white font-display font-black uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3 border-r border-[#282622]">UK (India)</th>
                  <th className="p-3 border-r border-[#282622]">US Men</th>
                  <th className="p-3 border-r border-[#282622]">US Women</th>
                  <th className="p-3 border-r border-[#282622]">EU</th>
                  <th className="p-3">Foot (CM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DFD5] font-mono text-xs">
                {sizeTable.map((row, idx) => (
                  <tr
                    key={row.uk}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF8F5]"}
                  >
                    <td className="p-3 font-bold text-[#E85D2C] border-r border-[#E4DFD5]">
                      {row.uk}
                    </td>
                    <td className="p-3 border-r border-[#E4DFD5]">{row.usMen}</td>
                    <td className="p-3 border-r border-[#E4DFD5]">{row.usWomen}</td>
                    <td className="p-3 border-r border-[#E4DFD5]">{row.eu}</td>
                    <td className="p-3 font-bold text-[#12110E]">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure Foot Length */}
          <div className="p-4 bg-white border border-[#E4DFD5] space-y-2">
            <h4 className="font-display font-black text-sm uppercase text-[#12110E]">
              How to Measure Your Foot Length at Home
            </h4>
            <ol className="text-xs text-[#6B665F] space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Place a blank sheet of paper on the floor against a flat wall.</li>
              <li>Stand on the paper with your heel firmly touching the wall behind you.</li>
              <li>Mark the tip of your longest toe onto the paper using a pen or pencil.</li>
              <li>Measure the distance from the wall edge to your pencil mark in centimeters.</li>
              <li>Find your matching centimeters measurement in the conversion table above.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
