import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, getCollectionBySlug } from "@/lib/data/collections";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";
import { ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  return {
    title: `${collection.title} — Editorial Collection`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  // Filter products by collection featured IDs or matching category tags
  const collectionProducts = products.filter(
    (p) =>
      collection.featuredProductIds.includes(p.id) ||
      p.tags?.some((t) => collection.tags.includes(t))
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Editorial Banner */}
      <div className="relative w-full h-[55vh] min-h-[420px] max-h-[600px] bg-[#12110E] text-white flex flex-col justify-end p-6 md:p-12 overflow-hidden border-b border-[#282622]">
        <Image
          src={collection.bannerImage}
          alt={collection.title}
          fill
          priority
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12110E] via-[#12110E]/60 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto w-full space-y-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FAF8F5]/80 hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4 text-[#E85D2C]" />
            <span>Back to All Kicks</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#12110E]/80 border border-[#282622] text-xs font-black uppercase tracking-widest text-[#E85D2C]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{collection.subtitle}</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-white leading-none">
            {collection.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#D4CFC7] max-w-2xl leading-relaxed">
            {collection.description}
          </p>
        </div>
      </div>

      {/* Product Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-center justify-between pb-6 border-b border-[#E4DFD5] mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-[#6B665F]">
            Showing {collectionProducts.length} Silhouettes in this Vault
          </span>
          <div className="flex items-center gap-2">
            {collection.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-[#12110E] text-white px-2 py-0.5 font-black uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {collectionProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
