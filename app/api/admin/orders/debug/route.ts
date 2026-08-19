import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/admin/orders/debug — Diagnostic endpoint
 * Tests Supabase connectivity, RLS, and data presence
 */
export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Check env vars are set
  results.env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET (" + process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "...)" : "MISSING",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET (length: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")" : "MISSING",
  };

  // 2. Test raw orders query
  try {
    const { data, error, count, status, statusText } = await supabase
      .from("orders")
      .select("*", { count: "exact" });

    results.ordersQuery = {
      success: !error,
      httpStatus: status,
      httpStatusText: statusText,
      error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null,
      rowCount: data?.length ?? 0,
      exactCount: count,
      firstRow: data?.[0] ? { id: data[0].id, status: data[0].status, created_at: data[0].created_at } : null,
    };
  } catch (e) {
    results.ordersQuery = { success: false, exception: String(e) };
  }

  // 3. Test raw order_items query
  try {
    const { data, error, status } = await supabase
      .from("order_items")
      .select("*", { count: "exact" });

    results.orderItemsQuery = {
      success: !error,
      httpStatus: status,
      error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null,
      rowCount: data?.length ?? 0,
      firstRow: data?.[0] ? { id: data[0].id, order_id: data[0].order_id, product_name: data[0].product_name } : null,
    };
  } catch (e) {
    results.orderItemsQuery = { success: false, exception: String(e) };
  }

  // 4. Test a direct RPC or raw SQL (if available)
  try {
    const { data, error } = await supabase.rpc("", {});
    results.rpcTest = { note: "RPC test skipped (no function provided)", data, error: error?.message };
  } catch {
    results.rpcTest = { note: "RPC not available" };
  }

  // 5. Test insert + select (dry run — does NOT actually insert)
  results.diagnosis = [];
  if (results.ordersQuery && (results.ordersQuery as Record<string, unknown>).rowCount === 0) {
    const diag = results.diagnosis as string[];
    diag.push("NO ROWS in orders table. Either:");
    diag.push("  a) No orders have been placed yet (test by placing a test order)");
    diag.push("  b) RLS is enabled with no SELECT policy for anon role → rows exist but are invisible");
    diag.push("  c) The anon key points to a different Supabase project than where data lives");
    diag.push("");
    diag.push("FIX for RLS: In Supabase dashboard → Authentication → Policies:");
    diag.push("  CREATE POLICY \"Allow read access for orders\" ON orders FOR SELECT USING (true);");
    diag.push("  CREATE POLICY \"Allow read access for order_items\" ON order_items FOR SELECT USING (true);");
    diag.push("  Or disable RLS on these tables if this is an admin-only app.");
  }

  return NextResponse.json(results, { status: 200 });
}
