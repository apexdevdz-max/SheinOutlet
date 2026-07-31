"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { searchMockProducts } from "@/lib/mock-data";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary";
import type { Product } from "@/lib/types";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const found = searchMockProducts(value);
    setResults(found.slice(0, 5));
    setIsOpen(true);
  }, 250);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 1) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full" id="search-bar">
      <form onSubmit={handleSubmit} className="relative flex">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-4 pr-2 py-2 bg-gray-50 border border-border rounded-l-full text-sm focus:bg-white focus:border-primary/40 transition-colors outline-none"
          id="search-input"
        />
        <button
          type="submit"
          className="px-4 bg-[#ff4a79] hover:bg-[#e8436e] text-white rounded-r-full flex items-center justify-center transition-colors shrink-0"
          aria-label="Rechercher"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Quick results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-border z-50 max-h-80 overflow-y-auto animate-fade-in">
          {results.map((product) => {
            const discount = getDiscountPercent(product.price, product.old_price);
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex items-center gap-3 p-2.5 hover:bg-gray-50 transition-colors border-b border-border/50 last:border-0"
                onClick={() => { setIsOpen(false); setQuery(""); }}
              >
                <div className="w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden relative bg-gray-100">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill loader={cloudinaryLoader} unoptimized className="object-cover" sizes="44px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary text-[10px] font-bold">IMG</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text truncate">{product.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-text">{formatPrice(product.price)}</span>
                    {product.old_price && <span className="text-[10px] text-text-muted line-through">{formatPrice(product.old_price)}</span>}
                    {discount && <span className="text-[10px] font-bold text-primary">-{discount}%</span>}
                  </div>
                </div>
              </Link>
            );
          })}
          {/* See all results link */}
          <button
            type="button"
            className="w-full py-2.5 text-center text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
            onClick={() => { setIsOpen(false); router.push(`/search?q=${encodeURIComponent(query.trim())}`); }}
          >
            Voir tous les résultats →
          </button>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-border z-50 p-4 text-center animate-fade-in">
          <p className="text-text-muted text-xs">Aucun résultat pour &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
