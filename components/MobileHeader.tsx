"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store/useStore";

const NAV_TABS = [
  { label: "Tout", cat: null, filter: null },
  { label: "Nouveautés", cat: null, filter: "new" },
  { label: "Femme", cat: "femme", filter: null },
  { label: "Homme", cat: "homme", filter: null },
  { label: "Chaussures", cat: "chaussures", filter: null },
  { label: "Sacs", cat: "sacs-accessoires", filter: null },
  { label: "Promos", cat: null, filter: "promo" },
];

export function MobileHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const favCount = useStore((s) => s.getFavoritesCount());
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeCat = searchParams.get("cat");
  const activeFilter = searchParams.get("filter");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 1) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  function tabHref(tab: (typeof NAV_TABS)[0]) {
    if (tab.cat) return `/?cat=${tab.cat}`;
    if (tab.filter) return `/?filter=${tab.filter}`;
    return "/";
  }
  function isTabActive(tab: (typeof NAV_TABS)[0]) {
    if (!tab.cat && !tab.filter) return !activeCat && !activeFilter;
    if (tab.cat) return activeCat === tab.cat;
    if (tab.filter) return activeFilter === tab.filter;
    return false;
  }

  return (
    <>
      {/* ── Fixed header container (icons + category tabs) ── */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        {/* Row 1: Search icon — Logo — Favorites */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setSearchOpen(true)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              scrolled ? "text-text hover:bg-gray-100" : "text-white/90 hover:bg-white/20"
            }`}
            aria-label="Rechercher"
          >
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span
              className={`text-xl font-black tracking-tight transition-colors duration-300 ${
                scrolled ? "text-text" : "text-white drop-shadow-sm"
              }`}
            >
              SHEIN{" "}
              <span className="text-primary italic relative">
                outlet
                <svg className="absolute -top-1.5 -right-2 w-2 h-2 text-primary fill-primary" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
            </span>
          </Link>

          <Link
            href="/favorites"
            className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-colors ${
              scrolled ? "text-text hover:bg-gray-100" : "text-white/90 hover:bg-white/20"
            }`}
            aria-label="Favoris"
          >
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {favCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {favCount}
              </span>
            )}
          </Link>
        </div>

        {/* Row 2: Category tabs — transparent, scrollable horizontally */}
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-0.5 px-3 pb-2 min-w-max">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.label}
                href={tabHref(tab)}
                className={`px-3.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  isTabActive(tab)
                    ? scrolled
                      ? "bg-primary text-white"
                      : "bg-white/25 text-white font-bold backdrop-blur-sm"
                    : scrolled
                      ? "text-text-light hover:text-primary"
                      : "text-white/80 hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search overlay (fullscreen) ── */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <button
              onClick={() => setSearchOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-text hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <form onSubmit={handleSearch} className="flex-1 flex">
              <input
                type="text"
                autoFocus
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 pl-3 pr-2 py-2.5 bg-gray-50 border border-border rounded-l-full text-sm outline-none focus:border-primary/40"
              />
              <button
                type="submit"
                className="px-4 bg-[#ff4a79] text-white rounded-r-full flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
          <div className="px-6 py-8 text-center text-text-muted text-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Tapez pour rechercher parmi nos produits
          </div>
        </div>
      )}
    </>
  );
}
