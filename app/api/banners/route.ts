import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/banners — Public: fetch active banners for the carousel
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("id, title, subtitle, image_url, href, is_active, display_order, show_text")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
    },
  });
}
