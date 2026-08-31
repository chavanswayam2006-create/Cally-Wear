import { Collection } from "@/lib/types/product";

export const collections: Collection[] = [
  {
    id: "col-monochrome-vault",
    slug: "monochrome-vault",
    title: "Monochrome Vault",
    subtitle: "DROP 04 / SHADOW & LIGHT",
    description: "Stripped of color distractions. High-contrast blacks, deep carbon tones, and architectural whites engineered with premium leathers and ballistic meshes.",
    bannerImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1800&q=80",
    featuredProductIds: ["cw-prod-01", "cw-prod-02", "cw-prod-03", "cw-prod-15"],
    tags: ["Monochrome", "Limited Drop", "High Contrast"]
  },
  {
    id: "col-street-classics",
    slug: "street-classics",
    title: "Street Classics",
    subtitle: "HERITAGE MEETS CONTEMPORARY",
    description: "Everyday icons built for relentless pavement rotation. Low profile cuts, vulcanized outsoles, and durable tumbled leathers that look better with every scuff.",
    bannerImage: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1800&q=80",
    featuredProductIds: ["cw-prod-02", "cw-prod-04", "cw-prod-07", "cw-prod-09", "cw-prod-12"],
    tags: ["Heritage", "Everyday", "Leather"]
  },
  {
    id: "col-performance-lab",
    slug: "performance-lab",
    title: "Performance Lab",
    subtitle: "RACE READY / CARBON FIBER",
    description: "Propulsion engineering meets marathon discipline. Dual-density nitrogen foams, full-length curved carbon plates, and featherweight open-mesh racing shells.",
    bannerImage: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1800&q=80",
    featuredProductIds: ["cw-prod-01", "cw-prod-05", "cw-prod-08", "cw-prod-11"],
    tags: ["Running", "Carbon Plate", "Speed"]
  },
  {
    id: "col-recovery-slides",
    slug: "summer-slides-mules",
    title: "Recovery & Slides",
    subtitle: "OFF-DUTY COMFORT",
    description: "Architectural foam comfort for post-training recovery and weekend ease. Waterproof closed-cell EVA construction with ergonomic arch support.",
    bannerImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1800&q=80",
    featuredProductIds: ["cw-prod-06", "cw-prod-14"],
    tags: ["Slides", "Mules", "Recovery"]
  }
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}
