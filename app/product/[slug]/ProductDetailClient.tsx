"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary";
import { useStore } from "@/lib/store/useStore";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

/* ── Related Products Carousel ── */
function RelatedProducts({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section className="mt-12 md:mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-black text-text">Produits Apparentés</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-[180px] md:w-[220px] snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductDetailClient({ product, relatedProducts = [] }: { product: Product; relatedProducts?: Product[] }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const router = useRouter();

  // Image gallery state
  const allImages = product.images && product.images.length > 0 ? product.images : [];
  const [selectedImage, setSelectedImage] = useState(0);

  // Build display attributes: prefer attributes array, fallback to legacy
  const displayAttrs = (product.attributes && product.attributes.length > 0)
    ? product.attributes
    : [
        ...(product.sizes?.length > 0 ? [{ label: product.sizes_label || "Taille", values: product.sizes }] : []),
        ...(product.colors?.length > 0 ? [{ label: "Couleur", values: product.colors }] : []),
      ];

  // Track selected value per attribute (keyed by label)
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    displayAttrs.forEach((attr) => {
      if (attr.values.length > 0) init[attr.label] = attr.values[0];
    });
    return init;
  });

  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  const discount = getDiscountPercent(product.price, product.old_price);
  const fav = isFavorite(product.id);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    const selectedSize = selections[displayAttrs[0]?.label] || "";
    const selectedColor = selections[displayAttrs[1]?.label] || "";
    addToCart(product, selectedSize, selectedColor);
    setShowPopup(true);
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
        <button onClick={() => router.back()} className="flex items-center gap-1 text-text-light text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Gallery */}
        <div className="relative">
          {/* Main image */}
          <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary-light to-pink-100 flex items-center justify-center relative">
            {allImages.length > 0 ? (
              <Image
                src={allImages[selectedImage]}
                alt={product.name}
                fill
                priority
                loader={cloudinaryLoader}
                className="object-cover transition-opacity duration-300"
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

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  onMouseEnter={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? "border-primary shadow-md shadow-primary/20"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${i + 1}`}
                    width={80}
                    height={100}
                    loader={cloudinaryLoader}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {discount && <span className="badge-discount text-base px-3 py-1">-{discount}%</span>}

          <button
            onClick={() => toggleFavorite(product)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
            id="product-fav-btn"
          >
            <svg className={`w-5 h-5 ${fav ? "text-red-500 fill-red-500" : "text-gray-400"}`} viewBox="0 0 24 24" stroke="currentColor" fill={fav ? "currentColor" : "none"} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-text leading-tight mb-2">{product.name}</h1>

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

          {/* Out of Stock badge */}
          {product.stock <= 0 && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span className="text-red-600 font-bold text-sm">RUPTURE DE STOCK</span>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-text-light leading-relaxed mb-6">{product.description}</p>

          {/* Dynamic Attributes */}
          {displayAttrs.map((attr) => (
            <div key={attr.label} className="mb-5">
              <h3 className="text-sm font-bold text-text mb-2">
                {attr.label} : <span className="font-normal text-text-light">{selections[attr.label] || ""}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {attr.values.map((val) => (
                  <button
                    key={val}
                    onClick={() => setSelections({ ...selections, [attr.label]: val })}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      selections[attr.label] === val
                        ? "border-primary bg-primary-light text-primary font-medium"
                        : "border-border text-text-light hover:border-primary/50"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-text mb-2">Quantité</h3>
            <div className={`flex items-center gap-0 border border-border rounded-lg w-fit overflow-hidden ${product.stock <= 0 ? "opacity-40 pointer-events-none" : ""}`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-text-light transition-colors"
                disabled={product.stock <= 0}
              >
                −
              </button>
              <span className="w-12 h-10 flex items-center justify-center font-bold text-text border-x border-border">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-text-light transition-colors"
                disabled={product.stock <= 0}
              >
                +
              </button>
            </div>
          </div>

          {/* Commander maintenant */}
          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => {
                if (product.stock <= 0) return;
                const selectedSize = selections[displayAttrs[0]?.label] || "";
                const selectedColor = selections[displayAttrs[1]?.label] || "";
                addToCart(product, selectedSize, selectedColor);
                router.push("/cart");
              }}
              disabled={product.stock <= 0}
              className={`w-full py-4 font-bold text-base transition-all ${
                product.stock <= 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800 hover:shadow-xl"
              }`}
              id="order-now-btn"
            >
              COMMANDER MAINTENANT
            </button>

            {/* Ajouter au panier (shows popup) */}
            <button
              onClick={() => {
                if (product.stock <= 0) return;
                handleAddToCart();
              }}
              disabled={product.stock <= 0}
              className={`w-full py-4 font-bold text-base border-2 transition-all ${
                product.stock <= 0
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-black border-black hover:bg-gray-50"
              }`}
              id="add-to-cart-btn"
            >
              {product.stock <= 0 ? "INDISPONIBLE" : "AJOUTER AU PANIER"}
            </button>
          </div>

          {/* Reassurance */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <svg className="w-5 h-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              <p className="text-[10px] text-text-muted mt-1">Livraison 69 Wilayas</p>
            </div>
            <div className="text-center">
              <svg className="w-5 h-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
              <p className="text-[10px] text-text-muted mt-1">Paiement COD</p>
            </div>
            <div className="text-center">
              <svg className="w-5 h-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
              <p className="text-[10px] text-text-muted mt-1">Retour 7 jours</p>
            </div>
          </div>
        </div>
      </div>
      {/* ── Louis Vuitton-style right side panel ── */}
      {showPopup && (
        <div className="fixed inset-0 z-50" onClick={() => setShowPopup(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Right Drawer Panel */}
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white shadow-2xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Produit Ajouté</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="px-6 py-6 flex gap-4 border-b border-gray-100">
              <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                {allImages[0] && (
                  <Image
                    src={allImages[0]}
                    alt={product.name}
                    width={80}
                    height={96}
                    loader={cloudinaryLoader}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">{product.name}</p>
                {selections && Object.entries(selections).map(([label, value]) => (
                  value && <p key={label} className="text-xs text-gray-500">{label} : {value}</p>
                ))}
                <p className="text-sm font-bold text-gray-900 mt-2">{formatPrice(product.price)}</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Buttons */}
            <div className="px-6 pb-8 pt-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  router.push("/cart");
                }}
                className="w-full py-4 rounded-full bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors"
              >
                Commander maintenant
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-4 rounded-full bg-white text-black font-bold text-sm border-2 border-black hover:bg-gray-50 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
