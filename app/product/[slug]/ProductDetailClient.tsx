"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary";
import { useStore } from "@/lib/store/useStore";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import type { Product, ProductAttributeValue, ProductImage } from "@/lib/types";
import { normalizeAttributes, normalizeImages, isColorAttribute, getImagesForColor, getColorThumbnail } from "@/lib/attributeUtils";
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

  // Normalize images to ProductImage[] format
  const productImages: ProductImage[] = normalizeImages(product.images as unknown as (string | ProductImage)[]);

  // Build display attributes: prefer attributes array, fallback to legacy
  const displayAttrs = (product.attributes && product.attributes.length > 0)
    ? normalizeAttributes(product.attributes as unknown as { label: string; values: (string | ProductAttributeValue)[] }[])
    : [
        ...(product.sizes?.length > 0 ? [{ label: product.sizes_label || "Taille", values: product.sizes.map(s => ({ value: s, available: true })) }] : []),
        ...(product.colors?.length > 0 ? [{ label: "Couleur", values: product.colors.map(c => ({ value: c, available: true })) }] : []),
      ];

  // Track selected value per attribute (keyed by label) — only pick available values
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    displayAttrs.forEach((attr) => {
      const firstAvailable = attr.values.find(v => v.available);
      if (firstAvailable) init[attr.label] = firstAvailable.value;
    });
    return init;
  });

  // Get the selected color name (if any color attribute exists)
  const colorAttr = displayAttrs.find(a => isColorAttribute(a.label));
  const selectedColor = colorAttr ? selections[colorAttr.label] || "" : "";

  // Filter gallery images by selected color
  const galleryImages = selectedColor
    ? getImagesForColor(productImages, selectedColor)
    : productImages;

  const [selectedImage, setSelectedImage] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [sheetTranslateY, setSheetTranslateY] = useState(0);
  const sheetTouchStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Bottom sheet touch handlers for swipe-to-close
  const handleSheetTouchStart = useCallback((e: React.TouchEvent) => {
    sheetTouchStartY.current = e.touches[0].clientY;
  }, []);

  const handleSheetTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - sheetTouchStartY.current;
    // Only allow dragging downward
    if (deltaY > 0) {
      setSheetTranslateY(deltaY);
    }
  }, []);

  const handleSheetTouchEnd = useCallback(() => {
    // If dragged down more than 100px, close
    if (sheetTranslateY > 100) {
      setDescOpen(false);
    }
    setSheetTranslateY(0);
  }, [sheetTranslateY]);

  // Close description drawer on Escape
  useEffect(() => {
    if (!descOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDescOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [descOpen]);

  // Lock body scroll when description drawer is open
  useEffect(() => {
    if (descOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [descOpen]);

  // Lock body scroll when zoom lightbox is open
  useEffect(() => {
    if (zoomOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [zoomOpen]);

  // Close zoom on Escape
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoomOpen]);

  // Auto-dismiss share toast
  useEffect(() => {
    if (!shareToast) return;
    const t = setTimeout(() => setShareToast(false), 2500);
    return () => clearTimeout(t);
  }, [shareToast]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    // Mobile: native share sheet
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: product.name, url });
      } catch { /* user cancelled */ }
      return;
    }
    // Desktop: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setShareToast(true);
    }
  }, [product.name]);

  const discount = getDiscountPercent(product.price, product.old_price);
  const fav = isFavorite(product.id);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    const selectedSize = selections[displayAttrs[0]?.label] || "";
    const selectedColor = selections[displayAttrs[1]?.label] || "";
    addToCart(product, selectedSize, selectedColor);
    setShowPopup(true);
  };

  // Safe selected image index
  const safeIdx = selectedImage >= galleryImages.length ? 0 : selectedImage;

  return (
    <div>
      {/* ═══ Main Product Grid ═══ */}
      <div className="lg:grid lg:grid-cols-2">

        {/* ── LEFT: Image Gallery (full-bleed, no white bg) ── */}
        <div className="relative">

          {/* Main image — edge-to-edge, same 3:4 ratio as admin crop tool */}
          {/* Both mobile & desktop use aspect-[3/4] to match the cropped image exactly */}
          <div className="aspect-[3/4] lg:sticky lg:top-[130px] overflow-hidden relative bg-gray-100">
            {galleryImages.length > 0 ? (
              <Image
                src={galleryImages[safeIdx]?.url || ""}
                alt={product.name}
                fill
                priority
                loader={cloudinaryLoader}
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-pink-100">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/50 flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-primary/50 font-medium">{product.name}</p>
                </div>
              </div>
            )}

            {/* ── Top-left overlay: breadcrumb only (desktop) ── */}
            <div className="absolute top-2 left-0 z-30 flex flex-col items-start gap-1.5 px-3">
              {/* Breadcrumb — desktop only */}
              <nav className="hidden lg:flex items-center gap-2 text-xs text-white/90 bg-black/40 backdrop-blur-sm rounded-md px-3 py-1.5">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <span className="opacity-60">/</span>
                <Link href="/categories" className="hover:text-white transition-colors">Catégories</Link>
                <span className="opacity-60">/</span>
                <span className="font-medium text-white">{product.name}</span>
              </nav>
            </div>

            <button
              onClick={() => toggleFavorite(product)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-20"
              id="product-fav-btn"
            >
              <svg className={`w-5 h-5 ${fav ? "text-red-500 fill-red-500" : "text-gray-400"}`} viewBox="0 0 24 24" stroke="currentColor" fill={fav ? "currentColor" : "none"} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Agrandir l'image button */}
            <button
              type="button"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-xl transition-all"
              onClick={() => setZoomOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              Agrandir l&apos;image
            </button>
          </div>

          {/* Thumbnails — below main image on mobile, overlaid on left column on desktop */}
          {galleryImages.length > 1 && (
            <>
              {/* Mobile: horizontal scroll below image */}
              <div className="lg:hidden px-4 py-3 bg-white">
                <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {galleryImages.map((imgObj, i) => (
                    <button
                      key={imgObj.url}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-14 h-[70px] overflow-hidden border-2 bg-white transition-all ${
                        safeIdx === i
                          ? "border-primary shadow-md shadow-primary/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={imgObj.url}
                        alt={`${product.name} - ${i + 1}`}
                        width={64}
                        height={80}
                        loader={cloudinaryLoader}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
              {/* Desktop: overlaid vertical column */}
              <div className="hidden lg:block absolute top-14 left-4 z-10">
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)]" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {galleryImages.map((imgObj, i) => (
                    <button
                      key={imgObj.url}
                      onClick={() => setSelectedImage(i)}
                      onMouseEnter={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-20 overflow-hidden border-2 bg-white transition-all ${
                        safeIdx === i
                          ? "border-primary shadow-md shadow-primary/20"
                          : "border-white/80 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={imgObj.url}
                        alt={`${product.name} - ${i + 1}`}
                        width={64}
                        height={80}
                        loader={cloudinaryLoader}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div className="px-4 py-6 lg:px-10 lg:py-8 lg:overflow-y-auto">



          {/* a. Name */}
          <h1 className="text-xl lg:text-2xl font-black text-text leading-tight mb-3">{product.name}</h1>

          {/* b. Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl lg:text-3xl font-black text-text">{formatPrice(product.price)}</span>
            {product.old_price && (
              <span className="text-base text-text-muted line-through">{formatPrice(product.old_price)}</span>
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

          {/* c. Attributes: Color vignettes + Size chips + others */}
          {displayAttrs.map((attr) => {
            const isColor = isColorAttribute(attr.label);
            return (
            <div key={attr.label} className="mb-5">
              <h3 className="text-sm font-bold text-text mb-2">
                {attr.label} : <span className="font-normal text-text-light">{selections[attr.label] || ""}</span>
              </h3>

              {isColor ? (
                <div className="flex gap-2 flex-wrap">
                  {attr.values.map((attrVal) => {
                    const isSelected = selections[attr.label] === attrVal.value;
                    const isAvailable = attrVal.available;
                    const thumb = getColorThumbnail(productImages, attrVal.value);

                    return (
                      <button
                        key={attrVal.value}
                        disabled={!isAvailable}
                        title={!isAvailable ? `${attrVal.value} — Indisponible` : attrVal.value}
                        onClick={() => {
                          if (!isAvailable) return;
                          setSelections({ ...selections, [attr.label]: attrVal.value });
                          setSelectedImage(0);
                        }}
                        className={`relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          !isAvailable
                            ? "border-gray-200 cursor-not-allowed opacity-50"
                            : isSelected
                              ? "border-primary ring-2 ring-primary/30 shadow-md"
                              : "border-gray-200 hover:border-primary/50"
                        }`}
                        aria-label={attrVal.value}
                      >
                        {thumb ? (
                          <Image
                            src={thumb.url}
                            alt={attrVal.value}
                            width={64}
                            height={64}
                            loader={cloudinaryLoader}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[9px] text-gray-400 font-medium text-center px-0.5 leading-tight">
                            {attrVal.value}
                          </div>
                        )}
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <div className="w-full h-px bg-gray-400 rotate-45 origin-center" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {attr.values.map((attrVal) => {
                    const isSelected = selections[attr.label] === attrVal.value;
                    const isAvailable = attrVal.available;

                    return (
                      <button
                        key={attrVal.value}
                        disabled={!isAvailable}
                        title={!isAvailable ? "Indisponible" : undefined}
                        onClick={() => {
                          if (!isAvailable) return;
                          setSelections({ ...selections, [attr.label]: attrVal.value });
                        }}
                        className={`px-4 py-2 rounded-full text-sm border transition-all ${
                          !isAvailable
                            ? "border-gray-200 text-gray-300 line-through cursor-not-allowed opacity-50 bg-gray-50"
                            : isSelected
                              ? "border-primary bg-primary-light text-primary font-medium"
                              : "border-border text-text-light hover:border-primary/50"
                        }`}
                      >
                        {attrVal.value}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })}

          {/* Quantity + Stock indicator — inline */}
          <div className="mb-6 flex items-center gap-4">
            <h3 className="text-sm font-bold text-text">Quantité</h3>
            <div className={`flex items-center gap-0 border border-border rounded-lg overflow-hidden ${product.stock <= 0 ? "opacity-40 pointer-events-none" : ""}`}>
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
            {product.stock > 0 && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                En stock
              </span>
            )}
          </div>

          {/* d. Action Buttons — side by side on desktop, stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* AJOUTER AU PANIER = primary (filled black), first */}
            <button
              onClick={() => {
                if (product.stock <= 0) return;
                handleAddToCart();
              }}
              disabled={product.stock <= 0}
              className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                product.stock <= 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              id="add-to-cart-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
              {product.stock <= 0 ? "INDISPONIBLE" : "AJOUTER AU PANIER"}
            </button>

            {/* ACHETER MAINTENANT = secondary (outline), second */}
            <button
              onClick={() => {
                if (product.stock <= 0) return;
                const selectedSize = selections[displayAttrs[0]?.label] || "";
                const selectedColor = selections[displayAttrs[1]?.label] || "";
                addToCart(product, selectedSize, selectedColor);
                router.push("/cart");
              }}
              disabled={product.stock <= 0}
              className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all ${
                product.stock <= 0
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-black border-black hover:bg-gray-50"
              }`}
              id="order-now-btn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
              ACHETER MAINTENANT
            </button>
          </div>

          {/* e. Trust / Reassurance icons */}
          <div className="grid grid-cols-4 gap-2 py-5 border-t border-b border-border mb-6">
            <div className="text-center">
              <svg className="w-6 h-6 mx-auto text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              <p className="text-[10px] text-text-muted font-medium leading-tight">Livraison rapide</p>
              <p className="text-[9px] text-gray-400">2-4 jours ouvrés</p>
            </div>
            <div className="text-center">
              <svg className="w-6 h-6 mx-auto text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
              <p className="text-[10px] text-text-muted font-medium leading-tight">Paiement à la livraison</p>
              <p className="text-[9px] text-gray-400">Payez à la réception</p>
            </div>
            <div className="text-center">
              <svg className="w-6 h-6 mx-auto text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
              <p className="text-[10px] text-text-muted font-medium leading-tight">Retour facile</p>
              <p className="text-[9px] text-gray-400">Sous 7 jours</p>
            </div>
            <div className="text-center">
              <svg className="w-6 h-6 mx-auto text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>
              <p className="text-[10px] text-text-muted font-medium leading-tight">Service client</p>
              <p className="text-[9px] text-gray-400">7j/7</p>
            </div>
          </div>

          {/* f. Gymshark-style action rows: Description + Share */}
          <div className="border-t border-border">
            {/* Description row */}
            <button
              onClick={() => setDescOpen(true)}
              className="w-full flex items-center justify-between py-4 px-1 border-b border-border text-left group cursor-pointer"
              id="open-description-btn"
            >
              <span className="text-sm font-semibold text-text uppercase tracking-wide">Description</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-text transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Share row */}
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-between py-4 px-1 border-b border-border text-left group cursor-pointer"
              id="share-btn"
            >
              <span className="text-sm font-semibold text-text uppercase tracking-wide">Partager</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-text transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </button>
          </div>

          {/* ── Description Panel ── */}
          {descOpen && (
            <>
              {/* === MOBILE: Bottom Sheet === */}
              <div className="md:hidden fixed inset-0 z-50" onClick={() => setDescOpen(false)}>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 animate-fade-in" />
                {/* Bottom sheet */}
                <div
                  ref={sheetRef}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col animate-slide-up"
                  style={{
                    maxHeight: '75vh',
                    transform: sheetTranslateY > 0 ? `translateY(${sheetTranslateY}px)` : undefined,
                    transition: sheetTranslateY > 0 ? 'none' : 'transform 0.25s ease-out',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={handleSheetTouchStart}
                  onTouchMove={handleSheetTouchMove}
                  onTouchEnd={handleSheetTouchEnd}
                >
                  {/* Drag handle */}
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                  </div>
                  {/* Header */}
                  <div className="flex items-center justify-center px-6 py-3 border-b border-gray-100 flex-shrink-0 relative">
                    <h3 className="text-base font-bold text-gray-900">Description</h3>
                    <button
                      onClick={() => setDescOpen(false)}
                      className="absolute right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Fermer"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto px-5 py-5 overscroll-contain">
                    {product.description ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                          prose-headings:text-gray-900 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide prose-headings:text-sm prose-headings:mt-6 prose-headings:mb-3
                          prose-p:mb-4 prose-ul:mb-4 prose-li:mb-1
                          prose-strong:text-gray-900"
                        dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aucune description disponible.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* === DESKTOP: Slide-from-right Drawer === */}
              <div className="hidden md:block fixed inset-0 z-50" onClick={() => setDescOpen(false)}>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 animate-fade-in" />
                {/* Panel */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-[50%] lg:w-[45%] bg-white shadow-2xl flex flex-col animate-slide-in-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                    <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Description</h3>
                    <button
                      onClick={() => setDescOpen(false)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Fermer"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    {product.description ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                          prose-headings:text-gray-900 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide prose-headings:text-sm prose-headings:mt-6 prose-headings:mb-3
                          prose-p:mb-4 prose-ul:mb-4 prose-li:mb-1
                          prose-strong:text-gray-900"
                        dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aucune description disponible.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Zoom Lightbox Modal ── */}
          {zoomOpen && galleryImages[safeIdx] && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
              onClick={() => setZoomOpen(false)}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/90" />
              {/* Close button */}
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* Full-res image */}
              <div
                className="relative z-10 max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={galleryImages[safeIdx].url}
                  alt={product.name}
                  width={1200}
                  height={1600}
                  loader={cloudinaryLoader}
                  className="max-w-full max-h-[90vh] object-contain"
                  quality={90}
                  priority
                />
              </div>
            </div>
          )}

          {/* ── Share Toast ── */}
          {shareToast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl animate-fade-in flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Lien copié !
            </div>
          )}
        </div>
      </div>

      {/* ── Cart Added Popup (right drawer) ── */}
      {showPopup && (
        <div className="fixed inset-0 z-50" onClick={() => setShowPopup(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white shadow-2xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
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
            <div className="px-6 py-6 flex gap-4 border-b border-gray-100">
              <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                {productImages[0] && (
                  <Image
                    src={productImages[0].url}
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
            <div className="flex-1" />
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
      <div className="max-w-7xl mx-auto px-4">
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
