import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Cally Wear database...");

  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@callywear.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "CallyAdmin2026!";
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(adminPassword, salt);

  // 1. Seed Admin Profile
  const adminProfile = await prisma.profile.upsert({
    where: { email: adminEmail.toLowerCase().trim() },
    update: {
      role: "ADMIN",
      fullName: "Cally Administrator",
    },
    create: {
      id: "profile_admin_root",
      email: adminEmail.toLowerCase().trim(),
      fullName: "Cally Administrator",
      phone: "+91 99999 99999",
      role: "ADMIN",
      passwordHash,
    },
  });
  console.log(`✅ Admin profile seeded: ${adminProfile.email}`);
  console.log(`   [Local Dev Only] Admin Email:    ${adminEmail}`);
  console.log(`   [Local Dev Only] Admin Password: ${adminPassword}`);

  // 2. Seed Starter Sections
  const starterSections = [
    { name: "New Arrivals", slug: "new-arrivals", sortOrder: 0 },
    { name: "Best Sellers", slug: "best-sellers", sortOrder: 1 },
    { name: "Sale", slug: "sale", sortOrder: 2 },
    { name: "Men", slug: "men", sortOrder: 3 },
    { name: "Women", slug: "women", sortOrder: 4 },
  ];

  const sectionMap = new Map<string, string>();
  for (const sec of starterSections) {
    const s = await prisma.section.upsert({
      where: { slug: sec.slug },
      update: { name: sec.name, sortOrder: sec.sortOrder },
      create: sec,
    });
    sectionMap.set(sec.slug, s.id);
  }
  console.log("✅ Sections seeded: New Arrivals, Best Sellers, Sale, Men, Women");

  // 3. Seed 6 Sample Products
  const sampleProducts = [
    {
      name: "Apex Tech Runner",
      slug: "apex-tech-runner",
      sku: "CW-SNK-001",
      description: "Engineered for high-intensity urban agility and concrete endurance. Merges tactical ripstop nylon with responsive nitrogen-injected cushioning.",
      materials: "Ripstop ballistic nylon, TPU cage, Nitrogen-infused EVA foam midsole, Vibram rubber tread outsole",
      basePrice: 7999,
      salePrice: 6999,
      isOnSale: true,
      discountPercent: 13,
      isFeatured: true,
      isNewArrival: true,
      status: "PUBLISHED" as const,
      sections: ["new-arrivals", "best-sellers", "sale", "men"],
      sizes: [
        { size: "UK 7", stock: 15 },
        { size: "UK 8", stock: 22 },
        { size: "UK 9", stock: 18 },
        { size: "UK 10", stock: 12 },
        { size: "UK 11", stock: 8 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80", altText: "Apex Tech Runner - Lateral View", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80", altText: "Apex Tech Runner - Front Detail", sortOrder: 1 }
      ]
    },
    {
      name: "Ghost Phantom Low",
      slug: "ghost-phantom-low",
      sku: "CW-SNK-002",
      description: "Monochrome low-top sneaker crafted with premium matte tumbled leather, waxed tonal lacing, and reinforced cupsole construction.",
      materials: "Full-grain tumbled calf leather, perforated vamp, waxed cotton laces, vulcanized gum rubber outsole",
      basePrice: 6499,
      salePrice: null,
      isOnSale: false,
      discountPercent: null,
      isFeatured: true,
      isNewArrival: true,
      status: "PUBLISHED" as const,
      sections: ["new-arrivals", "men", "women"],
      sizes: [
        { size: "UK 6", stock: 10 },
        { size: "UK 7", stock: 14 },
        { size: "UK 8", stock: 19 },
        { size: "UK 9", stock: 15 },
        { size: "UK 10", stock: 8 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80", altText: "Ghost Phantom Low - Profile", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80", altText: "Ghost Phantom Low - Sole", sortOrder: 1 }
      ]
    },
    {
      name: "Veloce Speed Trainer",
      slug: "veloce-speed-trainer",
      sku: "CW-SNK-003",
      description: "Aggressive aerodynamic silhouette built with breathable 3D engineered knit, reflective 3M piping, and carbon stability arch plate.",
      materials: "Recycled engineered knit, molded neoprene collar, dual-density phylon midsole, carbon torsion plate",
      basePrice: 8499,
      salePrice: 7499,
      isOnSale: true,
      discountPercent: 12,
      isFeatured: false,
      isNewArrival: true,
      status: "PUBLISHED" as const,
      sections: ["new-arrivals", "sale"],
      sizes: [
        { size: "UK 7", stock: 12 },
        { size: "UK 8", stock: 16 },
        { size: "UK 9", stock: 14 },
        { size: "UK 10", stock: 9 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80", altText: "Veloce Speed Trainer", sortOrder: 0 }
      ]
    },
    {
      name: "Solstice Slide Pro",
      slug: "solstice-slide-pro",
      sku: "CW-SLD-004",
      description: "Ultra-cushioned street slide with contoured footbed, adjustable ripstop strap, and textured traction outsole.",
      materials: "Hydrophobic EVA foam, ballistic nylon strap with industrial hook-and-loop closure",
      basePrice: 2499,
      salePrice: 1999,
      isOnSale: true,
      discountPercent: 20,
      isFeatured: true,
      isNewArrival: false,
      status: "PUBLISHED" as const,
      sections: ["best-sellers", "sale", "men", "women"],
      sizes: [
        { size: "UK 6", stock: 25 },
        { size: "UK 7", stock: 30 },
        { size: "UK 8", stock: 28 },
        { size: "UK 9", stock: 22 },
        { size: "UK 10", stock: 15 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80", altText: "Solstice Slide Pro", sortOrder: 0 }
      ]
    },
    {
      name: "Retro Court Heritage",
      slug: "retro-court-heritage",
      sku: "CW-SNK-005",
      description: "Timeless 80s court silhouette re-engineered with modern cushioning and reinforced toe cap for daily rotation.",
      materials: "Smooth action leather, suede mudguard, Ortholite memory insole, rubber pivot cupsole",
      basePrice: 5499,
      salePrice: null,
      isOnSale: false,
      discountPercent: null,
      isFeatured: false,
      isNewArrival: false,
      status: "PUBLISHED" as const,
      sections: ["best-sellers", "men", "women"],
      sizes: [
        { size: "UK 6", stock: 14 },
        { size: "UK 7", stock: 20 },
        { size: "UK 8", stock: 25 },
        { size: "UK 9", stock: 18 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80", altText: "Retro Court Heritage", sortOrder: 0 }
      ]
    },
    {
      name: "Terraform Hiker Boot",
      slug: "terraform-hiker-boot",
      sku: "CW-BOT-006",
      description: "Tactical hybrid boot featuring waterproof membrane, metal speed hooks, and deep lugged Vibram all-weather grip.",
      materials: "Waterproof nubuck, Cordura canvas, gusseted tongue, heavy-duty Vibram Commando outsole",
      basePrice: 10999,
      salePrice: null,
      isOnSale: false,
      discountPercent: null,
      isFeatured: true,
      isNewArrival: false,
      status: "PUBLISHED" as const,
      sections: ["men"],
      sizes: [
        { size: "UK 7", stock: 8 },
        { size: "UK 8", stock: 12 },
        { size: "UK 9", stock: 15 },
        { size: "UK 10", stock: 10 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80", altText: "Terraform Hiker Boot", sortOrder: 0 }
      ]
    }
  ];

  for (const prod of sampleProducts) {
    const created = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        materials: prod.materials,
        basePrice: prod.basePrice,
        salePrice: prod.salePrice,
        isOnSale: prod.isOnSale,
        discountPercent: prod.discountPercent,
        isFeatured: prod.isFeatured,
        isNewArrival: prod.isNewArrival,
        status: prod.status,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        materials: prod.materials,
        basePrice: prod.basePrice,
        salePrice: prod.salePrice,
        isOnSale: prod.isOnSale,
        discountPercent: prod.discountPercent,
        isFeatured: prod.isFeatured,
        isNewArrival: prod.isNewArrival,
        status: prod.status,
        variants: {
          create: prod.sizes.map((s) => ({
            size: s.size,
            stock: s.stock,
          })),
        },
        images: {
          create: prod.images.map((img) => ({
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder,
          })),
        },
        sections: {
          create: prod.sections
            .map((slug) => sectionMap.get(slug))
            .filter(Boolean)
            .map((sectionId) => ({
              sectionId: sectionId!,
            })),
        },
      },
    });
    console.log(`✅ Product seeded: ${created.name} (${created.sku})`);
  }

  console.log("🚀 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
