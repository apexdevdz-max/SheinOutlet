import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* GET /api/admin/orders — Fetch all orders with their items */
export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Fetch order items for all orders
    const orderIds = (orders || []).map((o: { id: string }) => o.id);

    let items: Record<string, unknown>[] = [];
    if (orderIds.length > 0) {
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) throw itemsError;
      items = orderItems || [];
    }

    // Attach items to each order
    const ordersWithItems = (orders || []).map((order: { id: string }) => ({
      ...order,
      items: items.filter((item: Record<string, unknown>) => item.order_id === order.id),
    }));

    return NextResponse.json(ordersWithItems);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return NextResponse.json([], { status: 500 });
  }
}
