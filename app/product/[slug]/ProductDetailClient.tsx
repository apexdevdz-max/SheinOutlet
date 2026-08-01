"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary";
import { useStore } from "@/lib/store/useStore";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import type { Product } from "@/lib/types";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount = getDiscountPercent(product.price, product.old_price);
  const fav = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* Breadcrumb */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-primary transition-colors">Catégories</Link>
        <span>/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      {/* Mobile back button */}
      <div className="md:hidden mb-4">
        <Link href="/" className="flex items-center gap-1 text-text-light text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-light to-pink-100 flex items-center justify-center relative">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                loader={cloudinaryLoader}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/50 flex items-center justify-center">
                  <svg className="w-16 h-16 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-primary/50 font-medium">{product.name}</p>
              </div>
            )}
          </div>

          {discount && <span className="badge-discount text-base px-3 py-1">-{discount}%</span>}

          <button
            onClick={() => toggleFavorite(product)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
            id="product-fav-btn"
          >
            <svg className={`w-5 h-5 ${fav ? "text-primary fill-primary" : "text-gray-400"}`} fill={fav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={fav ? 0 : 1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-bold text-text mb-3">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl md:text-3xl font-black text-text">{formatPrice(product.price)}</span>
            {product.old_price && (
              <span className="text-lg text-text-muted line-through">{formatPrice(product.old_price)}</span>
            )}
            {discount && (
              <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-text-light leading-relaxed mb-6">{product.description}</p>

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-text mb-2">
                Couleur : <span className="font-normal text-text-light">{selectedColor}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      selectedColor === color
                        ? "border-primary bg-primary-light text-primary font-medium"
                        : "border-border text-text-light hover:border-primary/50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-text mb-2">
                Taille : <span className="font-normal text-text-light">{selectedSize}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg text-sm font-medium border transition-all flex items-center justify-center ${
                      selectedSize === size
                        ? "border-primary bg-primary text-white shadow-md"
                        : "border-border text-text hover:border-primary/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-text mb-2">Quantité</h3>
            <div className="flex items-center gap-0 border border-border rounded-lg w-fit overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-text-light transition-colors"
              >
                −
              </button>
              <span className="w-12 h-10 flex items-center justify-center font-bold text-text border-x border-border">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-text-light transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-4 rounded-xl font-bold text-base transition-all ${
                addedToCart
                  ? "bg-success text-white"
                  : "bg-black text-white hover:bg-gray-800 hover:shadow-xl"
              }`}
              id="add-to-cart-btn"
            >
              {addedToCart ? "✓ AJOUTÉ AU PANIER" : "AJOUTER AU PANIER"}
            </button>
          </div>

          {/* Reassurance */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <span className="text-lg">🚚</span>
              <p className="text-[10px] text-text-muted mt-1">Livraison 69 Wilayas</p>
            </div>
            <div className="text-center">
              <span className="text-lg">💰</span>
              <p className="text-[10px] text-text-muted mt-1">Paiement COD</p>
            </div>
            <div className="text-center">
              <span className="text-lg">↩️</span>
              <p className="text-[10px] text-text-muted mt-1">Retour 7 jours</p>
            </div>
          </div>

          {/* WhatsApp share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Regarde ce produit : ${product.name} à ${formatPrice(product.price)} sur SHEIN Outlet ! ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-whatsapp/10 text-whatsapp font-medium text-sm hover:bg-whatsapp/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Partager sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
