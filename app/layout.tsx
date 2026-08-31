import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Cally Wear Footwear",
    default: "Cally Wear — Direct-to-Consumer Footwear & Streetwear",
  },
  description:
    "Engineered for the asphalt. Explore limited edition sneaker silhouettes, carbon plate runners, platform footwear, and recovery slides by Cally Wear.",
  keywords: [
    "Cally Wear",
    "sneakers",
    "streetwear footwear",
    "running shoes",
    "chunky platform sneakers",
    "cloud slides",
    "footwear brand Mumbai",
  ],
  authors: [{ name: "Cally Wear" }],
  openGraph: {
    title: "Cally Wear — Direct-to-Consumer Footwear & Streetwear",
    description:
      "Engineered for relentless street rotation. High-octane aesthetics, responsive cushions, and raw streetwear silhouettes.",
    url: "https://callywear.com",
    siteName: "Cally Wear",
    locale: "en_IN",
    type: "website",
  },
  // TODO: swap for real logo from @cally_wear
  icons: {
    icon: "/brand/logo-mark.svg",
    apple: "/brand/logo-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#12110E]">
        {/* Top Announcement Bar */}
        <AnnouncementBar />

        {/* Global Sticky Header */}
        <Header />

        {/* Main Application Body */}
        <main className="flex-1">{children}</main>

        {/* Slide-out Cart Drawer */}
        <CartDrawer />

        {/* Global Brand Footer */}
        <Footer />
      </body>
    </html>
  );
}
