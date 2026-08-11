import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/flash-sale — Public: get active campaign + flash products
export async function GET() {
  // Get the active campaign
  const { data: campaign } = await supabaseAdmin
    .from("flash_sales")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!campaign) {
    return NextResponse.json({ campaign: null, products: [] });
  }

  // Check if campaign has expired
  if (new Date(campaign.end_date) <= new Date()) {
    return NextResponse.json({ campaign: null, products: [] });
  }

  // Get flash sale products
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_flash_sale", true)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    campaign,
    products: products || [],
  });
}
