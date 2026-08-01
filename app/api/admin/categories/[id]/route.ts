import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/categories/[id]
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/categories/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
