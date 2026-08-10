import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/category-templates?category_id=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category_id");

  if (!categoryId) {
    return NextResponse.json({ error: "category_id is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("category_attribute_templates")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/category-templates — Create a template
export async function POST(req: Request) {
  const body = await req.json();

  if (!body.category_id || !body.attribute_name) {
    return NextResponse.json({ error: "category_id and attribute_name are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("category_attribute_templates")
    .insert({
      category_id: body.category_id,
      attribute_name: body.attribute_name.trim(),
      attribute_values: body.attribute_values || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/admin/category-templates?id=xxx
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("category_attribute_templates")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PUT /api/admin/category-templates — Update a template
export async function PUT(req: Request) {
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: any = {};
  if (body.attribute_name !== undefined) updates.attribute_name = body.attribute_name.trim();
  if (body.attribute_values !== undefined) updates.attribute_values = body.attribute_values;

  const { data, error } = await supabaseAdmin
    .from("category_attribute_templates")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
