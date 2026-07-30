"use client";

import { useState } from "react";
import Link from "next/link";
import { getParentCategories, getSubCategories } from "@/lib/mock-data";

export default function CategoriesPage() {
  const parentCategories = getParentCategories();
  const [openCat, setOpenCat] = useState<string | null>("1");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center gap-3 mb-6">
        <Link href="/" className="text-text-light">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-text">NOS CATÉGORIES</h1>
      </div>

      {/* Desktop Title */}
      <h1 className="hidden md:block text-3xl font-black text-text mb-8">Catégories</h1>

      {/* Promo Banner */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="promo-gradient rounded-xl p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-text-light">Nouveautés</p>
            <p className="text-lg font-black text-primary-dark">-70%</p>
            <p className="text-[10px] text-text-muted">sur vos articles préférés</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-text-light">Nouveautés</p>
            <p className="text-lg font-black text-primary-dark">-70%</p>
            <p className="text-[10px] text-text-muted">sur vos articles préférés</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-border rounded-xl text-sm"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-2">
        {parentCategories.map((cat) => {
          const isOpen = openCat === cat.id;
          const subcats = getSubCategories(cat.id);

          return (
            <div key={cat.id} className="border border-border rounded-xl overflow-hidden bg-white" id={`cat-${cat.slug}`}>
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base font-bold text-text">{cat.name}</span>
                <svg
                  className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && subcats.length > 0 && (
                <div className="px-5 pb-5 animate-fade-in">
                  {/* Subcategory label */}
                  <p className="text-xs text-text-muted mb-3 font-medium">Vêtements</p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {subcats.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories?cat=${sub.slug}`}
                        className="group flex flex-col items-center gap-2"
                      >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary-light flex items-center justify-center group-hover:bg-primary/15 transition-colors shadow-sm">
                          <span className="text-primary text-xs font-bold">{sub.name.slice(0, 3)}</span>
                        </div>
                        <span className="text-[10px] md:text-xs text-text-light text-center leading-tight group-hover:text-primary transition-colors">
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

      {/* Nouveautés link */}
      <div className="mt-6 border border-border rounded-xl overflow-hidden bg-white">
        <Link href="/categories?filter=new" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
          <span className="text-base font-bold text-text">Nouveautés</span>
          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
