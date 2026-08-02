"use client";

import { create } from "zustand";
import type { Product, Category, Banner, SiteSettings } from "@/lib/types";

/* ── Default settings (used before fetch completes) ── */
const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: "213550000000",
  defaultShippingCost: 600,
  siteName: "SHEIN Outlet Algérie",
  siteDescription: "Mode à petits prix, livrée partout en Algérie.",
  contactEmail: "contact@shein-outlet.dz",
  contactPhone: "+213 5 50 00 00 00",
};

interface AdminState {
  /* ── Data ── */
  products: Product[];
  categories: Category[];
  banners: Banner[];
  settings: SiteSettings;

  /* ── Loading states ── */
  loading: boolean;
  error: string | null;

  /* ── Init (fetch from Supabase via API) ── */
  fetchAll: () => Promise<void>;

  /* ── Products ── */
  addProduct: (data: Omit<Product, "id" | "created_at">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleStock: (id: string) => Promise<void>;
  toggleFlashSale: (id: string) => Promise<void>;
  toggleBestSeller: (id: string) => Promise<void>;

  /* ── Bulk Actions ── */
  bulkDiscount: (ids: string[], percent: number) => Promise<void>;
  bulkSetPrice: (ids: string[], price: number) => Promise<void>;

  /* ── Categories ── */
  addCategory: (data: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  /* ── Banners ── */
  addBanner: (data: Omit<Banner, "id">) => Promise<void>;
  updateBanner: (id: string, data: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  reorderBanners: (banners: Banner[]) => Promise<void>;

  /* ── Settings ── */
  updateSettings: (data: Partial<SiteSettings>) => void;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  /* ══════════════ DATA ══════════════ */
  products: [],
  categories: [],
  banners: [],
  settings: { ...DEFAULT_SETTINGS },
  loading: false,
  error: null,

  /* ══════════════ FETCH ALL FROM SUPABASE ══════════════ */
  fetchAll: async () => {
    if (get().loading) return; // prevent double-fetch
    set({ loading: true, error: null });

    try {
      const [productsRes, categoriesRes, bannersRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/banners"),
      ]);

      const [products, categories, banners] = await Promise.all([
        productsRes.ok ? productsRes.json() : [],
        categoriesRes.ok ? categoriesRes.json() : [],
        bannersRes.ok ? bannersRes.json() : [],
      ]);

      set({
        products: Array.isArray(products) ? products : [],
        categories: Array.isArray(categories) ? categories : [],
        banners: Array.isArray(banners) ? banners : [],
        loading: false,
      });
    } catch (err) {
      console.error("[AdminStore] fetchAll error:", err);
      set({ error: "Erreur de chargement des données", loading: false });
    }
  },

  /* ══════════════ PRODUCTS ══════════════ */
  addProduct: async (data) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const product = await res.json();
      set((s) => ({ products: [product, ...s.products] }));
    } catch (err) {
      console.error("[AdminStore] addProduct error:", err);
      set({ error: "Erreur lors de l'ajout du produit" });
    }
  },

  updateProduct: async (id, data) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      set((s) => ({
        products: s.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
      }));
    } catch (err) {
      console.error("[AdminStore] updateProduct error:", err);
      set({ error: "Erreur lors de la mise à jour" });
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    } catch (err) {
      console.error("[AdminStore] deleteProduct error:", err);
      set({ error: "Erreur lors de la suppression" });
    }
  },

  toggleStock: async (id) => {
    const product = get().products.find((p) => p.id === id);
    if (!product) return;
    const newStock = product.stock > 0 ? 0 : 50;
    await get().updateProduct(id, { stock: newStock });
  },

  toggleFlashSale: async (id) => {
    const product = get().products.find((p) => p.id === id);
    if (!product) return;
    await get().updateProduct(id, { is_flash_sale: !product.is_flash_sale });
  },

  toggleBestSeller: async (id) => {
    const product = get().products.find((p) => p.id === id);
    if (!product) return;
    await get().updateProduct(id, { is_best_seller: !product.is_best_seller });
  },

  /* ══════════════ BULK ACTIONS ══════════════ */
  bulkDiscount: async (ids, percent) => {
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "discount", value: percent }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { updated } = await res.json();
      if (Array.isArray(updated)) {
        set((s) => ({
          products: s.products.map((p) => {
            const u = updated.find((up: any) => up.id === p.id);
            return u ? { ...p, ...u } : p;
          }),
        }));
      }
    } catch (err) {
      console.error("[AdminStore] bulkDiscount error:", err);
      set({ error: "Erreur lors de la réduction en masse" });
    }
  },

  bulkSetPrice: async (ids, price) => {
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "set_price", value: price }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { updated } = await res.json();
      if (Array.isArray(updated)) {
        set((s) => ({
          products: s.products.map((p) => {
            const u = updated.find((up: any) => up.id === p.id);
            return u ? { ...p, ...u } : p;
          }),
        }));
      }
    } catch (err) {
      console.error("[AdminStore] bulkSetPrice error:", err);
      set({ error: "Erreur lors du changement de prix en masse" });
    }
  },

  /* ══════════════ CATEGORIES ══════════════ */
  addCategory: async (data) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const category = await res.json();
      set((s) => ({ categories: [...s.categories, category] }));
    } catch (err) {
      console.error("[AdminStore] addCategory error:", err);
      set({ error: "Erreur lors de l'ajout de la catégorie" });
    }
  },

  updateCategory: async (id, data) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? { ...c, ...updated } : c)),
      }));
    } catch (err) {
      console.error("[AdminStore] updateCategory error:", err);
      set({ error: "Erreur lors de la mise à jour" });
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
    } catch (err) {
      console.error("[AdminStore] deleteCategory error:", err);
      set({ error: "Erreur lors de la suppression" });
    }
  },

  /* ══════════════ BANNERS ══════════════ */
  addBanner: async (data) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const banner = await res.json();
      set((s) => ({ banners: [...s.banners, banner] }));
    } catch (err) {
      console.error("[AdminStore] addBanner error:", err);
      set({ error: "Erreur lors de l'ajout de la bannière" });
    }
  },

  updateBanner: async (id, data) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      set((s) => ({
        banners: s.banners.map((b) => (b.id === id ? { ...b, ...updated } : b)),
      }));
    } catch (err) {
      console.error("[AdminStore] updateBanner error:", err);
      set({ error: "Erreur lors de la mise à jour" });
    }
  },

  deleteBanner: async (id) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      set((s) => ({ banners: s.banners.filter((b) => b.id !== id) }));
    } catch (err) {
      console.error("[AdminStore] deleteBanner error:", err);
      set({ error: "Erreur lors de la suppression" });
    }
  },

  reorderBanners: async (banners) => {
    // Optimistic update
    set({ banners });
    try {
      await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banners),
      });
    } catch (err) {
      console.error("[AdminStore] reorderBanners error:", err);
    }
  },

  /* ══════════════ SETTINGS ══════════════ */
  updateSettings: (data) =>
    set((s) => ({ settings: { ...s.settings, ...data } })),
}));
