"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats: Category[]) => {
        if (Array.isArray(cats)) setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const parentCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center gap-3 mb-5">
        <Link href="/" className="text-text-light">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-text">NOS CATÉGORIES</h1>
      </div>

      {/* Desktop Title */}
      <h1 className="hidden md:block text-3xl font-black text-text mb-8">Catégories</h1>

      {/* Quick links */}
      <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide">
        <Link
          href="/?filter=new"
          className="flex-shrink-0 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl px-5 py-3 hover:shadow-md transition-shadow"
        >
          <p className="text-xs font-bold text-primary-dark">✨ Nouveautés</p>
          <p className="text-[10px] text-text-muted">Chaque semaine</p>
        </Link>
        <Link
          href="/?filter=promo"
          className="flex-shrink-0 promo-gradient rounded-xl px-5 py-3 hover:shadow-md transition-shadow"
        >
          <p className="text-xs font-bold text-primary-dark">🔥 Promotions</p>
          <p className="text-[10px] text-text-muted">Jusqu&apos;à -70%</p>
        </Link>
      </div>

      {/* Category List with Images */}
      <div className="space-y-4">
        {parentCategories.map((cat) => {
          const subcats = getSubCategories(cat.id);

          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-border overflow-hidden" id={`cat-${cat.slug}`}>
              {/* Parent Category Card */}
              <Link
                href={`/?cat=${cat.slug}`}
                className="flex items-center gap-4 p-3 hover:bg-pink-50/30 transition-colors group"
              >
                {/* Category Image */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary/30">{cat.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-bold text-text group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {subcats.length > 0 ? `${subcats.length} sous-catégories` : "Voir les produits"}
                  </p>
                </div>
                {/* Arrow */}
                <svg className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Subcategories */}
              {subcats.length > 0 && (
                <div className="border-t border-border/50 px-3 py-2 bg-gray-50/30">
                  <div className="flex flex-wrap gap-2">
                    {subcats.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/?cat=${cat.slug}&subcat=${sub.slug}`}
                        className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-border/50 hover:border-primary/30 hover:bg-pink-50/50 transition-all group"
                      >
                        {/* Subcategory thumbnail */}
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-pink-50 flex-shrink-0">
                          {sub.image_url ? (
                            <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[10px] font-bold text-primary/40">{sub.name.slice(0, 2)}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-text-light font-medium group-hover:text-primary transition-colors">
                          {sub.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
