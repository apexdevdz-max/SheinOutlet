import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProducts, getCategories } from "@/lib/supabase-data";
import { HomeContent } from "@/components/HomeContent";
import type { Metadata } from "next";

// ISR: regenerate every 60 seconds (same as homepage)
export const revalidate = 60;

/**
 * Known virtual filter routes that map to non-category pages.
 * These slugs are NOT categories — they map to `activeFilter`.
 */
const FILTER_ROUTES: Record<string, string> = {
  nouveautes: "new",
};

/**
 * Resolve the slug segments into activeCat / activeSubcat / activeFilter.
 * Returns null if the slug doesn't match any category or filter.
 */
async function resolveSlug(slugParts: string[]) {
  const categories = await getCategories();
  const first = slugParts[0];

  // Check if it's a virtual filter route
  if (slugParts.length === 1 && FILTER_ROUTES[first]) {
    return {
      activeCat: null,
      activeSubcat: null,
      activeFilter: FILTER_ROUTES[first],
      categories,
    };
  }

  // Check if first segment is a parent category
  const parentCat = categories.find((c) => c.slug === first && !c.parent_id);
  if (!parentCat) return null;

  // If there's a second segment, it must be a subcategory of this parent
  if (slugParts.length === 2) {
    const subCat = categories.find(
      (c) => c.slug === slugParts[1] && c.parent_id === parentCat.id
    );
    if (!subCat) return null;
    return {
      activeCat: first,
      activeSubcat: slugParts[1],
      activeFilter: null,
      categories,
    };
  }

  // Single segment = parent category
  if (slugParts.length === 1) {
    return {
      activeCat: first,
      activeSubcat: null,
      activeFilter: null,
      categories,
    };
  }

  // More than 2 segments = not valid
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);
  if (!resolved) return {};

  const categories = resolved.categories;

  if (resolved.activeFilter === "new") {
    return { title: "Nouveautés — SHEIN Outlet Algérie" };
  }

  if (resolved.activeCat) {
    const cat = categories.find((c) => c.slug === resolved.activeCat && !c.parent_id);
    const catName = cat?.name || resolved.activeCat;
    if (resolved.activeSubcat) {
      const sub = categories.find((c) => c.slug === resolved.activeSubcat);
      const subName = sub?.name || resolved.activeSubcat;
      return { title: `${subName} — ${catName} — SHEIN Outlet Algérie` };
    }
    return { title: `${catName} — SHEIN Outlet Algérie` };
  }

  return {};
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved) {
    notFound();
  }

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
        activeCat={resolved.activeCat}
        activeSubcat={resolved.activeSubcat}
        activeFilter={resolved.activeFilter}
      />
    </Suspense>
  );
}
