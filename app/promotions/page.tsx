"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { FlashSaleCountdown } from "@/components/FlashSaleCountdown";
import type { Product, FlashSale } from "@/lib/types";

export default function PromotionsPage() {
  const [campaign, setCampaign] = useState<FlashSale | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/flash-sale")
      .then((r) => r.json())
      .then((data) => {
        setCampaign(data.campaign || null);
        setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 md:pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Flash Sale Banner */}
        {campaign && (
          <section className="mb-8">
            <FlashSaleCountdown />
          </section>
        )}

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-2">
            <span className="text-2xl"></span> Promotions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length > 0
              ? `${products.length} produit${products.length > 1 ? "s" : ""} en promotion`
              : "Aucune promotion en cours"}
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Pas de promotions pour le moment</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Revenez bientôt pour découvrir nos offres flash et nos meilleures réductions !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
