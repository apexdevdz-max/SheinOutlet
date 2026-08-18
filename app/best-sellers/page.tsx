"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilterSidebar } from "@/components/ProductFilterSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import type { Product } from "@/lib/types";

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?limit=200")
      .then((r) => r.json())
      .then((data) => {
        const all: Product[] = Array.isArray(data) ? data : [];
        setProducts(all.filter((p) => p.is_best_seller));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="min-h-screen pt-16 md:pt-28 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded w-64" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileHeader />
      <div className="min-h-screen pt-16 md:pt-4 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Meilleures Ventes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Products with filter */}
          <ProductFilterSidebar products={products}>
            {(filtered) => (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-400">
                    Aucun produit trouvé.
                  </div>
                )}
              </div>
            )}
          </ProductFilterSidebar>
        </div>
      </div>
    </>
  );
}
