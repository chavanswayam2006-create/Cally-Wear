"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  UploadCloud,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email: string; fullName?: string } | null>(null);

  useEffect(() => {
    if (!isLoginPage) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [isLoginPage]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Sections / Drops", href: "/admin/sections", icon: Layers },
    { label: "Bulk Import", href: "/admin/products/bulk-import", icon: UploadCloud },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Customers", href: "/admin/customers", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0E0D0B] text-[#FAF8F5] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#141310] border-b border-[#24221D] sticky top-0 z-50">
        <Logo size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#99948D] hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#141310] border-r border-[#24221D] flex flex-col justify-between z-40 transition-transform duration-200 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <span className="px-2 py-0.5 bg-[#201E1A] border border-[#2F2C26] text-[#E85D2C] text-[10px] font-mono font-bold uppercase tracking-widest">
              ADMIN
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-[#E85D2C] text-white font-bold"
                      : "text-[#99948D] hover:text-white hover:bg-[#1C1A16]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#24221D] space-y-3 bg-[#11100D]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-[#99948D] hover:text-white hover:bg-[#1C1A16] transition-colors border border-[#24221D]"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] text-[#6B665F]">↗</span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 bg-[#24221D] text-[#E85D2C] flex items-center justify-center font-black text-xs shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-white">
                  {adminUser?.fullName || "Admin"}
                </p>
                <p className="text-[10px] text-[#6B665F] truncate">
                  {adminUser?.email || "admin@callywear.com"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-[#99948D] hover:text-red-400 hover:bg-[#1C1A16] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#0E0D0B] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
