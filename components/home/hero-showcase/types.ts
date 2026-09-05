export interface HeroSlideItem {
  id: string;
  productId: string;
  displayOrder: number;
  isActive: boolean;
  eyebrowLabel: string;
  headlineOverride?: string | null;
  descriptionOverride?: string | null;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryLink?: string | null;
  ctaPrimaryLink?: string | null;
  cutoutImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    basePrice: number;
    salePrice?: number | null;
    isOnSale?: boolean;
    description?: string;
    images?: Array<{ url: string; altText?: string | null }>;
  } | null;
}

export interface HeroShowcaseProps {
  initialSlides?: HeroSlideItem[];
  autoplayIntervalMs?: number;
  isPreview?: boolean;
  activePreviewIndex?: number;
  onSlideChange?: (index: number) => void;
  className?: string;
}

export const FALLBACK_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: "fallback_hero_01",
    productId: "prod_01",
    displayOrder: 0,
    isActive: true,
    eyebrowLabel: "DROP 04 / EXCLUSIVE LAUNCH",
    headlineOverride: "CALLY APEX TECH RUNNER",
    descriptionOverride:
      "Engineered for high-octane asphalt agility. Responsive nitrogen-injected cushioning meets tactical ripstop architecture.",
    ctaPrimaryLabel: "EXPLORE THE DROP",
    ctaPrimaryLink: "/products/apex-tech-runner",
    ctaSecondaryLabel: "SHOP MEN'S KICKS",
    ctaSecondaryLink: "/shop/men",
    cutoutImageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    product: {
      id: "prod_01",
      name: "Apex Tech Runner",
      slug: "apex-tech-runner",
      sku: "CW-SNK-001",
      basePrice: 7999,
      salePrice: 6999,
      isOnSale: true,
      description:
        "Engineered for high-intensity urban agility and concrete endurance. Merges tactical ripstop nylon with responsive nitrogen-injected cushioning.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        },
      ],
    },
  },
  {
    id: "fallback_hero_02",
    productId: "prod_02",
    displayOrder: 1,
    isActive: true,
    eyebrowLabel: "LIMITED EDITORIAL COLLECTION",
    headlineOverride: "THE MONOCHROME VAULT",
    descriptionOverride:
      "Stripped of color distractions. Shadow and light engineered with heavy tumbled Italian leathers and obsidian carbon accents.",
    ctaPrimaryLabel: "VIEW VAULT LOOKBOOK",
    ctaPrimaryLink: "/collections/monochrome-vault",
    ctaSecondaryLabel: "ALL SNEAKERS",
    ctaSecondaryLink: "/shop",
    cutoutImageUrl:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
    product: {
      id: "prod_02",
      name: "Ghost Phantom Low",
      slug: "ghost-phantom-low",
      sku: "CW-SNK-002",
      basePrice: 6499,
      salePrice: null,
      isOnSale: false,
      description:
        "Monochrome low-top sneaker crafted with premium matte tumbled leather, waxed tonal lacing, and reinforced cupsole construction.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
        },
      ],
    },
  },
  {
    id: "fallback_hero_03",
    productId: "prod_03",
    displayOrder: 2,
    isActive: true,
    eyebrowLabel: "WOMEN'S STREETWEAR ICON",
    headlineOverride: "STRATA CHUNKY PLATFORM",
    descriptionOverride:
      "52mm sculpted elevation. Featherlight composite geometry crafted to elevate your daily street stance with zero fatigue.",
    ctaPrimaryLabel: "SHOP STRATA",
    ctaPrimaryLink: "/products/veloce-speed-trainer",
    ctaSecondaryLabel: "WOMEN'S COLLECTION",
    ctaSecondaryLink: "/shop/women",
    cutoutImageUrl:
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80",
    product: {
      id: "prod_03",
      name: "Veloce Speed Trainer",
      slug: "veloce-speed-trainer",
      sku: "CW-SNK-003",
      basePrice: 8499,
      salePrice: 7499,
      isOnSale: true,
      description:
        "Aggressive aerodynamic silhouette built with breathable 3D engineered knit, reflective 3M piping, and carbon stability arch plate.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80",
        },
      ],
    },
  },
];
