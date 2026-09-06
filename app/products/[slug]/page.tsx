import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts, getRelatedProducts } from "@/lib/data/products";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { Product, ProductCategory } from "@/lib/types/product";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Fetch all product slugs from the canonical data layer at build time
  const products = await getAllProducts();
  const slugs = new Set<string>();
  products.forEach((product: Product) => {
    if (product && typeof product.slug === "string" && product.slug.trim()) {
      slugs.add(product.slug);
    }
  });
  slugs.add("cally-apex-tech-runner");
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  if (!resolved || !resolved.slug) {
    return {
      title: "Product Not Found",
    };
  }
  const slug = resolved.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} — Cally Wear`,
    description: product.description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title: `${product.name} | Cally Wear Footwear`,
      description: product.description,
      images: [
        {
          url: product.images[0],
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const resolved = await params;
  if (!resolved || !resolved.slug) {
    notFound();
  }
  const slug = resolved.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 4);

  return (
    <ProductDetailView product={product} relatedProducts={relatedProducts} />
  );
}