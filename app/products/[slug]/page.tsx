import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { ProductDetailView } from "@/components/product/product-detail-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const list = Array.isArray(products) ? products : [];
  return list
    .filter((product) => Boolean(product && typeof product.slug === "string" && product.slug.trim()))
    .map((product) => ({
      slug: product.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  if (!resolved || !resolved.slug) {
    return {
      title: "Product Not Found",
    };
  }
  const slug = resolved.slug;
  const product = getProductBySlug(slug);

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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.id, 4);

  return (
    <ProductDetailView product={product} relatedProducts={relatedProducts} />
  );
}
