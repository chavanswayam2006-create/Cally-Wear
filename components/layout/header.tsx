"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, User, Menu, Flame } from "lucide-react";
import { Logo } from "@/components/logo";
import { MegaNav } from "@/components/layout/mega-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchModal } from "@/components/search/search-modal";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";

export function Header() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { getItemCount, openCart } = useCartStore();
  const { getItemCount: getWishlistCount } = useWishlistStore();

  // Defer reading persisted store values until after hydration to prevent
  // server (0) vs client (N) mismatch from Zustand localStorage rehydration.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  const cartCount = hasMounted ? getItemCount() : 0;
  const wishlistCount = hasMounted ? getWishlistCount() : 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? "bg-[#FAF8F5]/95 backdrop-blur-md shadow-md border-b border-[#E4DFD5]"
            : "bg-[#FAF8F5] border-b border-[#E4DFD5]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Mobile Hamburger & Desktop Nav */}
            <div className="flex items-center gap-6">
              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open mobile menu"
                className="lg:hidden p-2 text-[#12110E] hover:text-[#E85D2C] transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo (Header placement) */}
              {/* // TODO: swap for real logo from @cally_wear */}
              <Logo size="md" />

              {/* Desktop Nav Items */}
              <nav className="hidden lg:flex items-center gap-1 ml-4" onMouseLeave={() => setActiveMenu(null)}>
                <div onMouseEnter={() => setActiveMenu("men")}>
                  <Link
                    href="/shop/men"
                    className={`px-3.5 py-2 font-display font-black text-sm uppercase tracking-wider transition-colors hover:text-[#E85D2C] ${
                      activeMenu === "men" || pathname.startsWith("/shop/men")
                        ? "text-[#E85D2C]"
                        : "text-[#12110E]"
                    }`}
                  >
                    Men
                  </Link>
                </div>

                <div onMouseEnter={() => setActiveMenu("women")}>
                  <Link
                    href="/shop/women"
                    className={`px-3.5 py-2 font-display font-black text-sm uppercase tracking-wider transition-colors hover:text-[#E85D2C] ${
                      activeMenu === "women" || pathname.startsWith("/shop/women")
                        ? "text-[#E85D2C]"
                        : "text-[#12110E]"
                    }`}
                  >
                    Women
                  </Link>
                </div>

                <div>
                  <Link
                    href="/shop?sort=newest"
                    onMouseEnter={() => setActiveMenu(null)}
                    className="px-3.5 py-2 font-display font-black text-sm uppercase tracking-wider text-[#12110E] hover:text-[#E85D2C] transition-colors flex items-center gap-1"
                  >
                    <span>New Drops</span>
                    <span className="text-[10px] bg-[#E85D2C] text-white px-1 py-0.2 font-sans font-bold">
                      04
                    </span>
                  </Link>
                </div>

                <div onMouseEnter={() => setActiveMenu("collections")}>
                  <Link
                    href="/collections/monochrome-vault"
                    className={`px-3.5 py-2 font-display font-black text-sm uppercase tracking-wider transition-colors hover:text-[#E85D2C] ${
                      activeMenu === "collections" || pathname.startsWith("/collections")
                        ? "text-[#E85D2C]"
                        : "text-[#12110E]"
                    }`}
                  >
                    Collections
                  </Link>
                </div>

                <div>
                  <Link
                    href="/shop?sale=true"
                    onMouseEnter={() => setActiveMenu(null)}
                    className="px-3.5 py-2 font-display font-black text-sm uppercase tracking-wider text-[#E85D2C] hover:text-[#D44E1F] transition-colors"
                  >
                    Sale
                  </Link>
                </div>
              </nav>
            </div>

            {/* Right: Search, Wishlist, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search catalog"
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-[#12110E] hover:text-[#E85D2C] transition-colors border border-transparent sm:border-[#E4DFD5] sm:bg-white"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-semibold text-[#6B665F]">
                  Search kicks...
                </span>
                <kbd className="hidden lg:inline-block text-[10px] font-mono bg-[#FAF8F5] text-[#8C877E] px-1.5 py-0.5 border border-[#E4DFD5]">
                  ⌘K
                </kbd>
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="View wishlist"
                className="relative p-2 text-[#12110E] hover:text-[#E85D2C] transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#E85D2C] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href="/account"
                aria-label="User account"
                className="hidden sm:flex p-2 text-[#12110E] hover:text-[#E85D2C] transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Button */}
              <button
                onClick={openCart}
                aria-label="Open shopping cart"
                className="relative flex items-center gap-2 px-3 py-2 bg-[#12110E] text-white hover:bg-[#E85D2C] transition-colors ml-1"
              >
                <ShoppingBag className="w-5 h-5 text-[#FAF8F5]" />
                <span className="text-xs font-black font-display uppercase tracking-wider hidden sm:inline">
                  Bag
                </span>
                <span className="w-5 h-5 bg-[#E85D2C] text-white text-[10px] font-black rounded-full flex items-center justify-center font-mono group-hover:bg-[#12110E]">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mega Navigation Overlay */}
        <MegaNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </header>

      {/* Mobile Menu Modal */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={openCart}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
