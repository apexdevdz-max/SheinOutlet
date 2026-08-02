import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// PUT /api/admin/products/bulk — Bulk update products
// Body: { ids: string[], action: "discount" | "set_price", value: number }
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { ids, action, value } = body as {
      ids: string[];
      action: "discount" | "set_price";
      value: number;
    };

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "Aucun produit sélectionné" }, { status: 400 });
    }
    if (!action || value === undefined) {
      return NextResponse.json({ error: "Action ou valeur manquante" }, { status: 400 });
    }

    // Fetch current products to compute new prices
    const { data: products, error: fetchErr } = await supabaseAdmin
      .from("products")
      .select("id, price, old_price")
      .in("id", ids);

    if (fetchErr) throw fetchErr;
    if (!products || products.length === 0) {
      return NextResponse.json({ error: "Produits introuvables" }, { status: 404 });
    }

    // Compute updates
    const updates = products.map((p) => {
      if (action === "discount") {
        // Apply -X% discount: old_price = current price, new price = price * (1 - value/100)
        const newPrice = Math.round(p.price * (1 - value / 100));
        return {
          id: p.id,
          old_price: p.price,
          price: Math.max(newPrice, 0),
        };
      } else {
        // set_price: force price to value, old_price = current price
        return {
          id: p.id,
          old_price: p.price,
          price: value,
        };
      }
    });

    // Batch update using individual updates (Supabase doesn't support bulk upsert on subset of columns easily)
    const results = await Promise.all(
      updates.map((u) =>
        supabaseAdmin
          .from("products")
          .update({ price: u.price, old_price: u.old_price })
          .eq("id", u.id)
          .select()
          .single()
      )
    );

    const updatedProducts = results
      .filter((r) => !r.error && r.data)
      .map((r) => r.data);

    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error("[bulk] Some updates failed:", errors.map((e) => e.error));
    }

    return NextResponse.json({
      updated: updatedProducts,
      count: updatedProducts.length,
    });
  } catch (err) {
    console.error("[bulk] Error:", err);
    return NextResponse.json({ error: "Erreur lors de la mise à jour en masse" }, { status: 500 });
  }
}
