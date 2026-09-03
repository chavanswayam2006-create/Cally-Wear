"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  RefreshCw,
  ShoppingBag,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CustomerRecord {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string;
  ordersCount: number;
  totalSpend: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDrilldown = async (id: string) => {
    setSelectedCustomerId(id);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      if (!res.ok) throw new Error("Failed to load customer details");
      const data = await res.json();
      setSelectedCustomerDetails(data.customer);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24221D] pb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            Customer Directory
          </h1>
          <p className="text-xs text-[#99948D] mt-1">
            Registered customer accounts, lifetime spending volume, and historical orders.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="px-3.5 py-2 bg-[#1C1A16] hover:bg-[#25231E] border border-[#2F2C26] text-xs font-semibold text-[#FAF8F5] flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#E85D2C]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#141310] border border-[#24221D] p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchCustomers();
          }}
          className="relative"
        >
          <Search className="w-4 h-4 text-[#6B665F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1C1A16] border border-[#282622] text-white text-xs placeholder:text-[#6B665F] focus:outline-none focus:border-[#E85D2C]"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customers Table */}
        <div className="lg:col-span-2 bg-[#141310] border border-[#24221D] overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#99948D] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#E85D2C]" />
              <span>Loading customer records...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#6B665F]">
              No customer records found.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#24221D] text-[#6B665F] uppercase tracking-wider font-mono text-[10px] bg-[#11100D]">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Total Spend</th>
                  <th className="py-3 px-4 text-right">Drill-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1D19]">
                {customers.map((c) => {
                  const isSelected = selectedCustomerId === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleDrilldown(c.id)}
                      className={`hover:bg-[#1C1A16] cursor-pointer transition-colors ${
                        isSelected ? "bg-[#1F1D19]" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">
                          {c.fullName || "Registered User"}
                        </p>
                        <p className="text-[11px] text-[#99948D] font-mono">
                          {c.email}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#99948D]">
                        {c.phone || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {c.ordersCount} orders
                      </td>
                      <td className="py-3 px-4 font-display font-bold text-[#E85D2C]">
                        {formatPrice(c.totalSpend)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="p-1.5 text-[#99948D] hover:text-[#E85D2C]">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right 1 Col: Customer Drilldown Drawer */}
        <div className="bg-[#141310] border border-[#24221D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#24221D] pb-3">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#E85D2C]" />
              <span>Customer Details</span>
            </h2>
            {selectedCustomerId && (
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setSelectedCustomerDetails(null);
                }}
                className="text-[#99948D] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!selectedCustomerId ? (
            <p className="text-xs text-[#6B665F] py-12 text-center">
              Click any customer row to view their order history and saved delivery addresses.
            </p>
          ) : detailsLoading ? (
            <div className="py-12 text-center text-xs text-[#99948D] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#E85D2C]" />
              <span>Loading details...</span>
            </div>
          ) : selectedCustomerDetails ? (
            <div className="space-y-6">
              {/* Profile summary */}
              <div className="space-y-1 text-xs">
                <p className="text-base font-bold text-white">
                  {selectedCustomerDetails.fullName || "User"}
                </p>
                <p className="text-[#99948D] font-mono">{selectedCustomerDetails.email}</p>
                <p className="text-[#99948D]">{selectedCustomerDetails.phone || "No phone registered"}</p>
                <div className="pt-2 flex items-center gap-4 text-[11px] font-mono">
                  <span className="text-[#6B665F]">
                    Total Orders: <strong className="text-white">{selectedCustomerDetails.ordersCount}</strong>
                  </span>
                  <span className="text-[#6B665F]">
                    Spend: <strong className="text-[#E85D2C]">{formatPrice(selectedCustomerDetails.totalSpend)}</strong>
                  </span>
                </div>
              </div>

              {/* Saved Addresses */}
              <div className="space-y-2 border-t border-[#1F1D19] pt-4">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E85D2C]" />
                  <span>Saved Addresses ({selectedCustomerDetails.addresses?.length || 0})</span>
                </h3>

                {selectedCustomerDetails.addresses?.length === 0 ? (
                  <p className="text-[11px] text-[#6B665F]">No saved addresses.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomerDetails.addresses?.map((addr: any) => (
                      <div key={addr.id} className="p-2.5 bg-[#1C1A16] border border-[#282622] text-[11px] text-[#C5C0B8] space-y-0.5">
                        <p className="font-semibold text-white">{addr.label || "Address"}</p>
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-[10px] text-[#6B665F]">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="space-y-2 border-t border-[#1F1D19] pt-4">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#E85D2C]" />
                  <span>Order History</span>
                </h3>

                {selectedCustomerDetails.orders?.length === 0 ? (
                  <p className="text-[11px] text-[#6B665F]">No orders placed yet.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedCustomerDetails.orders?.map((ord: any) => (
                      <Link
                        key={ord.id}
                        href={`/admin/orders/${ord.id}`}
                        className="p-2.5 bg-[#1C1A16] border border-[#282622] hover:border-[#E85D2C] block transition-colors space-y-1"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono font-bold text-[#E85D2C]">{ord.orderNumber}</span>
                          <span className="font-display font-bold text-white">{formatPrice(ord.total)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#6B665F] font-mono">
                          <span>{ord.status}</span>
                          <span>{new Date(ord.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
