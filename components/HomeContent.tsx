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
import { useTranslation } from "@/lib/i18n/context";
import type { Product, Category } from "@/lib/types";
import { useStore } from "@/lib/store/useStore";
import { ProductFilterSidebar } from "@/components/ProductFilterSidebar";
import { STORE_MAPS_LINK, STORE_EMBED_URL } from "@/lib/storeLocation";

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

/* ──── Nav tabs keys (mobile category filter) ──── */
const NAV_TAB_DEFS = [
  { key: "nav.all" as const, cat: null, filter: null },
  { key: "nav.newArrivals" as const, cat: null, filter: "new" },
  { key: "nav.women" as const, cat: "femme", filter: null },
  { key: "nav.men" as const, cat: "homme", filter: null },
  { key: "nav.shoes" as const, cat: "chaussures", filter: null },
  { key: "nav.bags" as const, cat: "sacs-accessoires", filter: null },
  { key: "nav.promos" as const, cat: null, filter: "promo" },
];

/* ──── Utility: slice to the largest multiple of `cols` ──── */
function sliceToGrid<T>(items: T[], cols: number): T[] {
  const count = Math.floor(items.length / cols) * cols;
  return count > 0 ? items.slice(0, count) : items;
}

/* ──────────────────────────────────────────── */
interface HomeContentProps {
  initialProducts: Product[];
  initialCategories: Category[];
  /** Pre-resolved from clean URL route (e.g. /homme) */
  activeCat?: string | null;
  /** Pre-resolved from clean URL route (e.g. /homme/ensemble) */
  activeSubcat?: string | null;
  /** Pre-resolved from clean URL route (e.g. /nouveautes) */
  activeFilter?: string | null;
}

function HomeContentInner({ initialProducts, initialCategories, activeCat: propCat, activeSubcat: propSubcat, activeFilter: propFilter }: HomeContentProps) {
  const searchParams = useSearchParams();
  // Props from clean URL route take priority; fall back to query params for backward compat
  const activeCat = propCat ?? searchParams.get("cat");
  const activeFilter = propFilter ?? searchParams.get("filter");
  const activeSubcat = propSubcat ?? searchParams.get("subcat");
  const isFiltered = !!(activeCat || activeFilter);

  const cartCount = useStore((s) => s.getCartCount());
  const { t } = useTranslation();
  const NAV_TABS = NAV_TAB_DEFS.map((d) => ({ label: t(d.key), cat: d.cat, filter: d.filter }));
  const productsRef = useRef<HTMLDivElement>(null);
  const catCarouselRef = useRef<HTMLDivElement>(null);
  const subcatCarouselRef = useRef<HTMLDivElement>(null);

  // Use server-provided data directly — no client-side fetch needed
  const allProducts = initialProducts;
  const categories = initialCategories;

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
    if (tab.cat) return `/${tab.cat}`;
    if (tab.filter === "new") return "/nouveautes";
    if (tab.filter === "promo") return "/promotions";
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

      {/* ─── Hero Carousel (only on unfiltered homepage) ─── */}
      {!activeCat && !activeFilter && <HeroCarousel />}

      {/* ─── Main Content Wrapper (with lateral margins, Header/Footer excluded) ─── */}
      <div className={`px-4 sm:px-6 lg:px-12 xl:px-20 ${isFiltered ? "pt-16 md:pt-28" : ""}`}>

      {/* ─── Category Cards Carousel (homepage only) ─── */}
      {!isFiltered && parentCats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6 relative">
          {/* Left arrow */}
          <button
            onClick={() => {
              if (catCarouselRef.current) catCarouselRef.current.scrollBy({ left: -(catCarouselRef.current.offsetWidth * 0.7), behavior: "smooth" });
            }}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white hover:shadow-lg transition-all text-text-light hover:text-primary"
            aria-label={t("ui.previous")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrollable row — full-bleed on mobile */}
          <div
            ref={catCarouselRef}
            className="-mx-4 md:mx-0 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth md:px-1 pb-2">

            {/* Left spacer for mobile Gymshark-style scroll */}
            <div className="flex-shrink-0 w-4 md:hidden" aria-hidden="true" />
            {parentCats.map((cat) => (
              <Link
                key={cat.id}
                href={`/${cat.slug}`}
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
                    {t("ui.viewMore")}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
            {/* Right spacer for mobile Gymshark-style scroll */}
            <div className="flex-shrink-0 w-4 md:hidden" aria-hidden="true" />
          </div>

          {/* Right arrow */}
          <button
            onClick={() => {
              if (catCarouselRef.current) catCarouselRef.current.scrollBy({ left: catCarouselRef.current.offsetWidth * 0.7, behavior: "smooth" });
            }}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white hover:shadow-lg transition-all text-text-light hover:text-primary"
            aria-label={t("ui.next")}
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
                aria-label={t("ui.previous")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Scrollable row — full-bleed on mobile */}
              <div
                ref={subcatCarouselRef}
                className="-mx-4 md:mx-0 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth md:px-1 pb-2">

                {/* Left spacer for mobile Gymshark-style scroll */}
                <div className="flex-shrink-0 w-4 md:hidden" aria-hidden="true" />
                {activeSubcats.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/${activeCat}/${sub.slug}`}
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
                        {t("ui.viewMore")}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
                {/* Right spacer for mobile Gymshark-style scroll */}
                <div className="flex-shrink-0 w-4 md:hidden" aria-hidden="true" />
              </div>

              {/* Right arrow */}
              <button
                onClick={() => {
                  if (subcatCarouselRef.current) subcatCarouselRef.current.scrollBy({ left: subcatCarouselRef.current.offsetWidth * 0.7, behavior: "smooth" });
                }}
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white hover:shadow-lg transition-all text-text-light hover:text-primary"
                aria-label={t("ui.next")}
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
              ? t("nav.newArrivalsTitle")
              : activeFilter === "promo"
                ? t("nav.promotions")
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
      {!isFiltered && <CategoryCarousels products={allProducts} categories={categories} />}


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

      {/* ─── Physical Store Banner (only on home) ─── */}
      {!isFiltered && (
        <section className="max-w-7xl mx-auto px-4 py-8" id="store-banner">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-100 via-pink-50 to-rose-100 p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Left: Text */}
              <div className="flex-1 text-center md:text-start">
                <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight">
                  {t("store.title")}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {t("store.subtitle")}
                </p>
              </div>

              {/* Center: Map */}
              <div className="w-full md:w-[320px] h-[180px] md:h-[160px] rounded-xl overflow-hidden shadow-md border-2 border-white/80 shrink-0">
                <iframe
                  src={STORE_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store location"
                />
              </div>

              {/* Right: CTA Button */}
              <div className="flex-1 flex justify-center md:justify-end">
                <a
                  href={STORE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white text-xs md:text-sm font-bold uppercase tracking-wide shadow-md hover:shadow-lg transition-all"
                >
                  {t("store.cta")}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </a>
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
export function HomeContent({ initialProducts, initialCategories, activeCat, activeSubcat, activeFilter }: HomeContentProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <HomeContentInner initialProducts={initialProducts} initialCategories={initialCategories} activeCat={activeCat} activeSubcat={activeSubcat} activeFilter={activeFilter} />
    </Suspense>
  );
}
