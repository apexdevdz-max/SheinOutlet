"use client";

import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { searchMockProducts } from "@/lib/mock-data";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import Link from "next/link";
import type { Product } from "@/lib/types";

export function SearchBar() {
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
    setResults(found.slice(0, 6));
    setIsOpen(true);
  }, 300);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  return (
    <div className="relative w-full" id="search-bar">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-border rounded-lg text-sm focus:bg-white transition-colors"
          id="search-input"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-border z-50 max-h-96 overflow-y-auto animate-fade-in">
          {results.map((product) => {
            const discount = getDiscountPercent(product.price, product.old_price);
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-border last:border-0"
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
              >
                <div className="w-12 h-12 bg-primary-light rounded-lg flex-shrink-0 flex items-center justify-center text-primary text-xs font-bold">
                  IMG
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-text">{formatPrice(product.price)}</span>
                    {product.old_price && (
                      <span className="price-old">{formatPrice(product.old_price)}</span>
                    )}
                    {discount && (
                      <span className="text-xs font-bold text-primary">-{discount}%</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-border z-50 p-6 text-center animate-fade-in">
          <p className="text-text-muted text-sm">Aucun résultat pour &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
