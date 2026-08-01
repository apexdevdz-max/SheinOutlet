"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Category, Banner, SiteSettings } from "@/lib/types";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";

/* ── Default banners matching the HeroCarousel ── */
const DEFAULT_BANNERS: Banner[] = [
  { id: "b1", image: "/images/hero/banner1.png", alt: "Nouvelle Collection — Jusqu'à -70%", href: "/categories", order: 1 },
  { id: "b2", image: "/images/hero/banner2.png", alt: "Édition Limitée — Jusqu'à -50%", href: "/?filter=promo", order: 2 },
  { id: "b3", image: "/images/hero/banner3.png", alt: "Streetwear Homme — Jusqu'à -60%", href: "/?cat=homme", order: 3 },
];

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: "213550000000",
  defaultShippingCost: 600,
  siteName: "SHEIN Outlet Algérie",
  siteDescription: "Mode à petits prix, livrée partout en Algérie.",
  contactEmail: "contact@shein-outlet.dz",
  contactPhone: "+213 5 50 00 00 00",
};

interface AdminState {
  /* ── Products ── */
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleStock: (id: string) => void;
  toggleFlashSale: (id: string) => void;
  toggleBestSeller: (id: string) => void;

  /* ── Categories ── */
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  /* ── Banners ── */
  banners: Banner[];
  addBanner: (banner: Banner) => void;
  updateBanner: (id: string, data: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  reorderBanners: (banners: Banner[]) => void;

  /* ── Settings ── */
  settings: SiteSettings;
  updateSettings: (data: Partial<SiteSettings>) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      /* ══════════════ PRODUCTS ══════════════ */
      products: [...MOCK_PRODUCTS],

      addProduct: (product) =>
        set((s) => ({ products: [product, ...s.products] })),

      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      toggleStock: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, stock: p.stock > 0 ? 0 : 50 } : p
          ),
        })),

      toggleFlashSale: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, is_flash_sale: !p.is_flash_sale } : p
          ),
        })),

      toggleBestSeller: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, is_best_seller: !p.is_best_seller } : p
          ),
        })),

      /* ══════════════ CATEGORIES ══════════════ */
      categories: [...MOCK_CATEGORIES],

      addCategory: (category) =>
        set((s) => ({ categories: [...s.categories, category] })),

      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      /* ══════════════ BANNERS ══════════════ */
      banners: [...DEFAULT_BANNERS],

      addBanner: (banner) =>
        set((s) => ({ banners: [...s.banners, banner] })),

      updateBanner: (id, data) =>
        set((s) => ({
          banners: s.banners.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        })),

      deleteBanner: (id) =>
        set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),

      reorderBanners: (banners) => set({ banners }),

      /* ══════════════ SETTINGS ══════════════ */
      settings: { ...DEFAULT_SETTINGS },

      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),
    }),
    {
      name: "shein-admin-store",
    }
  )
);
