import { Product } from "@/lib/types/product";

/**
 * CALLY WEAR SEED CATALOG
 * 
 * Easily swappable catalog seed data.
 * To replace with real catalog: update the products array below with the same Product schema.
 */
const initialSeedProducts: Product[] = [
  {
    id: "cw-prod-01",
    slug: "cally-apex-tech-runner",
    name: "Cally Apex Tech Runner",
    category: "men",
    subCategory: "running",
    price: 7999,
    compareAtPrice: 9499,
    isNew: true,
    isFeatured: true,
    stock: 14,
    rating: 4.9,
    reviewCount: 38,
    tags: ["Drop 04", "Carbon Plate", "Limited", "Best Seller"],
    materials: "Ripstop ballistic nylon, TPU cage, Nitrogen-infused EVA foam midsole, Vibram rubber tread outsole",
    description: "Engineered for high-intensity urban agility and concrete endurance. The Apex Tech Runner merges tactical aesthetics with responsive nitrogen-injected cushioning.",
    details: [
      "Dynamic heel stabilizer clip for rotational lock-in",
      "Glow-in-the-dark reflective 3M accent piping",
      "Ergonomic dual-density anatomical footbed",
      "Weight: 295g (UK 9)"
    ],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: [
      {
        name: "Obsidian Core",
        hex: "#161616",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Solar Ember",
        hex: "#E85D2C",
        images: [
          "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Chalk Bone",
        hex: "#EBE6DC",
        images: [
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-02",
    slug: "cally-phantom-retro-low",
    name: "Cally Phantom Retro Low",
    category: "unisex",
    subCategory: "sneakers",
    price: 5499,
    compareAtPrice: 6999,
    isNew: false,
    isFeatured: true,
    stock: 8,
    rating: 4.8,
    reviewCount: 52,
    tags: ["Iconic", "Street Classic", "Everyday"],
    materials: "Full-grain tumbled leather upper, padded collar, cupsole rubber construction, cotton flat laces",
    description: "The quintessential streetwear staple. Handcrafted with premium tumbled leather and finished with our signature low-profile silhouette that wears in beautifully over time.",
    details: [
      "Perforated toe box for constant airflow",
      "Heavyweight herringbone vulcanized outsole",
      "Reinforced double-needle stitching",
      "Padded ankle support for all-day comfort"
    ],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: [
      {
        name: "Vintage White & Charcoal",
        hex: "#D9D6CE",
        images: [
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Midnight Pitch",
        hex: "#101010",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-03",
    slug: "cally-strata-chunky-platform",
    name: "Cally Strata Chunky Platform",
    category: "women",
    subCategory: "streetwear",
    price: 6299,
    compareAtPrice: 7499,
    isNew: true,
    isFeatured: true,
    stock: 5,
    rating: 4.9,
    reviewCount: 29,
    tags: ["Trending", "Statement Sole", "Women Exclusive"],
    materials: "Supple micro-fiber leather, chunky sculpted EVA platform midsole, anti-slip lugged rubber base",
    description: "Elevate your stance. The Strata Chunky Platform combines architectural geometry with featherlight composite soles for effortless height and maximum swagger.",
    details: [
      "52mm sculpted platform elevation",
      "Ultra-soft foam tongue to prevent pressure points",
      "Breathable antimicrobial interior lining",
      "Cushioned memory foam arch support"
    ],
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    colors: [
      {
        name: "Oatmeal Cream",
        hex: "#F1EADC",
        images: [
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Shadow Noir",
        hex: "#1F1E1B",
        images: [
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-04",
    slug: "cally-nomad-tactical-high",
    name: "Cally Nomad Tactical High-Top",
    category: "men",
    subCategory: "streetwear",
    price: 9999,
    compareAtPrice: 11999,
    isNew: false,
    isFeatured: true,
    stock: 3,
    rating: 5.0,
    reviewCount: 44,
    tags: ["High Top", "Weatherproof", "Limited Drop"],
    materials: "Water-resistant Cordura ballistic mesh, premium nubuck overlays, rugged high-traction tread",
    description: "Built for all terrain, styled for city nights. The Nomad High-Top features high-abrasion ballistic mesh and heavy-duty speed eyelets inspired by modern military tactical gear.",
    details: [
      "Water-repellent barrier coating",
      "Padded gusseted tongue keeps debris out",
      "Molded TPU heel counter for lateral lock",
      "Heavy duty heel pull loop"
    ],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
    colors: [
      {
        name: "Desert Sand & Clay",
        hex: "#C4A482",
        images: [
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Pitch Black",
        hex: "#0E0E0E",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-05",
    slug: "cally-velocity-boost-v2",
    name: "Cally Velocity Boost V2",
    category: "men",
    subCategory: "running",
    price: 8499,
    compareAtPrice: 9999,
    isNew: true,
    isFeatured: true,
    stock: 12,
    rating: 4.7,
    reviewCount: 31,
    tags: ["Ultra Light", "Performance", "Running"],
    materials: "Engineered single-layer jacquard knit, thermoplastic foam core, high-abrasion rubber pods",
    description: "Zero bulk, maximum return. Built with adaptive knitted zones that breathe freely and rebound energy with every stride across tarmac or track.",
    details: [
      "Seamless upper hugs foot with zero hot spots",
      "High-energy rebound foam provides 72% energy return",
      "Segmented crash pad for smooth heel-to-toe transition",
      "Weight: 260g (UK 9)"
    ],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: [
      {
        name: "Infra Red & Steel",
        hex: "#D63031",
        images: [
          "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Glacier Grey",
        hex: "#B0B7BC",
        images: [
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-06",
    slug: "cally-drift-cloud-slide",
    name: "Cally Drift Cloud Slide",
    category: "unisex",
    subCategory: "slides",
    price: 2499,
    compareAtPrice: 2999,
    isNew: false,
    isFeatured: true,
    stock: 22,
    rating: 4.9,
    reviewCount: 88,
    tags: ["Recovery", "Waterproof", "Essential"],
    materials: "One-piece molded eco-EVA compound, textured deep cupped footbed, wave-groove drainage outsole",
    description: "Instant post-session relief and poolside cool. Molded in a single seamless piece with pillowy cloud foam that cushions foot fatigue instantly.",
    details: [
      "40mm thickness for maximum shock absorption",
      "Diamond micro-texture prevents slipping with wet feet",
      "Quick-drying, odor-resistant, wash-and-wear",
      "Ergonomic toe bar keeps foot secure"
    ],
    sizes: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: [
      {
        name: "Stone Olive",
        hex: "#556B2F",
        images: [
          "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Bone Chalk",
        hex: "#EFECE6",
        images: [
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Pitch Matte Black",
        hex: "#151515",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-07",
    slug: "cally-aura-minimalist-court",
    name: "Cally Aura Minimalist Court",
    category: "women",
    subCategory: "sneakers",
    price: 4999,
    compareAtPrice: 5999,
    isNew: false,
    isFeatured: false,
    stock: 10,
    rating: 4.8,
    reviewCount: 22,
    tags: ["Minimalist", "Clean", "Wardrobe Essential"],
    materials: "Smooth Italian nappa-finish synthetic leather, gold-foil heat embossed branding, gum rubber cupsole",
    description: "Pure lines and supreme versatility. The Aura Minimalist Court elevates clean monochrome dressing with razor-sharp detailing and all-day cupsole comfort.",
    details: [
      "Low-profile padded tongue and collar",
      "Hand-finished gum rubber outsole with non-marking grip",
      "OrthoLite antimicrobial comfort sockliner",
      "Includes two pairs of waxed cotton laces"
    ],
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    colors: [
      {
        name: "Triple Crisp White",
        hex: "#FFFFFF",
        images: [
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Warm Beige Gum",
        hex: "#E0D7C6",
        images: [
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-08",
    slug: "cally-zenith-carbon-racer",
    name: "Cally Zenith Carbon Racer",
    category: "men",
    subCategory: "running",
    price: 10499,
    compareAtPrice: 12999,
    isNew: true,
    isFeatured: true,
    stock: 4,
    rating: 5.0,
    reviewCount: 19,
    tags: ["Carbon Plate", "Race Day", "Marathon Ready"],
    materials: "Monofilament translucent hyper-mesh, full-length curved carbon fiber plate, Pebax superfoam",
    description: "The pinnacle of speed engineering. Designed with a curved carbon-fiber propulsion plate sandwiched between twin layers of ultra-resilient Pebax foam.",
    details: [
      "Full-length rigid 3K weave carbon propulsion plate",
      "Ultra-thin breathable tongue with anatomical notch",
      "Featherweight racer profile: 215g (UK 9)",
      "Engineered drop: 8mm for aggressive forward propulsion"
    ],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: [
      {
        name: "Volt Neon & Carbon",
        hex: "#DFFF00",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Stealth Slate",
        hex: "#2F3542",
        images: [
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-09",
    slug: "cally-element-suede-skate",
    name: "Cally Element Suede Skate",
    category: "men",
    subCategory: "streetwear",
    price: 5999,
    compareAtPrice: 6999,
    isNew: false,
    isFeatured: false,
    stock: 9,
    rating: 4.7,
    reviewCount: 35,
    tags: ["Skate", "Heavy Suede", "Durable"],
    materials: "Reinforced 1.8mm heavy pig suede, triple-stitched ollie zone, waffle vulcanized gum sole",
    description: "Built tough for the asphalt session. The Element Skate pairs heavy-nap suede panels with reinforced abrasion collars and a tacky board-feel vulcanized outsole.",
    details: [
      "Double layer canvas lining in high friction areas",
      "Impact absorbing gel insert at the heel",
      "Elastic tongue stabilizing wings",
      "Includes extra wide skate laces"
    ],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: [
      {
        name: "Olive Drab Suede",
        hex: "#4B5320",
        images: [
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Mustard Tan",
        hex: "#E1AD01",
        images: [
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-10",
    slug: "cally-hypercourt-pro-mid",
    name: "Cally Hypercourt Pro Mid",
    category: "men",
    subCategory: "basketball",
    price: 8999,
    compareAtPrice: 10499,
    isNew: true,
    isFeatured: true,
    stock: 6,
    rating: 4.9,
    reviewCount: 47,
    tags: ["Court Ready", "Ankle Lock", "High Impact"],
    materials: "Full leather and molded synthetic composite, TPU midfoot shank, multi-directional herringbone tread",
    description: "Hardwood authority meets street dominance. The Hypercourt Pro Mid delivers lockdown containment and responsive impact dampening on indoor and blacktop courts.",
    details: [
      "Dynamic mid-cut collar with memory foam padding",
      "Rigid midfoot torsional shank plate",
      "Dual air-dampening units embedded in heel and forefoot",
      "High-grip rubber tuned for rapid lateral cuts"
    ],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
    colors: [
      {
        name: "Chicago Ember",
        hex: "#B71540",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Royal Navy & Silver",
        hex: "#1E3799",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-11",
    slug: "cally-vortex-knit-trainer",
    name: "Cally Vortex Knit Trainer",
    category: "women",
    subCategory: "running",
    price: 6799,
    compareAtPrice: 7999,
    isNew: false,
    isFeatured: true,
    stock: 11,
    rating: 4.8,
    reviewCount: 26,
    tags: ["Breathable", "Gym & Run", "Lightweight"],
    materials: "Recycled micro-knit mesh, sculpted phylon midsole, flex-groove crystal rubber pods",
    description: "Engineered specifically for versatile training sessions and morning sprints. Lightweight breathable upper stretches dynamically with your natural foot movement.",
    details: [
      "Sock-like collar for instant slip-on entry",
      "Reflective heel tab for dusk training visibility",
      "Ultra-flexible forefoot flex grooves",
      "Weight: 230g (UK 6)"
    ],
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    colors: [
      {
        name: "Dusty Rose & Chalk",
        hex: "#D4A5A5",
        images: [
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Charcoal Heather",
        hex: "#4A4A4A",
        images: [
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-12",
    slug: "cally-monolith-lux-leather",
    name: "Cally Monolith Lux Leather Sneaker",
    category: "unisex",
    subCategory: "streetwear",
    price: 11499,
    compareAtPrice: 13999,
    isNew: true,
    isFeatured: true,
    stock: 2,
    rating: 5.0,
    reviewCount: 16,
    tags: ["Luxury", "Full Grain", "Handcrafted", "Exclusive"],
    materials: "Premium vegetable-tanned Italian calfskin leather, calf leather lining, margom rubber outsole",
    description: "The crown jewel of our collection. Handcrafted in limited batches using full-grain vegetable-tanned leather that develops a rich, personalized patina over years of wear.",
    details: [
      "Fully leather lined interior for breathable luxury",
      "Signature debossed serial number at heel collar",
      "Italian Margom stitched cupsole",
      "Delivered in custom heavyweight magnetic collector box"
    ],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: [
      {
        name: "Cognac Tan",
        hex: "#8B4513",
        images: [
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Obsidian Black",
        hex: "#121212",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-13",
    slug: "cally-solis-mesh-breathable",
    name: "Cally Solis Ultra-Light Mesh",
    category: "women",
    subCategory: "running",
    price: 4799,
    compareAtPrice: 5699,
    isNew: false,
    isFeatured: false,
    stock: 15,
    rating: 4.6,
    reviewCount: 20,
    tags: ["Summer Ready", "Featherweight", "Daily Wear"],
    materials: "Engineered open-pore air mesh, compression EVA foam, high-flex outsole",
    description: "Designed for humid summer streets and high-pace commutes. The open-pore mesh upper maintains continuous ventilation while keeping your feet light and energized.",
    details: [
      "Maximum airflow open-mesh construction",
      "Soft padded heel counter to prevent blister friction",
      "Ultra-flexible split-sole geometry",
      "Machine washable on cold cycle"
    ],
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    colors: [
      {
        name: "Pure White & Sky",
        hex: "#F0F8FF",
        images: [
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-14",
    slug: "cally-hydro-cushion-tech-mule",
    name: "Cally Hydro Cushion Tech Mule",
    category: "unisex",
    subCategory: "slides",
    price: 3299,
    compareAtPrice: 3899,
    isNew: true,
    isFeatured: false,
    stock: 18,
    rating: 4.8,
    reviewCount: 24,
    tags: ["Tech Mule", "Slip-On", "Waterproof"],
    materials: "Closed-cell foam chassis, adjustable webbing lock strap with magnetic fidlock-style buckle",
    description: "The evolution of the slip-on. Engineered with a closed toe silhouette, side ventilation ports, and a tactical top strap for adjustable midfoot security.",
    details: [
      "Adjustable nylon utility strap with quick-release cinch",
      "Anatomical arch contour reduces plantar pressure",
      "Hydrophobic all-weather closed-cell foam",
      "Non-slip wet-traction lugged rubber pads"
    ],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: [
      {
        name: "Matte Olive",
        hex: "#3D4F38",
        images: [
          "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        name: "Dark Basalt",
        hex: "#222222",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-15",
    slug: "cally-eclipse-stealth-black",
    name: "Cally Eclipse Stealth Black",
    category: "men",
    subCategory: "sneakers",
    price: 7299,
    compareAtPrice: 8499,
    isNew: false,
    isFeatured: true,
    stock: 7,
    rating: 4.9,
    reviewCount: 63,
    tags: ["Triple Black", "Stealth", "Street Favorite"],
    materials: "Matte black synthetic leather, waterproof ripstop panels, pitch-black stealth midsole",
    description: "Unapologetic triple-black aesthetic. Clean, dark, and lethal styling engineered with tonal branding and indestructible matte overlays.",
    details: [
      "All-black tactical monochromatic finish",
      "Reflective tonal 3M heel accents",
      "High density foam collar for locked-in fit",
      "Reinforced rubber toe cap"
    ],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
    colors: [
      {
        name: "Triple Stealth Black",
        hex: "#0A0A0A",
        images: [
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "cw-prod-16",
    slug: "cally-nova-pastel-court",
    name: "Cally Nova Pastel Court",
    category: "women",
    subCategory: "sneakers",
    price: 5299,
    compareAtPrice: 6199,
    isNew: true,
    isFeatured: false,
    stock: 13,
    rating: 4.8,
    reviewCount: 18,
    tags: ["Pastel", "Fresh", "Court Classic"],
    materials: "Premium synthetic leather, soft suede pastel heel panel, rubber gum cupsole",
    description: "Subtle pastel color accents meet a timeless court shape. Clean white base accented by sage and soft lavender for a fresh street rotation.",
    details: [
      "Soft padded sockliner for stepped-in comfort",
      "Pastel suede overlay details on heel and tongue",
      "Flexible rubber cupsole with pivot circle",
      "Wipe-clean stain-resistant finish"
    ],
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    colors: [
      {
        name: "Sage Pastel & White",
        hex: "#9EAA96",
        images: [
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

import { localDb } from "@/lib/db";

export function getLiveProducts(): Product[] {
  if (typeof window !== "undefined") {
    return initialSeedProducts;
  }
  try {
    const state = localDb?.state;
    if (state && Array.isArray(state.products) && state.products.length > 0) {
      // Filter only PUBLISHED products for storefront (Section 3: DRAFT products never show on storefront)
      const published = state.products.filter((p: any) => p.status === "PUBLISHED");
      if (published.length > 0) {
        return published.map((p: any) => {
          const images = state.productImages
            .filter((img: any) => img.productId === p.id)
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
            .map((img: any) => img.url);

          const variants = state.productVariants.filter((v: any) => v.productId === p.id);
          const sizes = variants.map((v: any) => v.size);
          const stock = variants.reduce((sum: number, v: any) => sum + v.stock, 0);

          const pSections = state.productSections
            .filter((ps: any) => ps.productId === p.id)
            .map((ps: any) => state.sections.find((s: any) => s.id === ps.sectionId)?.slug)
            .filter(Boolean);

          const isMen = pSections.includes("men");
          const isWomen = pSections.includes("women");
          const category: "men" | "women" | "unisex" = isMen && !isWomen ? "men" : !isMen && isWomen ? "women" : "unisex";

          // Section 8 rule:
          // If isOnSale = false, display basePrice only, even if salePrice is set.
          const price = p.isOnSale && p.salePrice ? p.salePrice : p.basePrice;
          const compareAtPrice = p.isOnSale && p.salePrice ? p.basePrice : undefined;

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            category,
            subCategory: "sneakers",
            price,
            compareAtPrice,
            images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"],
            colors: [
              {
                name: "Obsidian Core",
                hex: "#161616",
                images: images,
              },
            ],
            sizes: sizes.length > 0 ? sizes : ["UK 7", "UK 8", "UK 9", "UK 10"],
            description: p.description,
            materials: p.materials,
            stock,
            isNew: p.isNewArrival,
            isFeatured: p.isFeatured,
            tags: [
              p.isOnSale ? "Sale" : "",
              p.isNewArrival ? "Drop 04" : "",
              p.isFeatured ? "Best Seller" : "",
              ...pSections.map((s: any) => s?.replace(/-/g, " ") || ""),
            ].filter(Boolean),
            details: [
              "Dynamic heel stabilizer clip for rotational lock-in",
              "Ergonomic dual-density anatomical footbed",
              p.materials || "Premium construction",
            ],
          };
        });
      }
    }
  } catch {
    // fallback to static seed array
  }
  return initialSeedProducts;
}

export const products: Product[] = new Proxy(initialSeedProducts, {
  get(target, prop, receiver) {
    const live = getLiveProducts();
    return Reflect.get(live, prop, receiver);
  },
});

export function getProductBySlug(slug: string): Product | undefined {
  const currentCatalog = getLiveProducts();
  return currentCatalog.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: "men" | "women" | "unisex" | "all"): Product[] {
  const currentCatalog = getLiveProducts();
  if (category === "all") return currentCatalog;
  return currentCatalog.filter((p) => p.category === category || p.category === "unisex");
}

export function getFeaturedProducts(): Product[] {
  const currentCatalog = getLiveProducts();
  return currentCatalog.filter((p) => p.isFeatured);
}

export function getNewArrivals(): Product[] {
  const currentCatalog = getLiveProducts();
  return currentCatalog.filter((p) => p.isNew || p.tags?.includes("Drop 04"));
}

export function getBestSellers(): Product[] {
  const currentCatalog = getLiveProducts();
  return currentCatalog.filter((p) => {
    const isNewArrival = p.isNew || p.tags?.includes("Drop 04");
    const isBestSeller = p.isFeatured || p.tags?.includes("Icon") || p.tags?.includes("Essential") || p.tags?.includes("Best Seller");
    return isBestSeller && !isNewArrival;
  });
}

export function getRelatedProducts(currentProductId: string, limit: number = 4): Product[] {
  const currentCatalog = getLiveProducts();
  const current = currentCatalog.find((p) => p.id === currentProductId);
  if (!current) return currentCatalog.slice(0, limit);
  return currentCatalog
    .filter((p) => p.id !== currentProductId && (p.category === current.category || p.subCategory === current.subCategory))
    .slice(0, limit);
}
