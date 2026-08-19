import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* POST /api/orders — Create a new order from client checkout */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_first_name,
      customer_last_name,
      customer_phone,
      wilaya,
      commune,
      address,
      notes,
      total_amount,
      shipping_cost,
      items,
    } = body;

    // Validate required fields
    if (!customer_first_name || !customer_last_name || !customer_phone || !wilaya || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_first_name,
        customer_last_name,
        customer_phone,
        wilaya,
        commune: commune || "",
        address,
        notes: notes || "",
        total_amount,
        shipping_cost,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    if (items && items.length > 0) {
      const orderItems = items.map((item: {
        product_id: string;
        product_name: string;
        product_image: string;
        quantity: number;
        size: string;
        color: string;
        unit_price: number;
      }) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image || "",
        quantity: item.quantity,
        size: item.size || "",
        color: item.color || "",
        unit_price: item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("Error creating order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
