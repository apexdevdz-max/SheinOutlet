import { createClient } from "@supabase/supabase-js";
import type { Product, Category } from "@/lib/types";

// ── Server-side Supabase client (uses anon key, read-only) ──
// This file MUST only be imported in Server Components or API routes.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const isDev = process.env.NODE_ENV === "development";

// ── Fallback imports for development mode ──
async function getMockFallback() {
  if (!isDev) return null;
  const mock = await import("@/lib/mock-data");
  return mock;
}

// ── Column selections (never select *) ──
const PRODUCT_LIST_COLUMNS =
  "id, name, slug, price, old_price, images, category_id, attributes, sizes, sizes_label, colors, is_flash_sale, is_best_seller, stock, created_at";
const PRODUCT_DETAIL_COLUMNS =
  "id, name, slug, description, price, old_price, images, category_id, attributes, sizes, sizes_label, colors, is_flash_sale, is_best_seller, stock, created_at";
const CATEGORY_COLUMNS =
  "id, name, slug, image_url, parent_id, show_in_header, display_order";

// ──────────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .order("display_order", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) return data as Category[];

    // Dev fallback
    const mock = await getMockFallback();
    if (mock) return mock.MOCK_CATEGORIES;
    return [];
  } catch (err) {
    console.error("[supabase-data] getCategories error:", err);
    const mock = await getMockFallback();
    if (mock) return mock.MOCK_CATEGORIES;
    return [];
  }
}

export async function getParentCategories(): Promise<Category[]> {
  const all = await getCategories();
  return all.filter((c) => !c.parent_id);
}

export async function getSubCategories(parentId: string): Promise<Category[]> {
  const all = await getCategories();
  return all.filter((c) => c.parent_id === parentId);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) || null;
}

/**
 * Get all category IDs for a parent slug (parent + sub-categories).
 * E.g. "femme" → [parentId, ...childIds]
 */
export async function getCategoryIdsBySlug(slug: string): Promise<string[]> {
  const all = await getCategories();
  const parent = all.find((c) => c.slug === slug && !c.parent_id);
  if (!parent) return [];
  const childIds = all.filter((c) => c.parent_id === parent.id).map((c) => c.id);
  return [parent.id, ...childIds];
}

// ──────────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────────

interface GetProductsOptions {
  categorySlug?: string;
  flashSale?: boolean;
  bestSeller?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "price";
  ascending?: boolean;
}

export async function getProducts(opts: GetProductsOptions = {}): Promise<Product[]> {
  const {
    categorySlug,
    flashSale,
    bestSeller,
    limit = 30,
    offset = 0,
    orderBy = "created_at",
    ascending = false,
  } = opts;

  try {
    let query = supabase
      .from("products")
      .select(PRODUCT_LIST_COLUMNS)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    // Filter by category slug (resolve to IDs)
    if (categorySlug) {
      const catIds = await getCategoryIdsBySlug(categorySlug);
      if (catIds.length > 0) {
        query = query.in("category_id", catIds);
      }
    }

    if (flashSale !== undefined) {
      query = query.eq("is_flash_sale", flashSale);
    }

    if (bestSeller !== undefined) {
      query = query.eq("is_best_seller", bestSeller);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (data && data.length > 0) return data as Product[];

    // Dev fallback
    const mock = await getMockFallback();
    if (mock) {
      let items = [...mock.MOCK_PRODUCTS];
      if (categorySlug) items = mock.filterProductsByCategory(categorySlug);
      if (flashSale !== undefined) items = items.filter((p) => p.is_flash_sale === flashSale);
      if (bestSeller !== undefined) items = items.filter((p) => p.is_best_seller === bestSeller);
      return items.slice(offset, offset + limit);
    }
    return [];
  } catch (err) {
    console.error("[supabase-data] getProducts error:", err);
    const mock = await getMockFallback();
    if (mock) {
      let items = [...mock.MOCK_PRODUCTS];
      if (categorySlug) items = mock.filterProductsByCategory(categorySlug);
      if (flashSale !== undefined) items = items.filter((p) => p.is_flash_sale === flashSale);
      if (bestSeller !== undefined) items = items.filter((p) => p.is_best_seller === bestSeller);
      return items.slice(offset, offset + limit);
    }
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_COLUMNS)
      .eq("slug", slug)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    if (data) return data as Product;

    // Dev fallback
    const mock = await getMockFallback();
    if (mock) return mock.getMockProductBySlug(slug) || null;
    return null;
  } catch (err) {
    console.error("[supabase-data] getProductBySlug error:", err);
    const mock = await getMockFallback();
    if (mock) return mock.getMockProductBySlug(slug) || null;
    return null;
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("slug");

    if (error) throw error;
    if (data && data.length > 0) return data.map((p) => p.slug);

    // Dev fallback
    const mock = await getMockFallback();
    if (mock) return mock.MOCK_PRODUCTS.map((p) => p.slug);
    return [];
  } catch (err) {
    console.error("[supabase-data] getAllProductSlugs error:", err);
    const mock = await getMockFallback();
    if (mock) return mock.MOCK_PRODUCTS.map((p) => p.slug);
    return [];
  }
}

export async function getRelatedProducts(product: { id: string; category_id: string | null }, limit = 8): Promise<Product[]> {
  if (!product.category_id) return [];
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_COLUMNS)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Product[]) || [];
  } catch (err) {
    console.error("[supabase-data] getRelatedProducts error:", err);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  return getProducts({ limit: 1000 });
}

// ──────────────────────────────────────────────
// SEARCH INDEX (for static generation at build)
// ──────────────────────────────────────────────

export interface SearchIndexItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  thumbnail: string;
  category_id: string | null;
}

export async function getSearchIndex(): Promise<SearchIndexItem[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, old_price, images, category_id")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        old_price: p.old_price,
        thumbnail: p.images?.[0] || "",
        category_id: p.category_id,
      }));
    }

    const mock = await getMockFallback();
    if (mock) {
      return mock.MOCK_PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        old_price: p.old_price,
        thumbnail: p.images?.[0] || "",
        category_id: p.category_id,
      }));
    }
    return [];
  } catch (err) {
    console.error("[supabase-data] getSearchIndex error:", err);
    return [];
  }
}
