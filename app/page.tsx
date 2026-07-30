"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { FlashSaleCountdown } from "@/components/FlashSaleCountdown";
import { SearchBar } from "@/components/SearchBar";
import { getMockBestSellers, getMockFlashSaleProducts, getParentCategories } from "@/lib/mock-data";
import { useStore } from "@/lib/store/useStore";

export default function HomePage() {
  const bestSellers = getMockBestSellers();
  const flashProducts = getMockFlashSaleProducts();
  const parentCats = getParentCategories();
  const cartCount = useStore((s) => s.getCartCount());

  return (
    <div className="pb-4">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar />
          </div>
          <Link href="/account" className="flex flex-col items-center text-text-light" id="mobile-account">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[9px]">Compte</span>
          </Link>
          <Link href="/favorites" className="flex flex-col items-center text-text-light" id="mobile-fav">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-[9px]">Favoris</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center text-text-light relative" id="mobile-cart">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-[9px]">Panier</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="hero-gradient relative overflow-hidden" id="hero-banner">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 lg:py-20">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex-1 text-center md:text-left z-10">
              <p className="text-sm md:text-base font-medium text-text-light mb-2 animate-fade-in">NOUVELLE COLLECTION</p>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-text mb-1 animate-slide-up">
                JUSQU&apos;À
              </h2>
              <div className="text-6xl md:text-8xl lg:text-9xl font-black text-primary mb-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                -70%
              </div>
              <p className="text-sm md:text-base text-text-light mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                sur vos articles préférés
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-8 py-3.5 rounded-full hover:bg-gray-800 transition-all hover:shadow-xl animate-fade-in group"
                style={{ animationDelay: "0.3s" }}
                id="hero-cta"
              >
                ACHETER MAINTENANT
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="w-64 h-80 md:w-80 md:h-96 mx-auto rounded-3xl bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="text-4xl font-black text-white/80 mb-2">SHEIN</div>
                  <div className="text-xl italic text-primary-dark font-bold">outlet</div>
                  <div className="mt-4 bg-white/40 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-medium text-primary-dark">
                    MEILLEURS PRIX ✦ QUALITÉ GARANTIE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 py-8" id="category-shortcuts">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {parentCats.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/categories?cat=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary-light to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <span className="text-primary font-bold text-sm">{cat.name.slice(0, 3)}</span>
              </div>
              <div className="text-center">
                <h3 className="text-xs md:text-sm font-bold text-text">{cat.name}</h3>
                <p className="text-[10px] text-primary flex items-center gap-0.5 mt-0.5">
                  Voir plus
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="max-w-7xl mx-auto py-6">
        <FlashSaleCountdown />
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 py-8" id="best-sellers">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-2xl font-black text-text">MEILLEURES VENTES</h2>
          <Link href="/categories?filter=best" className="text-sm text-text-light hover:text-primary transition-colors flex items-center gap-1">
            Voir tout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
          {bestSellers.map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Reassurance Bar */}
      <section className="max-w-7xl mx-auto px-4 py-8" id="reassurance">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: "🚚", title: "LIVRAISON RAPIDE", desc: "Partout en Algérie" },
            { icon: "💰", title: "PAIEMENT", desc: "Payez à la réception" },
            { icon: "↩️", title: "RETOUR FACILE", desc: "Sous 7 jours" },
            { icon: "💬", title: "SERVICE CLIENT", desc: "7/7 à votre écoute" },
          ].map((item) => (
            <div key={item.title} className="reassurance-item bg-white border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
              <span className="text-2xl mb-2">{item.icon}</span>
              <h4 className="text-xs font-bold text-text">{item.title}</h4>
              <p className="text-[10px] text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale Products */}
      <section className="max-w-7xl mx-auto px-4 py-8" id="flash-products">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-2xl font-black text-text flex items-center gap-2">
            ⚡ OFFRES FLASH
          </h2>
          <Link href="/categories?filter=flash" className="text-sm text-text-light hover:text-primary transition-colors flex items-center gap-1">
            Voir tout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
          {flashProducts.map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banners */}
      <section className="max-w-7xl mx-auto px-4 py-8" id="promo-banners">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="promo-gradient rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer group">
            <div>
              <h3 className="text-lg font-black text-primary-dark">BON D&apos;ACHAT</h3>
              <p className="text-sm text-text-light">Disponible maintenant !</p>
            </div>
            <div className="text-2xl font-black text-primary/30 group-hover:text-primary/50 transition-colors">
              SHEIN<br /><span className="italic text-sm">outlet</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
            <div>
              <h3 className="text-lg font-black text-text">NOUVEAUTÉS</h3>
              <p className="text-sm text-text-light">Chaque semaine</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-pink-200/50 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
            <div>
              <h3 className="text-lg font-black text-text">REJOIGNEZ-NOUS</h3>
              <p className="text-sm text-text-light">sur Instagram</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
