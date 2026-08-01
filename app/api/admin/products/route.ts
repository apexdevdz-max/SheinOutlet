import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/products — List all products
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/products — Create a product
export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      price: body.price,
      old_price: body.old_price || null,
      images: body.images || [],
      category_id: body.category_id || null,
      sizes: body.sizes || [],
      colors: body.colors || [],
      is_flash_sale: body.is_flash_sale || false,
      is_best_seller: body.is_best_seller || false,
      stock: body.stock || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
