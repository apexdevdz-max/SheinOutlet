"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilterSidebar } from "@/components/ProductFilterSidebar";
import type { Product } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/context";

function SearchContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=200")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllProducts(data);
      })
      .catch(() => {});
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return allProducts;
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [query, allProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          {query ? (
            <>
              <h1 className="text-lg md:text-xl font-black text-text">
                {t("search.results", { query })}
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                {t("filter.results", { count: String(searchResults.length) })}
              </p>
            </>
          ) : (
            <h1 className="text-lg md:text-xl font-black text-text">{t("home.allProducts")}</h1>
          )}
        </div>
        <Link href="/" className="text-xs text-primary hover:underline hidden md:block">
          &larr; {t("nav.home")}
        </Link>
      </div>

      {/* Products with filter sidebar */}
      {searchResults.length > 0 ? (
        <ProductFilterSidebar products={searchResults}>
          {(filtered) => (
            <>
              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-[2px] md:gap-[2px]">
                  {filtered.map((product, i) => (
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
                  <p className="text-sm text-text-light">{t("filter.noProducts")}</p>
                </div>
              )}
            </>
          )}
        </ProductFilterSidebar>
      ) : (
        <div className="py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm text-text-light mb-1">{t("search.noResults", { query })}</p>
          <Link href="/" className="text-xs text-primary font-medium hover:underline">
            &larr; {t("order.backHome")}
          </Link>
        </div>
      )}
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
