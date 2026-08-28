import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/supabase-data";
import { HomeContent } from "@/components/HomeContent";

// ISR: regenerate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  // Fetch data server-side — no client waterfall
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
      <HomeContent initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
