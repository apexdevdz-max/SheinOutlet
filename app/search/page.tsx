"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar, FilterMobileButton, DEFAULT_FILTERS } from "@/components/FilterPanel";
import type { Filters } from "@/components/FilterPanel";
import { searchMockProducts, MOCK_PRODUCTS } from "@/lib/mock-data";

function applyFilters(products: import("@/lib/types").Product[], filters: Filters) {
  return products.filter((p) => {
    if (filters.minPrice !== null && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && p.price > filters.maxPrice) return false;
    if (filters.sizes.length > 0 && !filters.sizes.some((s) => p.sizes.includes(s))) return false;
    if (filters.colors.length > 0 && !filters.colors.some((c) => p.colors.includes(c))) return false;
    if (filters.promo && !(p.old_price && p.old_price > p.price)) return false;
    if (filters.newOnly) {
      const d = new Date(p.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (d < thirtyDaysAgo) return false;
    }
    return true;
  });
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const searchResults = useMemo(() => {
    if (!query.trim()) return MOCK_PRODUCTS;
    return searchMockProducts(query);
  }, [query]);

  const filteredResults = useMemo(
    () => applyFilters(searchResults, filters),
    [searchResults, filters]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          {query ? (
            <>
              <h1 className="text-lg md:text-xl font-black text-text">
                Résultats pour &ldquo;{query}&rdquo;
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                {filteredResults.length} produit{filteredResults.length !== 1 ? "s" : ""} trouvé{filteredResults.length !== 1 ? "s" : ""}
              </p>
            </>
          ) : (
            <h1 className="text-lg md:text-xl font-black text-text">Tous les produits</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FilterMobileButton filters={filters} onChange={setFilters} totalResults={filteredResults.length} />
          <Link href="/" className="text-xs text-primary hover:underline hidden md:block">
            ← Accueil
          </Link>
        </div>
      </div>

      {/* Layout: sidebar + grid */}
      <div className="flex gap-6">
        <FilterSidebar filters={filters} onChange={setFilters} totalResults={filteredResults.length} />

        <div className="flex-1 min-w-0">
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredResults.map((product, i) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm text-text-light mb-1">Aucun produit ne correspond à vos critères.</p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-xs text-primary font-medium hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
