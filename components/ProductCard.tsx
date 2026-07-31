"use client";

import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary";
import { useStore } from "@/lib/store/useStore";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { toggleFavorite, isFavorite } = useStore();
  const discount = getDiscountPercent(product.price, product.old_price);
  const fav = isFavorite(product.id);

  return (
    <div className="product-card group relative bg-white rounded-xl overflow-hidden border border-border/50" id={`product-${product.slug}`}>
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50">
        <div className="w-full h-full bg-gradient-to-br from-primary-light to-pink-100 flex items-center justify-center relative">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              loader={cloudinaryLoader}
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 20vw"
            />
          ) : (
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/60 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-primary/60 font-medium">{product.name.split(" ").slice(0, 2).join(" ")}</p>
            </div>
          )}
        </div>

        {/* Hover zoom overlay - Desktop only */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />

        {/* Discount badge */}
        {discount && (
          <span className="badge-discount">-{discount}%</span>
        )}
      </Link>

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product);
        }}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 group/fav"
        aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
        id={`fav-${product.slug}`}
      >
        <svg
          className={`w-4.5 h-4.5 transition-all duration-200 ${
            fav ? "text-primary fill-primary scale-110" : "text-gray-400 group-hover/fav:text-primary"
          }`}
          fill={fav ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={fav ? 0 : 1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Info */}
      <div className="p-3">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xs font-medium text-text line-clamp-2 leading-snug mb-1.5 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.old_price && (
            <span className="price-old">{formatPrice(product.old_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
