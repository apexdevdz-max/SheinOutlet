import type { Product, Category } from "@/lib/types";

// Demo categories
export const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "FEMME", slug: "femme", image_url: "/images/cat-femme.jpg", parent_id: null, display_order: 1 },
  { id: "2", name: "HOMME", slug: "homme", image_url: "/images/cat-homme.jpg", parent_id: null, display_order: 2 },
  { id: "3", name: "CHAUSSURES", slug: "chaussures", image_url: "/images/cat-chaussures.jpg", parent_id: null, display_order: 3 },
  { id: "4", name: "SACS & ACCESSOIRES", slug: "sacs-accessoires", image_url: "/images/cat-sacs.jpg", parent_id: null, display_order: 4 },
  { id: "5", name: "Robes", slug: "robes", image_url: "/images/sub-robes.jpg", parent_id: "1", display_order: 1 },
  { id: "6", name: "Tops", slug: "tops", image_url: "/images/sub-tops.jpg", parent_id: "1", display_order: 2 },
  { id: "7", name: "Pantalons", slug: "pantalons", image_url: "/images/sub-pantalons.jpg", parent_id: "1", display_order: 3 },
  { id: "8", name: "Jupes", slug: "jupes", image_url: "/images/sub-jupes.jpg", parent_id: "1", display_order: 4 },
  { id: "9", name: "Lingerie & Bain", slug: "lingerie-bain", image_url: "/images/sub-lingerie.jpg", parent_id: "1", display_order: 5 },
  { id: "10", name: "Bijoux", slug: "bijoux", image_url: "/images/sub-bijoux.jpg", parent_id: "1", display_order: 6 },
  { id: "11", name: "T-Shirts", slug: "tshirts-homme", image_url: "/images/sub-tshirts.jpg", parent_id: "2", display_order: 1 },
  { id: "12", name: "Pantalons", slug: "pantalons-homme", image_url: "/images/sub-pantalons-h.jpg", parent_id: "2", display_order: 2 },
  { id: "13", name: "Vestes", slug: "vestes-homme", image_url: "/images/sub-vestes.jpg", parent_id: "2", display_order: 3 },
  { id: "14", name: "Sneakers", slug: "sneakers", image_url: "/images/sub-sneakers.jpg", parent_id: "3", display_order: 1 },
  { id: "15", name: "Talons", slug: "talons", image_url: "/images/sub-talons.jpg", parent_id: "3", display_order: 2 },
  { id: "16", name: "Sacs à main", slug: "sacs-a-main", image_url: "/images/sub-sacs.jpg", parent_id: "4", display_order: 1 },
  { id: "17", name: "Lunettes", slug: "lunettes", image_url: "/images/sub-lunettes.jpg", parent_id: "4", display_order: 2 },
];

// Demo products
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Robe Élégante Rose Pastel",
    slug: "robe-elegante-rose-pastel",
    description: "Robe élégante en tissu fluide, coupe ajustée avec finitions soignées. Parfaite pour les occasions spéciales et les soirées.",
    price: 1800,
    old_price: 3000,
    images: ["/images/products/robe-rose-1.jpg", "/images/products/robe-rose-2.jpg"],
    category_id: "5",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rose", "Noir", "Blanc"],
    is_flash_sale: true,
    is_best_seller: true,
    stock: 45,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "p2",
    name: "Lunettes de Soleil Aviateur",
    slug: "lunettes-soleil-aviateur",
    description: "Lunettes de soleil style aviateur avec verres polarisés et monture dorée légère. Protection UV400.",
    price: 350,
    old_price: 700,
    images: ["/images/products/lunettes-1.jpg", "/images/products/lunettes-2.jpg"],
    category_id: "17",
    sizes: ["Unique"],
    colors: ["Doré", "Argenté", "Noir"],
    is_flash_sale: true,
    is_best_seller: true,
    stock: 120,
    created_at: "2025-01-14T10:00:00Z",
  },
  {
    id: "p3",
    name: "Sac à Main Chaîne Dorée",
    slug: "sac-main-chaine-doree",
    description: "Sac à main élégant avec chaîne dorée, cuir synthétique premium. Compartiment principal spacieux avec poche intérieure zippée.",
    price: 1400,
    old_price: 2000,
    images: ["/images/products/sac-chaine-1.jpg", "/images/products/sac-chaine-2.jpg"],
    category_id: "16",
    sizes: ["Unique"],
    colors: ["Rose", "Noir", "Beige"],
    is_flash_sale: true,
    is_best_seller: true,
    stock: 30,
    created_at: "2025-01-13T10:00:00Z",
  },
  {
    id: "p4",
    name: "Sneakers Blanches Classic",
    slug: "sneakers-blanches-classic",
    description: "Baskets blanches classiques en cuir synthétique. Semelle confortable et design intemporel qui s'accorde avec tout.",
    price: 1950,
    old_price: 3000,
    images: ["/images/products/sneakers-1.jpg", "/images/products/sneakers-2.jpg"],
    category_id: "14",
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    colors: ["Blanc", "Blanc/Rose"],
    is_flash_sale: true,
    is_best_seller: true,
    stock: 60,
    created_at: "2025-01-12T10:00:00Z",
  },
  {
    id: "p5",
    name: "Top Crop Rose Tendance",
    slug: "top-crop-rose-tendance",
    description: "Crop top tendance en coton doux. Coupe ajustée, idéal pour un look décontracté et stylé.",
    price: 650,
    old_price: 1200,
    images: ["/images/products/crop-top-1.jpg", "/images/products/crop-top-2.jpg"],
    category_id: "6",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Rose", "Blanc", "Noir"],
    is_flash_sale: false,
    is_best_seller: true,
    stock: 80,
    created_at: "2025-01-11T10:00:00Z",
  },
  {
    id: "p6",
    name: "Jupe Plissée Mi-Longue",
    slug: "jupe-plissee-mi-longue",
    description: "Jupe plissée élégante mi-longue, taille élastique confortable. Tissu fluide et léger.",
    price: 1200,
    old_price: 1800,
    images: ["/images/products/jupe-1.jpg", "/images/products/jupe-2.jpg"],
    category_id: "8",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rose", "Noir", "Bleu Marine"],
    is_flash_sale: false,
    is_best_seller: true,
    stock: 55,
    created_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "p7",
    name: "Veste Jean Oversize",
    slug: "veste-jean-oversize",
    description: "Veste en jean oversize délavée. Look décontracté avec poches avant et boutons métalliques.",
    price: 2500,
    old_price: 4000,
    images: ["/images/products/veste-jean-1.jpg", "/images/products/veste-jean-2.jpg"],
    category_id: "13",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Bleu Clair", "Bleu Foncé"],
    is_flash_sale: true,
    is_best_seller: false,
    stock: 25,
    created_at: "2025-01-09T10:00:00Z",
  },
  {
    id: "p8",
    name: "Ensemble Jogging Femme",
    slug: "ensemble-jogging-femme",
    description: "Ensemble jogging confortable en coton mélangé. Sweat à capuche et pantalon assorti.",
    price: 2200,
    old_price: 3500,
    images: ["/images/products/jogging-1.jpg", "/images/products/jogging-2.jpg"],
    category_id: "7",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rose", "Gris", "Noir"],
    is_flash_sale: false,
    is_best_seller: true,
    stock: 35,
    created_at: "2025-01-08T10:00:00Z",
  },
  {
    id: "p9",
    name: "T-Shirt Imprimé Homme",
    slug: "tshirt-imprime-homme",
    description: "T-shirt en coton 100% avec impression graphique tendance. Coupe regular fit.",
    price: 500,
    old_price: 900,
    images: ["/images/products/tshirt-h-1.jpg", "/images/products/tshirt-h-2.jpg"],
    category_id: "11",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blanc", "Noir", "Gris"],
    is_flash_sale: true,
    is_best_seller: false,
    stock: 100,
    created_at: "2025-01-07T10:00:00Z",
  },
  {
    id: "p10",
    name: "Escarpins Talons Nude",
    slug: "escarpins-talons-nude",
    description: "Escarpins à talons hauts (8cm) en similicuir nude. Bout pointu élégant, semelle intérieure rembourrée.",
    price: 1500,
    old_price: 2600,
    images: ["/images/products/escarpins-1.jpg", "/images/products/escarpins-2.jpg"],
    category_id: "15",
    sizes: ["36", "37", "38", "39", "40"],
    colors: ["Nude", "Noir", "Rouge"],
    is_flash_sale: false,
    is_best_seller: true,
    stock: 40,
    created_at: "2025-01-06T10:00:00Z",
  },
  {
    id: "p11",
    name: "Bague Papillon Cristal",
    slug: "bague-papillon-cristal",
    description: "Bague ajustable en alliage doré avec papillon en cristal. Bijou délicat et féminin.",
    price: 250,
    old_price: 500,
    images: ["/images/products/bague-1.jpg", "/images/products/bague-2.jpg"],
    category_id: "10",
    sizes: ["Unique"],
    colors: ["Doré", "Argenté"],
    is_flash_sale: true,
    is_best_seller: false,
    stock: 200,
    created_at: "2025-01-05T10:00:00Z",
  },
  {
    id: "p12",
    name: "Pantalon Cargo Kaki Homme",
    slug: "pantalon-cargo-kaki-homme",
    description: "Pantalon cargo en toile robuste avec poches latérales. Coupe décontractée et confortable.",
    price: 1800,
    old_price: 2800,
    images: ["/images/products/cargo-1.jpg", "/images/products/cargo-2.jpg"],
    category_id: "12",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Kaki", "Noir", "Beige"],
    is_flash_sale: false,
    is_best_seller: false,
    stock: 45,
    created_at: "2025-01-04T10:00:00Z",
  },
];

export function getMockProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getMockFlashSaleProducts(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.is_flash_sale);
}

export function getMockBestSellers(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.is_best_seller);
}

export function getParentCategories(): Category[] {
  return MOCK_CATEGORIES.filter((c) => c.parent_id === null);
}

export function getSubCategories(parentId: string): Category[] {
  return MOCK_CATEGORIES.filter((c) => c.parent_id === parentId);
}

export function searchMockProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}
