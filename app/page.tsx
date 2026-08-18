"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { FlashSaleCountdown } from "@/components/FlashSaleCountdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryCarousels } from "@/components/CategoryCarousels";
import { MobileHeader } from "@/components/MobileHeader";
import { SearchBar } from "@/components/SearchBar";
import type { Product, Category } from "@/lib/types";
import { useStore } from "@/lib/store/useStore";
import { ProductFilterSidebar } from "@/components/ProductFilterSidebar";

/* ──── SVG icons for category bubbles ──── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  femme: (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 00-3 3v1a3 3 0 006 0V5a3 3 0 00-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l-2 13h12L16 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6" />
    </svg>
  ),
  homme: (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h4l2 4-4 2v12H6V9L2 7l2-4h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3a3 3 0 006 0" />
    </svg>
  ),
  chaussures: (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 18h20v2H2v-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 18v-4c0-1 .5-2 2-3l3-2 2 1 3-1c2-.5 4 0 5 1l1 2v6" />
      <circle cx="8" cy="16" r="0.5" fill="currentColor" />
      <circle cx="11" cy="15" r="0.5" fill="currentColor" />
    </svg>
  ),
  "sacs-accessoires": (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.4}>
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
  const activeSubcat = searchParams.get("subcat");
  const isFiltered = !!(activeCat || activeFilter);

  const cartCount = useStore((s) => s.getCartCount());
  const productsRef = useRef<HTMLDivElement>(null);
  const catCarouselRef = useRef<HTMLDivElement>(null);
  const subcatCarouselRef = useRef<HTMLDivElement>(null);

  // Fetch data from Supabase via API
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=200").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([prods, cats]) => {
      setAllProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    }).catch(() => {});
  }, []);

  const parentCats = categories.filter((c) => !c.parent_id);

  /* ── Auto-scroll to products section when category/subcategory is selected ── */
  useEffect(() => {
    if (isFiltered && productsRef.current) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [activeCat, activeFilter, activeSubcat, isFiltered]);

  /* ── Compute product lists based on active filter ── */
  // Helper: get products for a category slug (parent + sub-cats)
  function getProductsByCategory(slug: string, subcatSlug?: string | null): Product[] {
    const parent = categories.find((c) => c.slug === slug && !c.parent_id);
    if (!parent) return [];

    // If a subcategory is selected, only show products from that specific subcategory
    if (subcatSlug) {
      const subcat = categories.find((c) => c.slug === subcatSlug && c.parent_id === parent.id);
      if (subcat) {
        return allProducts.filter((p) => p.category_id === subcat.id);
      }
    }

    // Otherwise show all products from parent + all children
    const childIds = categories.filter((c) => c.parent_id === parent.id).map((c) => c.id);
    const allCatIds = [parent.id, ...childIds];
    return allProducts.filter((p) => p.category_id && allCatIds.includes(p.category_id));
  }

  // Get subcategories for the active parent category
  const activeParent = activeCat ? categories.find((c) => c.slug === activeCat && !c.parent_id) : null;
  const activeSubcats = activeParent ? categories.filter((c) => c.parent_id === activeParent.id) : [];

  let bestSellers = allProducts.filter((p) => p.is_best_seller);
  let flashProducts = allProducts.filter((p) => p.is_flash_sale);

  if (activeCat) {
    const catProducts = getProductsByCategory(activeCat, activeSubcat);
    bestSellers = catProducts; // Show ALL products of this category
    flashProducts = catProducts.filter((p) => p.is_flash_sale);
  } else if (activeFilter === "promo") {
    const discounted = allProducts.filter((p) => p.old_price && p.old_price > p.price);
    bestSellers = discounted;
    flashProducts = discounted.filter((p) => p.is_flash_sale);
  } else if (activeFilter === "new") {
    const sorted = [...allProducts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    bestSellers = sorted.slice(0, 12);
    flashProducts = sorted.filter((p) => p.is_flash_sale).slice(0, 6);
  }

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

      {/* ─── Hero Carousel (only when no category filter active) ─── */}
      {!activeCat && <HeroCarousel />}

      {/* ─── Main Content Wrapper (with lateral margins, Header/Footer excluded) ─── */}
      <div className={`px-4 sm:px-6 lg:px-12 xl:px-20 ${activeCat ? "pt-24 md:pt-32" : ""}`}>

      {/* ─── Category Cards Carousel (homepage only) ─── */}
      {!isFiltered && parentCats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6 relative">
          {/* Left arrow */}
          <button
            onClick={() => {
              if (catCarouselRef.current) catCarouselRef.current.scrollBy({ left: -(catCarouselRef.current.offsetWidth * 0.7), behavior: "smooth" });
            }}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white hover:shadow-lg transition-all text-text-light hover:text-primary"
            aria-label="Précédent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrollable row */}
          <div
            ref={catCarouselRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1 pb-2">

            {parentCats.map((cat) => (
              <Link
                key={cat.id}
                href={`/?cat=${cat.slug}`}
                className="group relative block overflow-hidden flex-shrink-0 w-[200px] md:w-[260px] aspect-[4/3] bg-pink-50 hover:shadow-lg transition-all duration-300"
              >
                {/* Background image */}
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-50" />
                )}

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* Icon circle (top-right) */}
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-pink-200/70 backdrop-blur-sm flex items-center justify-center">
                  {CATEGORY_ICONS[cat.slug] ? (
                    <div className="[&_svg]:!w-4 [&_svg]:!h-4 text-primary">
                      {CATEGORY_ICONS[cat.slug]}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-primary">{cat.name.charAt(0)}</span>
                  )}
                </div>

                {/* Category name (top-left) */}
                <div className="absolute top-3 left-3">
                  <h3 className="text-sm md:text-base font-black text-text drop-shadow-sm leading-tight">
                    {cat.name.toUpperCase()}
                  </h3>
                </div>

                {/* "Voir plus >" button (bottom-left) */}
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/90 text-white text-[10px] md:text-[11px] font-semibold group-hover:bg-primary transition-colors shadow-sm">
                    Voir plus
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => {
              if (catCarouselRef.current) catCarouselRef.current.scrollBy({ left: catCarouselRef.current.offsetWidth * 0.7, behavior: "smooth" });
            }}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white hover:shadow-lg transition-all text-text-light hover:text-primary"
            aria-label="Suivant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>
      )}

      {/* ─── Category Title + Subcategory Carousel (when a category is active) ─── */}
      {activeCat && (
        <section className="max-w-7xl mx-auto px-4 pt-4 pb-2">
          {/* Category title */}
          <h2 className="text-lg md:text-2xl font-black text-text mb-4">
            {parentCats.find((c) => c.slug === activeCat)?.name || activeCat.toUpperCase()}
          </h2>

          {/* Subcategory cards carousel */}
          {activeSubcats.length > 0 && (
            <div className="relative">
              {/* Left arrow */}
              <button
                onClick={() => {
                  if (subcatCarouselRef.current) subcatCarouselRef.current.scrollBy({ left: -(subcatCarouselRef.current.offsetWidth * 0.7), behavior: "smooth" });
                }}
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white hover:shadow-lg transition-all text-text-light hover:text-primary"
                aria-label="Précédent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Scrollable row */}
              <div
                ref={subcatCarouselRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1 pb-2">

                {activeSubcats.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/?cat=${activeCat}&subcat=${sub.slug}`}
                    className={`group relative block overflow-hidden flex-shrink-0 w-[200px] md:w-[260px] aspect-[4/3] bg-pink-50 hover:shadow-lg transition-all duration-300 ${
                      activeSubcat === sub.slug ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                  >
                    {/* Background image */}
                    {sub.image_url ? (
                      <img
                        src={sub.image_url}
                        alt={sub.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-50" />
                    )}

                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {/* Subcategory name (top-left) */}
                    <div className="absolute top-3 left-3">
                      <h3 className="text-sm md:text-base font-black text-text drop-shadow-sm leading-tight">
                        {sub.name.toUpperCase()}
                      </h3>
                    </div>

                    {/* "Voir plus >" button (bottom-left) */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/90 text-white text-[10px] md:text-[11px] font-semibold group-hover:bg-primary transition-colors shadow-sm">
                        Voir plus
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => {
                  if (subcatCarouselRef.current) subcatCarouselRef.current.scrollBy({ left: subcatCarouselRef.current.offsetWidth * 0.7, behavior: "smooth" });
                }}
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white hover:shadow-lg transition-all text-text-light hover:text-primary"
                aria-label="Suivant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </section>
      )}

      {/* ─── Filtered title (for non-category filters: new/promo) ─── */}
      <div ref={productsRef} style={{ scrollMarginTop: "140px" }} />
      {isFiltered && !activeCat && (
        <section className="max-w-7xl mx-auto px-4 pt-4 pb-1">
          <h2 className="text-lg md:text-2xl font-black text-text">
            {activeFilter === "new"
              ? "NOUVEAUTÉS"
              : activeFilter === "promo"
                ? "PROMOTIONS"
                : ""}
          </h2>
        </section>
      )}

      {/* ─── Filtered Products Grid with Filter Sidebar ─── */}
      {isFiltered && bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <ProductFilterSidebar products={bestSellers}>
            {(filtered) => (
              <>
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-[2px] md:gap-[2px]">
                    {filtered.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Aucun produit ne correspond aux filtres.</p>
                  </div>
                )}
              </>
            )}
          </ProductFilterSidebar>
        </section>
      )}

      {/* ─── Flash Sale ─── */}
      {!isFiltered && (
        <section className="max-w-7xl mx-auto py-6">
          <FlashSaleCountdown />
        </section>
      )}


      {/* ─── Category Carousels (horizontal scrolling rows) ─── */}
      {!isFiltered && <CategoryCarousels />}


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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                <span className="text-2xl"> </span>
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

      </div>{/* end main content wrapper */}
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
