"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  FileText,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
} from "lucide-react";

export default function BulkImportPage() {
  const router = useRouter();

  const sampleCsv = `name,sku,basePrice,salePrice,isOnSale,sizes,materials,description,images,sectionSlugs
Monochrome Strike High,CW-SNK-020,8999,7499,true,"UK 7:10, UK 8:15, UK 9:12","Tumbled leather, vulcanized rubber","Tactical high-top silhouette with reinforced ankle collars.","https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80","new-arrivals,men,sale"
Cyber Kinetic Runner,CW-SNK-021,7499,,false,"UK 8:18, UK 9:20, UK 10:14","Ballistic mesh, nitrogen foam","Ultra-lightweight responsive road running sneaker.","https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80","new-arrivals,best-sellers"
Vanguard Field Boot,CW-BOT-022,11499,,false,"UK 7:8, UK 8:12, UK 9:10","Waterproof full grain leather, Vibram lug","Heavy weather exploration boot engineered for concrete trails.","https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80","men"`;

  const [csvText, setCsvText] = useState(sampleCsv);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      setValidationResult(null);
      setError("");
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!csvText.trim()) {
      setError("Please enter or upload CSV data first.");
      return;
    }

    setValidating(true);
    setError("");
    setImportSuccess("");

    try {
      const res = await fetch("/api/admin/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "validate",
          csvText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");

      setValidationResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to validate CSV");
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!validationResult || !validationResult.canCommit) return;

    setCommitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "commit",
          csvText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setImportSuccess(data.message || `Imported ${data.importedCount} products successfully.`);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to commit import to database");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-[#99948D] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-black text-2xl uppercase tracking-tight text-white">
              Bulk Catalog Import
            </h1>
            <p className="text-xs text-[#99948D] mt-0.5">
              Import footwear lines in bulk with CSV validation preview before database commit.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const blob = new Blob([sampleCsv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "cally_wear_sample_catalog.csv";
            a.click();
          }}
          className="px-3.5 py-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-xs font-semibold text-[#FAF8F5] flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5 text-[#E85D2C]" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {importSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{importSuccess} Redirecting to catalog...</span>
        </div>
      )}

      {/* Step 1: Upload or Paste CSV */}
      <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#24221D] pb-3">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#E85D2C]" />
            <span>Step 1: Upload or Paste CSV Data</span>
          </h2>

          <label className="px-3 py-1.5 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-xs font-semibold text-[#FAF8F5] cursor-pointer flex items-center gap-2 self-start sm:self-auto">
            <UploadCloud className="w-3.5 h-3.5 text-[#E85D2C]" />
            <span>Choose .csv File</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-2">
          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setValidationResult(null);
            }}
            placeholder="name,sku,basePrice,salePrice,isOnSale,sizes,materials,description,images,sectionSlugs..."
            className="w-full p-3 bg-[#1C1A16] border border-[#282622] text-white text-xs font-mono focus:outline-none focus:border-[#E85D2C]"
          />
          <div className="flex items-center justify-between text-[11px] text-[#6B665F]">
            <span>Supported headers: name, sku, basePrice, salePrice, isOnSale, sizes, materials, description, images, sectionSlugs</span>
            <button
              onClick={() => {
                setCsvText(sampleCsv);
                setValidationResult(null);
              }}
              className="text-[#E85D2C] hover:underline"
            >
              Reset to Sample Data
            </button>
          </div>
        </div>

        <button
          onClick={handleValidate}
          disabled={validating}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#1C1A16] hover:bg-[#25231E] border border-[#E85D2C] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {validating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#E85D2C]" />
              <span>Validating Rows...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-[#E85D2C]" />
              <span>Validate CSV Data</span>
            </>
          )}
        </button>
      </div>

      {/* Step 2: Validation Preview Table */}
      {validationResult && (
        <div className="p-5 bg-[#141310] border border-[#24221D] space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-3">
            <div>
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white">
                Step 2: Validation & Import Preview
              </h2>
              <p className="text-xs text-[#99948D] mt-0.5">
                Total rows: <strong>{validationResult.totalRows}</strong> | Valid:{" "}
                <strong className="text-emerald-400">{validationResult.validRows}</strong> | Invalid:{" "}
                <strong className="text-red-400">{validationResult.invalidRows}</strong>
              </p>
            </div>

            <button
              onClick={handleCommit}
              disabled={!validationResult.canCommit || committing}
              className="px-6 py-2.5 bg-[#E85D2C] hover:bg-[#D44E1F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
            >
              {committing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing Catalog...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Commit {validationResult.validRows} Products to Database</span>
                </>
              )}
            </button>
          </div>

          {!validationResult.canCommit && (
            <div className="p-3 bg-red-950/20 border border-red-800 text-red-400 text-xs">
              Fix the highlighted row errors below before committing the bulk import to the database.
            </div>
          )}

          <div className="overflow-x-auto border border-[#24221D]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#24221D] text-[#6B665F] uppercase tracking-wider font-mono text-[10px] bg-[#11100D]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Sizes / Stock</th>
                  <th className="py-2.5 px-3">Issues / Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1D19]">
                {validationResult.results.map((row: any) => (
                  <tr
                    key={row.index}
                    className={row.valid ? "hover:bg-[#1C1A16]" : "bg-red-950/10 hover:bg-red-950/20"}
                  >
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B665F]">
                      {row.index + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>VALID</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-mono text-[10px] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ERROR</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {row.sku}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white">
                      ₹{row.parsedItem.basePrice}
                      {row.parsedItem.isOnSale && row.parsedItem.salePrice && (
                        <span className="text-[#E85D2C] ml-1.5 font-bold">
                          (Sale: ₹{row.parsedItem.salePrice})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#99948D]">
                      {row.parsedItem.variants.map((v: any) => `${v.size} (${v.stock})`).join(", ")}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.errors.length > 0 ? (
                        <ul className="text-red-400 text-[11px] list-disc list-inside space-y-0.5">
                          {row.errors.map((err: string, i: number) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-emerald-500 text-[11px]">Ready to insert</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
