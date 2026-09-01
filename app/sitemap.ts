import { MetadataRoute } from "next";
import { products } from "@/lib/data/products";
import { collections } from "@/lib/data/collections";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://callywear.com";

  const staticPages = [
    "",
    "/shop",
    "/shop/men",
    "/shop/women",
    "/wishlist",
    "/cart",
    "/checkout",
    "/about",
    "/contact",
    "/faq",
    "/shipping-returns",
    "/privacy-policy",
    "/terms",
    "/track-order",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const productPages = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const collectionPages = collections.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...productPages, ...collectionPages];
}
