import { NextResponse } from "next/server";
import { getCategories } from "@/lib/supabase-data";

// GET /api/categories — Public read-only category listing
export async function GET() {
  const data = await getCategories();
  return NextResponse.json(data);
}
