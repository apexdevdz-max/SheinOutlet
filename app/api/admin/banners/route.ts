import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/banners — All banners (including inactive) for admin
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/banners — Create a banner
export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("banners")
    .insert({
      image_url: body.image_url || "",
      title: body.title || "",
      subtitle: body.subtitle || "",
      href: body.href || "/",
      is_active: body.is_active ?? true,
      display_order: body.display_order || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/banners — Bulk update (reorder)
export async function PUT(req: Request) {
  const body = await req.json();

  if (Array.isArray(body)) {
    for (const banner of body) {
      await supabaseAdmin
        .from("banners")
        .update({
          display_order: banner.display_order,
          image_url: banner.image_url,
          title: banner.title,
          subtitle: banner.subtitle,
          href: banner.href,
          is_active: banner.is_active,
        })
        .eq("id", banner.id);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Expected array" }, { status: 400 });
}
