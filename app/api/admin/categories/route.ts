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

// POST /api/admin/categories — Create a category (+ optional batch subcategories)
export async function POST(req: Request) {
  const body = await req.json();

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Create the parent/main category
  const { data: category, error } = await supabaseAdmin
    .from("categories")
    .insert({
      name: body.name,
      slug,
      image_url: body.image_url || "",
      parent_id: body.parent_id || null,
      show_in_header: body.show_in_header ?? true,
      display_order: body.display_order || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Batch-insert subcategories if provided
  const subcategories: string[] = body.subcategories || [];
  const createdSubs: any[] = [];

  if (subcategories.length > 0 && category) {
    const subInserts = subcategories
      .filter((name: string) => name.trim())
      .map((name: string, i: number) => ({
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        image_url: "",
        parent_id: category.id,
        show_in_header: false,
        display_order: i,
      }));

    if (subInserts.length > 0) {
      const { data: subs, error: subError } = await supabaseAdmin
        .from("categories")
        .insert(subInserts)
        .select();

      if (subError) {
        console.error("[categories POST] sub-insert error:", subError.message);
      } else if (subs) {
        createdSubs.push(...subs);
      }
    }
  }

  return NextResponse.json({ category, subcategories: createdSubs }, { status: 201 });
}
