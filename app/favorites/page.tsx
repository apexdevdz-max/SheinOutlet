"use client";

import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import { ProductCard } from "@/components/ProductCard";
import { useTranslation } from "@/lib/i18n/context";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { favorites, addToCart } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center gap-3 mb-6">
        <Link href="/" className="text-text-light">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-text">{t("favorites.title").toUpperCase()}</h1>
        <span className="text-sm text-text-muted ml-auto">{t("cart.items", { count: String(favorites.length) })}</span>
      </div>

      {/* Desktop Title */}
      <h1 className="hidden md:block text-3xl font-black text-text mb-2">{t("favorites.title")}</h1>
      <p className="hidden md:block text-text-muted mb-8">{t("cart.items", { count: String(favorites.length) })}</p>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
            <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text mb-2">{t("favorites.empty")}</h2>
          <p className="text-sm text-text-muted mb-6">{t("favorites.emptyMessage")}</p>
          <Link
            href="/"
            className="inline-block bg-black text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            {t("favorites.discover").toUpperCase()}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[2px] md:gap-[2px]">
          {favorites.map((fav) => (
            <div key={fav.product.id} className="relative">
              <ProductCard product={fav.product} />
              <button
                onClick={() => addToCart(fav.product, fav.product.sizes[0] || "", fav.product.colors[0] || "")}
                className="w-full mt-1 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t("favorites.addToCart")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
