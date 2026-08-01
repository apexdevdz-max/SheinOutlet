import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/banners
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("*")
    .order("order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/banners — Create a banner
export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("banners")
    .insert({
      image: body.image,
      alt: body.alt || "",
      href: body.href || "/",
      order: body.order || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/banners — Bulk update (reorder)
export async function PUT(req: Request) {
  const body = await req.json();

  // body is an array of banners with updated order
  if (Array.isArray(body)) {
    for (const banner of body) {
      await supabaseAdmin
        .from("banners")
        .update({ order: banner.order, image: banner.image, alt: banner.alt, href: banner.href })
        .eq("id", banner.id);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Expected array" }, { status: 400 });
}
