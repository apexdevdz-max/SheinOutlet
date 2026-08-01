import { NextResponse } from "next/server";
import { getProducts } from "@/lib/supabase-data";

// GET /api/products — Public read-only product listing
// Query params: ?flash_sale=true, ?best_seller=true, ?category=slug, ?limit=30
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const opts: Parameters<typeof getProducts>[0] = {};

  const cat = searchParams.get("category");
  if (cat) opts.categorySlug = cat;

  const flash = searchParams.get("flash_sale");
  if (flash === "true") opts.flashSale = true;

  const best = searchParams.get("best_seller");
  if (best === "true") opts.bestSeller = true;

  const limit = searchParams.get("limit");
  if (limit) opts.limit = parseInt(limit, 10);

  const data = await getProducts(opts);
  return NextResponse.json(data);
}
