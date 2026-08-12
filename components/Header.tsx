"use client";

import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import { useState, useEffect, useRef } from "react";
import type { Category } from "@/lib/types";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  // Hide on admin/login pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;

  const cartCount = useStore((s) => s.getCartCount());
  const favCount = useStore((s) => s.getFavoritesCount());
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const [headerCategories, setHeaderCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isHomepage = pathname === "/";
  const scrolled = isHomepage ? scrollY > 20 : true;

  const activeCat = searchParams.get("cat");
  const activeFilter = searchParams.get("filter");

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch categories from API for dynamic nav
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
      .catch(() => { });
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menu/search on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, searchParams]);

  function isActive(link: { href: string; slug: string | null; label: string }) {
    if (link.href === "/") return !activeCat && !activeFilter;
    if (link.slug && activeCat === link.slug) return true;
    if (link.label === "NOUVEAUTES" && activeFilter === "new") return true;
    if (link.label === "PROMOTIONS" && pathname === "/promotions") return true;
    return false;
  }

  // Build dynamic nav links
  const navLinks: { label: string; href: string; slug: string | null }[] = [
    { label: "ACCUEIL", href: "/", slug: null },
    { label: "NOUVEAUTES", href: "/?filter=new", slug: null },
    ...headerCategories.map((c) => ({
      label: c.name.toUpperCase(),
      href: `/?cat=${c.slug}`,
      slug: c.slug,
    })),
    { label: "PROMOTIONS", href: "/promotions", slug: null },
  ];

  const iconColor = scrolled ? "text-gray-700 hover:text-primary" : "text-white/90 hover:text-white";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <>
      <header
        className={`hidden md:block fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
          }`}
      >
        {/* == Top Bar == */}
        <div className={`py-1.5 px-4 transition-colors duration-300 ${scrolled ? "border-b border-border/30" : ""}`}>
          <div className="max-w-[1536px] mx-auto flex items-center justify-between text-[11px]">
            <div className={`flex items-center gap-5 transition-colors duration-300 font-semibold ${scrolled ? "text-text-light" : "text-white/80"}`}>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Livraison Rapide - 69 Wilayas
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Paiement a la Livraison
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Retour Facile - 7 jours
              </span>
            </div>
            <div className={`flex items-center gap-3 transition-colors duration-300 font-semibold ${scrolled ? "text-text-light" : "text-white/80"}`}>
              <span className="mr-1">Suivez-nous</span>
              <a href="#" className={`${scrolled ? "hover:text-primary" : "hover:text-white"} transition-colors`} aria-label="Instagram">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="#" className={`${scrolled ? "hover:text-primary" : "hover:text-white"} transition-colors`} aria-label="Facebook">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" className={`${scrolled ? "hover:text-primary" : "hover:text-white"} transition-colors`} aria-label="TikTok">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
              </a>
            </div>
          </div>
        </div>

        {/* == Main Header Row: 3-column grid == */}
        <div className={`transition-colors duration-300 ${scrolled ? "border-b border-border" : ""}`}>
          <div className="max-w-[1536px] mx-auto px-4 py-3 grid grid-cols-3 items-center">
            {/* Left: Menu + Search */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <button
                onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}
                className={`flex items-center gap-1.5 transition-colors ${iconColor}`}
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <span className={`text-sm font-medium ${scrolled ? "text-gray-700" : "text-white/90"}`}>Menu</span>
              </button>

              {/* Search Icon */}
              <button
                onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
                className={`flex items-center gap-1.5 transition-colors ${iconColor}`}
                aria-label="Rechercher"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <span className={`text-sm font-medium ${scrolled ? "text-gray-700" : "text-white/90"}`}>Rechercher</span>
              </button>
            </div>

            {/* Center: Logo (absolutely centered) */}
            <div className="flex justify-center">
              <Link href="/" className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logoShein.png"
                  alt="SHEIN outlet"
                  className={`h-12 w-auto transition-all duration-300 ${
                    scrolled ? "" : "brightness-0 invert drop-shadow-md"
                  }`}
                />
              </Link>
            </div>

            {/* Right: Contact Us + Favorites + Cart */}
            <div className="flex items-center justify-end gap-5">
              <Link
                href="#footer"
                className={`text-sm font-medium transition-colors hidden lg:block ${scrolled ? "text-gray-700 hover:text-primary" : "text-white/90 hover:text-white"}`}
              >
                Contact Us
              </Link>
              <Link href="/favorites" className={`flex flex-col items-center transition-colors relative ${iconColor}`} id="header-favorites">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {mounted && favCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{favCount}</span>
                )}
              </Link>
              <Link href="/cart" className={`flex flex-col items-center transition-colors relative ${iconColor}`} id="header-cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* == Search Dropdown == */}
        {searchOpen && (
          <div className="absolute left-0 right-0 bg-white shadow-lg border-b border-gray-200 animate-slide-in-right">
            <div className="max-w-2xl mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="flex-1 py-2 text-base outline-none border-b-2 border-gray-200 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* == Menu Drawer Overlay == */}
      {menuOpen && (
        <div className="hidden md:block fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl animate-slide-in-left flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logoShein.png" alt="SHEIN outlet" className="h-7 w-auto" />
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
                    className={`block px-6 py-3.5 text-sm font-semibold transition-colors border-b border-gray-50 ${active
                      ? "text-primary bg-primary/5"
                      : "text-gray-800 hover:text-primary hover:bg-gray-50"
                      } ${link.label === "PROMOTIONS" ? "!text-[#ff4a79]" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
