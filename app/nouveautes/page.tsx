import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/supabase-data";
import { HomeContent } from "@/components/HomeContent";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nouveautés — SHEIN Outlet Algérie",
};

export default async function NouveautesPage() {
  const [products, categories] = await Promise.all([
    getProducts({ limit: 200 }),
    getCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent
        initialProducts={products}
        initialCategories={categories}
        activeFilter="new"
      />
    </Suspense>
  );
}
