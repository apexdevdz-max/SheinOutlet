import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/products/[id] — Update a product
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  // ── Guard-rail: validate images before saving ──
  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      return NextResponse.json(
        { error: "Le champ 'images' doit être un tableau." },
        { status: 400 }
      );
    }
    // Normalize: ensure every entry is {url, colorTags}
    body.images = body.images.map((img: unknown) => {
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
    // Block save if any image has empty url
    const emptyUrls = body.images.filter((img: { url: string }) => !img.url);
    if (emptyUrls.length > 0) {
      return NextResponse.json(
        { error: `Impossible d'enregistrer : ${emptyUrls.length} image(s) ont une URL vide. Sauvegarde bloquée pour protéger les données.` },
        { status: 400 }
      );
    }
  }

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
