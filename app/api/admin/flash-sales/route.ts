import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/flash-sales — List all flash sale campaigns
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("flash_sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/flash-sales — Create a new campaign
export async function POST(req: Request) {
  const body = await req.json();

  // Deactivate all other campaigns if this one is active
  if (body.is_active) {
    await supabaseAdmin.from("flash_sales").update({ is_active: false }).neq("id", "none");
  }

  const { data, error } = await supabaseAdmin
    .from("flash_sales")
    .insert({
      title: body.title || "FLASH SALE",
      subtitle: body.subtitle || "Offres limitées !",
      end_date: body.end_date,
      is_active: body.is_active ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
