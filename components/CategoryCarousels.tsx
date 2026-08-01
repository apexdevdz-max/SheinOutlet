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

/* ── Arrow Button ── */
function ScrollArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 items-center justify-center text-gray-600 hover:text-primary hover:border-primary/30 transition-all hover:shadow-xl ${
        direction === "left" ? "left-1" : "right-1"
      }`}
      aria-label={direction === "left" ? "Précédent" : "Suivant"}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );
}

/* ── Single Carousel Row ── */
function CarouselRow({ row }: { row: CategoryRow }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (row.products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-sm md:text-base font-black text-text flex items-center gap-1.5">
          {row.icon && <span>{row.icon}</span>}
          {row.title}
        </h2>
        <Link
          href={row.href}
          className="text-xs md:text-sm text-text-light hover:text-primary transition-colors flex items-center gap-1 font-medium"
        >
          Voir tout
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Carousel with arrows */}
      <div className="relative group">
        <ScrollArrow direction="left" onClick={() => scroll("left")} />
        <ScrollArrow direction="right" onClick={() => scroll("right")} />

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory"
        >
          {row.products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[140px] md:w-[180px] snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
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
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px] md:w-[180px]">
              <div className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
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
    return allProducts.filter((p) => allCatIds.includes(p.category_id));
  }

  const rows: CategoryRow[] = [
    {
      title: "NOUVEAUTÉS",
      href: "/?filter=new",
      products: newProducts,
      icon: "✨",
    },
    {
      title: "MEILLEURES VENTES",
      href: "/categories?filter=best",
      products: bestSellers,
      icon: "🏆",
    },
    {
      title: "OFFRES FLASH",
      href: "/categories?filter=flash",
      products: flashProducts,
      icon: "⚡",
    },
    ...parentCats.map((cat) => ({
      title: cat.name.toUpperCase(),
      href: `/?cat=${cat.slug}`,
      products: getProductsByCategory(cat.slug).slice(0, 12),
      icon:
        cat.slug === "femme"
          ? "👗"
          : cat.slug === "homme"
            ? "👔"
            : cat.slug === "chaussures"
              ? "👟"
              : "👜",
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
