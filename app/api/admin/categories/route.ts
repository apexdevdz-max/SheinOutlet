import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/categories — List all categories
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/categories — Create a category
export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      name: body.name,
      slug: body.slug,
      image_url: body.image_url || "",
      parent_id: body.parent_id || null,
      display_order: body.display_order || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
