import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/banners — Public: fetch active banners for the carousel
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
