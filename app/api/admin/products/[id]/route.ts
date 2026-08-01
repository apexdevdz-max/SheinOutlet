import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/products/[id] — Update a product
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/products/[id] — Delete a product
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
