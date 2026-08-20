import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/products — List all products j
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

  // Auto-deduplicate slug
  let slug = body.slug || "";
  if (slug) {
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("slug")
      .like("slug", `${slug}%`);

    if (existing && existing.length > 0) {
      const existingSlugs = new Set(existing.map((p: { slug: string }) => p.slug));
      if (existingSlugs.has(slug)) {
        let i = 2;
        while (existingSlugs.has(`${slug}-${i}`)) i++;
        slug = `${slug}-${i}`;
      }
    }
  }

  // ── Guard-rail: validate & normalize images before saving ──
  let images = body.images || [];
  if (Array.isArray(images)) {
    images = images.map((img: unknown) => {
      if (typeof img === "string") return { url: img, colorTags: [] };
      if (typeof img === "object" && img !== null) {
        const obj = img as Record<string, unknown>;
        return {
          url: typeof obj.url === "string" ? obj.url : "",
          colorTags: Array.isArray(obj.colorTags) ? obj.colorTags : [],
        };
      }
      return { url: "", colorTags: [] };
    });
    const emptyUrls = images.filter((img: { url: string }) => !img.url);
    if (emptyUrls.length > 0) {
      return NextResponse.json(
        { error: `Impossible de créer : ${emptyUrls.length} image(s) ont une URL vide.` },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: body.name,
      slug,
      description: body.description || "",
      price: body.price,
      old_price: body.old_price || null,
      images,
      category_id: body.category_id || null,
      attributes: body.attributes || [],
      sizes: body.sizes || [],
      sizes_label: body.sizes_label || "Taille",
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
