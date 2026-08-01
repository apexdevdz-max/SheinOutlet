"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { FlashSaleCountdown } from "@/components/FlashSaleCountdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MobileHeader } from "@/components/MobileHeader";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";
import {
  getMockBestSellers,
  getMockFlashSaleProducts,
  getParentCategories,
  filterProductsByCategory,
  MOCK_PRODUCTS,
} from "@/lib/mock-data";
import { useStore } from "@/lib/store/useStore";

/* ──── SVG icons for category bubbles ──── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  femme: (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
      {/* Dress / mannequin silhouette */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 00-3 3v1a3 3 0 006 0V5a3 3 0 00-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l-2 13h12L16 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6" />
    </svg>
  ),
  homme: (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
      {/* T-shirt */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h4l2 4-4 2v12H6V9L2 7l2-4h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3a3 3 0 006 0" />
    </svg>
  ),
  chaussures: (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
      {/* Sneaker shoe */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 18h20v2H2v-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 18v-4c0-1 .5-2 2-3l3-2 2 1 3-1c2-.5 4 0 5 1l1 2v6" />
      <circle cx="8" cy="16" r="0.5" fill="currentColor" />
      <circle cx="11" cy="15" r="0.5" fill="currentColor" />
    </svg>
  ),
  "sacs-accessoires": (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
      {/* Handbag */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8V6a4 4 0 00-8 0v2" />
      <rect x="3" y="8" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3" />
    </svg>
  ),
};

/* ──── Nav tabs (mobile category filter) ──── */
const NAV_TABS = [
  { label: "Tout", cat: null, filter: null },
  { label: "Nouveautés", cat: null, filter: "new" },
  { label: "Femme", cat: "femme", filter: null },
  { label: "Homme", cat: "homme", filter: null },
  { label: "Chaussures", cat: "chaussures", filter: null },
  { label: "Sacs", cat: "sacs-accessoires", filter: null },
  { label: "Promos", cat: null, filter: "promo" },
];

/* ──── Utility: slice to the largest multiple of `cols` ──── */
function sliceToGrid<T>(items: T[], cols: number): T[] {
  const count = Math.floor(items.length / cols) * cols;
  return count > 0 ? items.slice(0, count) : items;
}

/* ──────────────────────────────────────────── */
function HomeContent() {
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("cat");
  const activeFilter = searchParams.get("filter");
  const isFiltered = !!(activeCat || activeFilter);

  const cartCount = useStore((s) => s.getCartCount());
  const parentCats = getParentCategories();
  const productsRef = useRef<HTMLDivElement>(null);

  /* ── Auto-scroll to category title on desktop when category is selected ── */
  useEffect(() => {
    if (isFiltered && productsRef.current) {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        // Small delay to ensure DOM is settled
        setTimeout(() => {
          productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [activeCat, activeFilter, isFiltered]);

  /* ── Compute product lists based on active filter ── */
  let bestSellers = getMockBestSellers();
  let flashProducts = getMockFlashSaleProducts();

  if (activeCat) {
    const catProducts = filterProductsByCategory(activeCat);
    bestSellers = catProducts.filter((p) => p.is_best_seller);
    flashProducts = catProducts.filter((p) => p.is_flash_sale);
  } else if (activeFilter === "promo") {
    // Show all discounted products (those with old_price)
    const discounted = MOCK_PRODUCTS.filter((p) => p.old_price && p.old_price > p.price);
    bestSellers = discounted.filter((p) => p.is_best_seller);
    flashProducts = discounted.filter((p) => p.is_flash_sale);
  } else if (activeFilter === "new") {
    // "New" = latest products by created_at
    const sorted = [...MOCK_PRODUCTS].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    bestSellers = sorted.slice(0, 8);
    flashProducts = sorted.filter((p) => p.is_flash_sale).slice(0, 6);
  }

  // Slice grids to multiples of 6 (desktop) / 2 (mobile, handled by CSS)
  const bestSellersGrid = sliceToGrid(bestSellers, 6).length > 0
    ? sliceToGrid(bestSellers, 2)
    : bestSellers;
  const flashGrid = sliceToGrid(flashProducts, 6).length > 0
    ? sliceToGrid(flashProducts, 2)
    : flashProducts;

  /* ── Helper: generate tab href ── */
  function tabHref(tab: (typeof NAV_TABS)[0]) {
    if (tab.cat) return `/?cat=${tab.cat}`;
    if (tab.filter) return `/?filter=${tab.filter}`;
    return "/";
  }
  function isTabActive(tab: (typeof NAV_TABS)[0]) {
    if (!tab.cat && !tab.filter) return !activeCat && !activeFilter;
    if (tab.cat) return activeCat === tab.cat;
    if (tab.filter) return activeFilter === tab.filter;
    return false;
  }

  return (
    <div>
      {/* ─── Mobile Header (transparent overlay) ─── */}
      <MobileHeader />

      {/* ─── Hero Carousel (always visible / persistent) ─── */}
      <HeroCarousel />



      {/* ─── Filtered title (scroll anchor for desktop) ─── */}
      <div ref={productsRef} style={{ scrollMarginTop: "140px" }} />
      {isFiltered && (
        <section className="max-w-7xl mx-auto px-4 pt-4 pb-1">
          <h2 className="text-lg md:text-2xl font-black text-text">
            {activeCat
              ? parentCats.find((c) => c.slug === activeCat)?.name || activeCat.toUpperCase()
              : activeFilter === "new"
                ? "NOUVEAUTÉS"
                : activeFilter === "promo"
                  ? "PROMOTIONS"
                  : ""}
          </h2>
        </section>
      )}

      {/* ─── Flash Sale ─── */}
      {!isFiltered && (
        <section className="max-w-7xl mx-auto py-6">
          <FlashSaleCountdown />
        </section>
      )}

      {/* ─── Best Sellers ─── */}
      {bestSellersGrid.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8" id="best-sellers">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-2xl font-black text-text">MEILLEURES VENTES</h2>
            {!isFiltered && (
              <Link href="/categories?filter=best" className="text-sm text-text-light hover:text-primary transition-colors flex items-center gap-1">
                Voir tout
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {bestSellersGrid.map((product, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Reassurance Bar (hidden when filtering by category) ─── */}
      {!isFiltered && (
        <section className="max-w-7xl mx-auto px-4 py-8" id="reassurance">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: "🚚", title: "LIVRAISON RAPIDE", desc: "Partout en Algérie" },
              { icon: "💰", title: "PAIEMENT", desc: "Payez à la réception" },
              { icon: "↩️", title: "RETOUR FACILE", desc: "Sous 7 jours" },
              { icon: "💬", title: "SERVICE CLIENT", desc: "7/7 à votre écoute" },
            ].map((item) => (
              <div key={item.title} className="reassurance-item bg-white border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-2">{item.icon}</span>
                <h4 className="text-xs font-bold text-text">{item.title}</h4>
                <p className="text-[10px] text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Flash Sale Products ─── */}
      {flashGrid.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8" id="flash-products">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-2xl font-black text-text flex items-center gap-2">
              ⚡ OFFRES FLASH
            </h2>
            {!isFiltered && (
              <Link href="/categories?filter=flash" className="text-sm text-text-light hover:text-primary transition-colors flex items-center gap-1">
                Voir tout
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {flashGrid.map((product, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Empty state ─── */}
      {isFiltered && bestSellersGrid.length === 0 && flashGrid.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-text-light text-sm">Aucun produit trouvé pour cette catégorie.</p>
          <Link href="/" className="mt-4 inline-block text-primary text-sm font-medium hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </section>
      )}

      {/* ─── Promo Banners (only on home) ─── */}
      {!isFiltered && (
        <section className="max-w-7xl mx-auto px-4 py-8" id="promo-banners">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="promo-gradient rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer group">
              <div>
                <h3 className="text-lg font-black text-primary-dark">BON D&apos;ACHAT</h3>
                <p className="text-sm text-text-light">Disponible maintenant !</p>
              </div>
              <div className="text-2xl font-black text-primary/30 group-hover:text-primary/50 transition-colors">
                SHEIN<br /><span className="italic text-sm">outlet</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
              <div>
                <h3 className="text-lg font-black text-text">NOUVEAUTÉS</h3>
                <p className="text-sm text-text-light">Chaque semaine</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-pink-200/50 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
              <div>
                <h3 className="text-lg font-black text-text">REJOIGNEZ-NOUS</h3>
                <p className="text-sm text-text-light">sur Instagram</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}

/* ── Wrap in Suspense for useSearchParams ── */
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
