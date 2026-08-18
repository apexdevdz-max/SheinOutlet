"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { Product, Category } from "@/lib/types";

interface CategoryRow {
  title: string;
  href: string;
  products: Product[];
  icon?: string;
}

/* ── Single Carousel Row ── */
function CarouselRow({ row }: { row: CategoryRow }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const GAP = 2; // gap-[2px] = 2px

  function getCardWidth() {
    if (!scrollRef.current) return 250;
    const containerWidth = scrollRef.current.clientWidth;
    return (containerWidth - GAP * 3) / 4;
  }

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth();
    const amount = cardWidth + GAP;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (row.products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header: mobile = title left + "Voir tout" right; desktop = title + "Voir tout" left, arrows right */}
      <div className="flex items-center justify-between md:px-4 mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base md:text-lg font-black text-text flex items-center gap-1.5">
            {row.icon && <span>{row.icon}</span>}
            {row.title}
          </h2>
          {/* "Voir tout" next to title on desktop only */}
          <Link
            href={row.href}
            className="hidden md:inline text-sm text-text hover:text-primary transition-colors font-medium underline underline-offset-2"
          >
            Voir tout
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* "Voir tout" on the right on mobile only */}
          <Link
            href={row.href}
            className="md:hidden text-xs text-text font-semibold hover:text-primary transition-colors"
          >
            Voir tout
          </Link>
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex w-8 h-8 rounded-full border border-gray-300 items-center justify-center text-gray-500 hover:text-primary hover:border-primary/40 transition-all bg-white"
            aria-label="Precedent"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex w-8 h-8 rounded-full border border-gray-300 bg-gray-900 items-center justify-center text-white hover:bg-primary transition-all"
            aria-label="Suivant"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel - full-bleed on mobile (negative margin breaks out of parent padding), overflow hidden on desktop */}
      <div className="-mx-4 md:mx-0 md:overflow-hidden md:px-4">
        <div
          ref={scrollRef}
          className="flex gap-[2px] overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory carousel-scroll-mobile"
        >
          {row.products.map((product, i) => (
            <div
              key={product.id}
              className={`flex-shrink-0 w-[75vw] md:w-[calc((100%-36px)/4)] snap-start${i === 0 ? " carousel-first-card" : ""}`}
            >
              <ProductCard product={product} />
            </div>
          ))}
          {/* Right spacer: aligns last card with page margin at end of scroll */}
          <div className="flex-shrink-0 w-4 md:hidden" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════ */
export function CategoryCarousels() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=200").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([products, cats]) => {
        setAllProducts(Array.isArray(products) ? products : []);
        setCategories(Array.isArray(cats) ? cats : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-[2px] overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px] md:w-[180px]">
              <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded mt-2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded mt-1 w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const parentCats = categories.filter((c) => !c.parent_id);

  const bestSellers = allProducts.filter((p) => p.is_best_seller);
  const flashProducts = allProducts.filter((p) => p.is_flash_sale);
  const newProducts = [...allProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);

  // Filter products by category (parent + sub-categories)
  function getProductsByCategory(catSlug: string): Product[] {
    const parent = categories.find((c) => c.slug === catSlug && !c.parent_id);
    if (!parent) return [];
    const childIds = categories
      .filter((c) => c.parent_id === parent.id)
      .map((c) => c.id);
    const allCatIds = [parent.id, ...childIds];
    return allProducts.filter((p) => p.category_id && allCatIds.includes(p.category_id));
  }

  const rows: CategoryRow[] = [
    {
      title: "NOUVEAUTÉS",
      href: "/?filter=new",
      products: newProducts,
    },
    {
      title: "MEILLEURES VENTES",
      href: "/best-sellers",
      products: bestSellers,
    },
    {
      title: "OFFRES FLASH",
      href: "/flash-sales",
      products: flashProducts,
    },
    ...parentCats.map((cat) => ({
      title: cat.name.toUpperCase(),
      href: `/?cat=${cat.slug}`,
      products: getProductsByCategory(cat.slug).slice(0, 12),
    })),
  ];

  return (
    <div className="space-y-8 py-4">
      {rows.map((row) => (
        <CarouselRow key={row.title} row={row} />
      ))}
    </div>
  );
}
