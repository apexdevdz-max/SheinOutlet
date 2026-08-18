"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Product } from "@/lib/types";

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */

interface FacetOption {
  value: string;
  count: number;
}

interface Facet {
  label: string;
  options: FacetOption[];
}

type SortKey = "default" | "price-asc" | "price-desc" | "newest";

interface FilterState {
  selectedAttrs: Record<string, Set<string>>;
  priceMin: number;
  priceMax: number;
  inStockOnly: boolean;
  sortBy: SortKey;
}

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

/* Standard size order for sorting */
const SIZE_ORDER: Record<string, number> = {
  xxs: 1, xs: 2, s: 3, m: 4, l: 5, xl: 6, xxl: 7, "2xl": 7,
  "3xl": 8, "4xl": 9, "5xl": 10, "6xl": 11,
};

function isLikelySizeLabel(label: string): boolean {
  const l = label.toLowerCase();
  return l === "taille" || l === "tailles" || l === "size" || l === "sizes";
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function sortFacetOptions(label: string, options: FacetOption[]): FacetOption[] {
  if (isLikelySizeLabel(label)) {
    return [...options].sort((a, b) => {
      const aIdx = SIZE_ORDER[a.value.toLowerCase()] ?? 100;
      const bIdx = SIZE_ORDER[b.value.toLowerCase()] ?? 100;
      if (aIdx !== bIdx) return aIdx - bIdx;
      // Numeric sizes (38, 39, 40…)
      const aNum = parseFloat(a.value);
      const bNum = parseFloat(b.value);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.value.localeCompare(b.value);
    });
  }
  return [...options].sort((a, b) => a.value.localeCompare(b.value));
}

function extractFacets(products: Product[]): Facet[] {
  // Use a case-insensitive map: key = lowercased value, store canonical (capitalized) form
  const facetMap = new Map<string, Map<string, { canonical: string; count: number }>>();

  for (const p of products) {
    if (!p.attributes) continue;
    for (const attr of p.attributes) {
      if (!attr.label || !attr.values) continue;
      const label = attr.label.trim();
      let optMap = facetMap.get(label);
      if (!optMap) {
        optMap = new Map();
        facetMap.set(label, optMap);
      }
      for (const v of attr.values) {
        const key = v.trim().toLowerCase();
        if (!key) continue;
        const existing = optMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          optMap.set(key, { canonical: capitalize(v.trim()), count: 1 });
        }
      }
    }
  }

  const facets: Facet[] = [];
  facetMap.forEach((optMap, label) => {
    const options: FacetOption[] = [];
    optMap.forEach(({ canonical, count }) => {
      options.push({ value: canonical, count });
    });
    facets.push({ label, options: sortFacetOptions(label, options) });
  });

  return facets.sort((a, b) => a.label.localeCompare(b.label));
}

function getPriceRange(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 100000];
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return [Math.floor(min), Math.ceil(max)];
}

function formatPrice(n: number): string {
  return n.toLocaleString("fr-DZ") + " DA";
}

function applyFilters(products: Product[], filters: FilterState): Product[] {
  let result = products;

  // Attribute filters (case-insensitive matching)
  for (const [label, selectedValues] of Object.entries(filters.selectedAttrs)) {
    if (selectedValues.size === 0) continue;
    // Build a lowercase set for comparison
    const lowerSelected = new Set<string>();
    selectedValues.forEach((v) => lowerSelected.add(v.toLowerCase()));
    result = result.filter((p) => {
      if (!p.attributes) return false;
      const attr = p.attributes.find((a) => a.label === label);
      if (!attr) return false;
      return attr.values.some((v) => lowerSelected.has(v.toLowerCase()));
    });
  }

  // Price range
  result = result.filter(
    (p) => p.price >= filters.priceMin && p.price <= filters.priceMax
  );

  // Stock
  if (filters.inStockOnly) {
    result = result.filter((p) => p.stock > 0);
  }

  // Sort
  switch (filters.sortBy) {
    case "price-asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
  }

  return result;
}

/* ══════════════════════════════════════════════════════════
   SVG Icons
   ══════════════════════════════════════════════════════════ */

function IconFilter({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function IconChevron({ open, className = "w-4 h-4" }: { open: boolean; className?: string }) {
  return (
    <svg className={`${className} transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconX({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconSort({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   Accordion Section (shared by mobile & desktop)
   ══════════════════════════════════════════════════════════ */

function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3.5 text-sm font-semibold text-gray-800 hover:text-primary transition-colors"
      >
        {title}
        <IconChevron open={open} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-[500px] opacity-100 pb-3" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Price Range Slider
   ══════════════════════════════════════════════════════════ */

function PriceRangeSlider({
  absMin,
  absMax,
  min,
  max,
  onChange,
}: {
  absMin: number;
  absMax: number;
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  if (absMin === absMax) return null;

  const leftPct = ((min - absMin) / (absMax - absMin)) * 100;
  const rightPct = ((max - absMin) / (absMax - absMin)) * 100;

  return (
    <div className="space-y-3">
      {/* Track */}
      <div className="relative h-1.5 bg-gray-200 rounded-full mt-2">
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={absMin}
          max={absMax}
          step={100}
          value={min}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(Math.min(v, max - 100), max);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
          style={{ top: 0 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={absMin}
          max={absMax}
          step={100}
          value={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(min, Math.max(v, min + 100));
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
          style={{ top: 0 }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
          {formatPrice(min)}
        </span>
        <span className="text-[10px] text-gray-400">—</span>
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
          {formatPrice(max)}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Unified Filter Panel Content
   (shared between mobile bottom sheet & desktop side drawer)
   ══════════════════════════════════════════════════════════ */

function UnifiedFilterContent({
  facets,
  absMin,
  absMax,
  filters,
  setFilters,
  activeCount,
  onReset,
}: {
  facets: Facet[];
  absMin: number;
  absMax: number;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  activeCount: number;
  onReset: () => void;
}) {
  function toggleAttrValue(label: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev, selectedAttrs: { ...prev.selectedAttrs } };
      const existing = new Set(prev.selectedAttrs[label] || []);
      if (existing.has(value)) {
        existing.delete(value);
      } else {
        existing.add(value);
      }
      next.selectedAttrs[label] = existing;
      return next;
    });
  }

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "default", label: "Par défaut" },
    { key: "newest", label: "Nouveautés" },
    { key: "price-asc", label: "Prix croissant" },
    { key: "price-desc", label: "Prix décroissant" },
  ];

  return (
    <div className="space-y-0">
      {/* ── Sort (open by default) ── */}
      <AccordionSection title="Trier par" defaultOpen={true}>
        <div className="space-y-0.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilters((f) => ({ ...f, sortBy: opt.key }))}
              className="flex items-center gap-3 w-full py-2 text-left"
            >
              <div
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  filters.sortBy === opt.key ? "border-gray-900" : "border-gray-300"
                }`}
              >
                {filters.sortBy === opt.key && (
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                )}
              </div>
              <span
                className={`text-sm ${
                  filters.sortBy === opt.key
                    ? "font-semibold text-gray-900"
                    : "text-gray-600"
                }`}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* ── Price Range ── */}
      {absMin < absMax && (
        <AccordionSection title="Prix">
          <PriceRangeSlider
            absMin={absMin}
            absMax={absMax}
            min={filters.priceMin}
            max={filters.priceMax}
            onChange={(min, max) =>
              setFilters((f) => ({ ...f, priceMin: min, priceMax: max }))
            }
          />
        </AccordionSection>
      )}

      {/* ── Availability ── */}
      <AccordionSection title="Disponibilité">
        <label className="flex items-center gap-3 cursor-pointer py-1">
          <div
            onClick={() =>
              setFilters((f) => ({ ...f, inStockOnly: !f.inStockOnly }))
            }
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
              filters.inStockOnly ? "bg-primary" : "bg-gray-200"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                filters.inStockOnly ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm text-gray-700">En stock uniquement</span>
        </label>
      </AccordionSection>

      {/* ── Dynamic attribute facets ── */}
      {facets.map((facet) => (
        <AccordionSection key={facet.label} title={facet.label}>
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {facet.options.map((opt) => {
              const checked =
                filters.selectedAttrs[facet.label]?.has(opt.value) || false;
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAttrValue(facet.label, opt.value)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer accent-[var(--color-primary)]"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {opt.value}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    ({opt.count})
                  </span>
                </label>
              );
            })}
          </div>
        </AccordionSection>
      ))}

      {/* ── Reset ── */}
      {activeCount > 0 && (
        <div className="pt-3">
          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Active Filter Chips
   ══════════════════════════════════════════════════════════ */

function ActiveFilterChips({
  filters,
  absMin,
  absMax,
  setFilters,
  onReset,
  resultCount,
}: {
  filters: FilterState;
  absMin: number;
  absMax: number;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  resultCount: number;
}) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  // Attribute chips
  for (const [label, values] of Object.entries(filters.selectedAttrs)) {
    values.forEach((v) => {
      chips.push({
        key: `${label}-${v}`,
        label: `${label}: ${v}`,
        onRemove: () => {
          setFilters((prev) => {
            const next = {
              ...prev,
              selectedAttrs: { ...prev.selectedAttrs },
            };
            const updated = new Set(prev.selectedAttrs[label]);
            updated.delete(v);
            next.selectedAttrs[label] = updated;
            return next;
          });
        },
      });
    });
  }

  // Price chip
  if (filters.priceMin > absMin || filters.priceMax < absMax) {
    chips.push({
      key: "price",
      label: `Prix: ${formatPrice(filters.priceMin)} – ${formatPrice(filters.priceMax)}`,
      onRemove: () =>
        setFilters((f) => ({ ...f, priceMin: absMin, priceMax: absMax })),
    });
  }

  // Stock chip
  if (filters.inStockOnly) {
    chips.push({
      key: "stock",
      label: "En stock",
      onRemove: () => setFilters((f) => ({ ...f, inStockOnly: false })),
    });
  }

  // Sort chip
  const sortLabels: Record<SortKey, string> = {
    default: "",
    newest: "Nouveautés",
    "price-asc": "Prix croissant",
    "price-desc": "Prix décroissant",
  };
  if (filters.sortBy !== "default") {
    chips.push({
      key: "sort",
      label: `Tri: ${sortLabels[filters.sortBy]}`,
      onRemove: () => setFilters((f) => ({ ...f, sortBy: "default" })),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3 mt-2">
      <span className="text-xs text-gray-500 font-medium">
        {resultCount} produit{resultCount > 1 ? "s" : ""}
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <IconX />
          </button>
        </span>
      ))}
      <button
        onClick={onReset}
        className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors ml-1"
      >
        Tout effacer
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Export: ProductFilterSidebar
   ══════════════════════════════════════════════════════════ */

export function ProductFilterSidebar({
  products,
  children,
}: {
  products: Product[];
  children: (filtered: Product[]) => React.ReactNode;
}) {
  const [absMin, absMax] = useMemo(() => getPriceRange(products), [products]);

  const [filters, setFilters] = useState<FilterState>({
    selectedAttrs: {},
    priceMin: absMin,
    priceMax: absMax,
    inStockOnly: false,
    sortBy: "default",
  });

  // Reset price range when products change
  useEffect(() => {
    setFilters((f) => ({ ...f, priceMin: absMin, priceMax: absMax }));
  }, [absMin, absMax]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  // Filtered products
  const filtered = useMemo(
    () => applyFilters(products, filters),
    [products, filters]
  );

  // Extract base facets from source products
  const baseFacets = useMemo(() => extractFacets(products), [products]);

  // Live-recount options based on current filters
  const liveFacets = useMemo(() => {
    return baseFacets
      .map((facet) => {
        const otherFilters: FilterState = {
          ...filters,
          selectedAttrs: { ...filters.selectedAttrs },
        };
        delete otherFilters.selectedAttrs[facet.label];
        const subset = applyFilters(products, otherFilters);

        const countMap = new Map<string, number>();
        for (const p of subset) {
          if (!p.attributes) continue;
          const attr = p.attributes.find((a) => a.label === facet.label);
          if (!attr) continue;
          for (const v of attr.values) {
            countMap.set(v, (countMap.get(v) || 0) + 1);
          }
        }

        return {
          label: facet.label,
          options: facet.options
            .map((opt) => ({ ...opt, count: countMap.get(opt.value) || 0 }))
            .filter((opt) => opt.count > 0),
        };
      })
      .filter((f) => f.options.length > 0);
  }, [baseFacets, products, filters]);

  // Count active filters
  const activeCount = useMemo(() => {
    let count = 0;
    for (const vals of Object.values(filters.selectedAttrs)) {
      count += vals.size;
    }
    if (filters.priceMin > absMin || filters.priceMax < absMax) count++;
    if (filters.inStockOnly) count++;
    if (filters.sortBy !== "default") count++;
    return count;
  }, [filters, absMin, absMax]);

  const resetFilters = useCallback(() => {
    setFilters({
      selectedAttrs: {},
      priceMin: absMin,
      priceMax: absMax,
      inStockOnly: false,
      sortBy: "default",
    });
  }, [absMin, absMax]);

  // Don't show filters if there's nothing to filter
  const hasFilters = liveFacets.length > 0 || absMin < absMax;

  if (!hasFilters) {
    return <>{children(filtered)}</>;
  }

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "default", label: "Par défaut" },
    { key: "newest", label: "Nouveautés" },
    { key: "price-asc", label: "Prix croissant" },
    { key: "price-desc", label: "Prix décroissant" },
  ];

  return (
    <div>
      {/* ── Mobile: Sticky bar ── */}
      <div className="lg:hidden sticky top-[52px] z-30 bg-white border-b border-gray-200 -mx-4 px-4">
        <div className="flex items-center justify-between py-2.5">
          <button
            onClick={() => setSortSheetOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-800"
          >
            <IconSort className="w-4 h-4" />
            Trier
          </button>
          <span className="text-xs text-gray-400 font-medium">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-800"
          >
            Filtrer
            <IconFilter className="w-4 h-4" />
            {activeCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center -ml-0.5">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Desktop: "FILTER & SORT" (right-aligned, minimal) ── */}
      <div className="hidden lg:flex items-center justify-end mb-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2.5 text-sm font-semibold tracking-wider text-gray-900 hover:text-primary transition-colors uppercase"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Filter & Sort
          {activeCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Active chips */}
      <ActiveFilterChips
        filters={filters}
        absMin={absMin}
        absMax={absMax}
        setFilters={setFilters}
        onReset={resetFilters}
        resultCount={filtered.length}
      />

      {/* Product grid */}
      {children(filtered)}

      {/* ══════════════════════════════════════════════════
         UNIFIED DRAWER / BOTTOM SHEET
         Mobile: slides from bottom
         Desktop: slides from right
         ══════════════════════════════════════════════════ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
          />

          {/* ── Mobile: Bottom Sheet ── */}
          <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
            {/* Grab handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <IconFilter className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-gray-800">
                  Filtrer & Trier
                </h3>
                {activeCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <IconX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              <UnifiedFilterContent
                facets={liveFacets}
                absMin={absMin}
                absMax={absMax}
                filters={filters}
                setFilters={setFilters}
                activeCount={activeCount}
                onReset={resetFilters}
              />
            </div>

            {/* Footer button */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Voir {filtered.length} produit
                {filtered.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>

          {/* ── Desktop: Right Side Drawer ── */}
          <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-[400px] max-w-[90vw] bg-white shadow-2xl animate-slide-in-right flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <IconFilter className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-gray-800">
                  Filtrer & Trier
                </h3>
                {activeCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <IconX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <UnifiedFilterContent
                facets={liveFacets}
                absMin={absMin}
                absMax={absMax}
                filters={filters}
                setFilters={setFilters}
                activeCount={activeCount}
                onReset={resetFilters}
              />
            </div>

            {/* Footer button */}
            <div className="px-6 py-5 border-t border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Voir {filtered.length} produit
                {filtered.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Sort Bottom Sheet ── */}
      {sortSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSortSheetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="px-5 pb-8 pt-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setFilters((f) => ({ ...f, sortBy: opt.key }));
                    setSortSheetOpen(false);
                  }}
                  className="flex items-center gap-3 w-full py-3.5 border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      filters.sortBy === opt.key
                        ? "border-gray-900"
                        : "border-gray-300"
                    }`}
                  >
                    {filters.sortBy === opt.key && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      filters.sortBy === opt.key
                        ? "font-semibold text-gray-900"
                        : "text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
