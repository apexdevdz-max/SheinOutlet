"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import type { Category } from "@/lib/types";

export function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const favCount = useStore((s) => s.getFavoritesCount());
  const cartCount = useStore((s) => s.getCartCount());
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [headerCategories, setHeaderCategories] = useState<Category[]>([]);

  const activeCat = searchParams.get("cat");
  const activeFilter = searchParams.get("filter");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats: Category[]) => {
        if (Array.isArray(cats)) {
          setHeaderCategories(
            cats
              .filter((c) => !c.parent_id && c.show_in_header)
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Close menu/search on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, searchParams]);

  // Focus search input
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const navLinks = [
    { label: "ACCUEIL", href: "/", slug: null as string | null },
    { label: "NOUVEAUTÉS", href: "/?filter=new", slug: null as string | null },
    ...headerCategories.map((c) => ({
      label: c.name.toUpperCase(),
      href: `/?cat=${c.slug}`,
      slug: c.slug,
    })),
    { label: "PROMOTIONS", href: "/promotions", slug: null as string | null },
  ];

  function isActive(link: { href: string; slug: string | null; label: string }) {
    if (link.href === "/") return !activeCat && !activeFilter;
    if (link.slug && activeCat === link.slug) return true;
    if (link.label === "NOUVEAUTÉS" && activeFilter === "new") return true;
    if (link.label === "PROMOTIONS" && pathname === "/promotions") return true;
    return false;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 1) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const iconColor = scrolled ? "text-gray-700 hover:text-primary" : "text-white/90 hover:text-white";

  return (
    <>
      {/* ── Mobile Header ── */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="px-3 py-2.5 grid grid-cols-3 items-center">
          {/* Left: Hamburger + Search (icons only) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setMenuOpen(true); setSearchOpen(false); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${iconColor}`}
              aria-label="Menu"
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <button
              onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${iconColor}`}
              aria-label="Rechercher"
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logoShein.png"
                alt="SHEIN outlet"
                className={`w-28 h-auto transition-all duration-300 ${
                  scrolled ? "" : "brightness-0 invert drop-shadow-sm"
                }`}
              />
            </Link>
          </div>

          {/* Right: Contact + Favorites + Cart (icons only) */}
          <div className="flex items-center justify-end gap-0.5">
            {/* Favorites */}
            <Link
              href="/favorites"
              className={`w-9 h-9 rounded-full flex items-center justify-center relative transition-colors ${iconColor}`}
              aria-label="Favoris"
            >
              <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>
            {/* Cart */}
            <Link
              href="/cart"
              className={`w-9 h-9 rounded-full flex items-center justify-center relative transition-colors ${iconColor}`}
              aria-label="Panier"
            >
              <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Search overlay (fullscreen premium) ── */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          />

          {/* Content */}
          <div className="relative z-10 w-full px-5 pt-16 animate-fade-in-up">
            {/* Close button */}
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logoShein.png"
                alt="SHEIN outlet"
                className="h-8 w-auto brightness-0 invert drop-shadow-lg"
              />
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch}>
              <div className="flex items-center bg-white rounded-2xl shadow-lg px-5 py-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  autoFocus
                  placeholder="Rechercher un produit"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-3 text-sm text-gray-800 placeholder-gray-400 bg-transparent appearance-none"
                  style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                />
                {/* Right icons group: clear + submit */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-full text-gray-500 hover:text-primary hover:bg-pink-50 transition-colors flex items-center justify-center"
                    aria-label="Rechercher"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            {/* Popular searches */}
            <div className="mt-6">
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest mb-2.5">Recherches populaires</p>
              <div className="flex flex-wrap gap-2">
                {["Robes", "Sacs", "Chaussures", "T-shirts", "Accessoires", "Nouveautés"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(term)}`);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium hover:bg-white/20 hover:text-white transition-all border border-white/10"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Menu Drawer ── */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-in-left flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logoShein.png" alt="SHEIN outlet" className="h-6 w-auto" />
              <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Drawer Links */}
            <nav className="flex-1 overflow-y-auto py-2">
              {navLinks.map((link) => {
                const active = isActive(link);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-5 py-3.5 text-sm font-semibold transition-colors border-b border-gray-50 ${
                      active
                        ? "text-primary bg-primary/5"
                        : "text-gray-800 hover:text-primary hover:bg-gray-50"
                    } ${link.label === "PROMOTIONS" ? "!text-[#ff4a79]" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {/* Contact Us */}
              <Link
                href="#footer"
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-3.5 text-sm font-semibold transition-colors border-t border-gray-200 mt-2 text-gray-800 hover:text-primary hover:bg-gray-50"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
