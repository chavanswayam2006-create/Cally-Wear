import { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/data/products";
import { getCollections } from "@/lib/data/collections";
import { Product, Collection } from "@/lib/types/product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const products = await getAllProducts();
  const collections = await getCollections();

  const productPages = products.map((p: Product) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const collectionPages = collections.map((c: Collection) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...productPages, ...collectionPages];
}
