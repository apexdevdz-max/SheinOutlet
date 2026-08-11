import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/flash-sales/[id] — Update a campaign
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  // Deactivate all other campaigns if this one is being activated
  if (body.is_active) {
    await supabaseAdmin.from("flash_sales").update({ is_active: false }).neq("id", id);
  }

  const { data, error } = await supabaseAdmin
    .from("flash_sales")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/flash-sales/[id] — Delete a campaign
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("flash_sales")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
