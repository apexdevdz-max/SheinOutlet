/**
 * Generate search-index.json at build time
 * 
 * This script fetches all products from Supabase and writes a lightweight
 * JSON index to public/search-index.json for client-side search.
 * 
 * IMPORTANT: This file is ONLY regenerated at build time.
 * On Netlify (read-only filesystem in serverless), it cannot be updated
 * at runtime. To refresh after product changes, trigger a Netlify rebuild
 * via the build hook (see /api/revalidate).
 * 
 * Run: npx tsx scripts/generate-search-index.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function generate() {
  let items: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    old_price: number | null;
    thumbnail: string;
    category_id: string | null;
  }> = [];

  if (supabaseUrl && supabaseKey) {
    console.log("[search-index] Fetching from Supabase...");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, old_price, images, category_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[search-index] Supabase error:", error.message);
    } else if (data && data.length > 0) {
      items = data.map((p: { id: string; name: string; slug: string; price: number; old_price: number | null; images: string[]; category_id: string }) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        old_price: p.old_price,
        thumbnail: p.images?.[0] || "",
        category_id: p.category_id,
      }));
      console.log(`[search-index] Found ${items.length} products in Supabase`);
    }
  }

  // Fallback to mock data if Supabase is empty or unavailable
  if (items.length === 0) {
    console.log("[search-index] Using mock data fallback...");
    // Dynamic import of mock data
    const mockPath = path.resolve(__dirname, "../lib/mock-data.ts");
    
    // Since we can't import TS directly, use a simplified approach
    // In practice, tsx handles this, but let's be safe
    try {
      const { MOCK_PRODUCTS } = await import("../lib/mock-data");
      items = MOCK_PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        old_price: p.old_price,
        thumbnail: (typeof p.images?.[0] === "string" ? p.images[0] : p.images?.[0]?.url) || "",
        category_id: p.category_id,
      }));
      console.log(`[search-index] Loaded ${items.length} products from mock data`);
    } catch {
      console.warn("[search-index] Could not import mock data, writing empty index");
    }
  }

  const outPath = path.resolve(__dirname, "../public/search-index.json");
  fs.writeFileSync(outPath, JSON.stringify(items, null, 0));
  console.log(`[search-index] Written ${items.length} items to ${outPath}`);
}

generate().catch(console.error);
