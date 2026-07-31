"use client";

import { useState } from "react";

export interface Filters {
  minPrice: number | null;
  maxPrice: number | null;
  sizes: string[];
  colors: string[];
  promo: boolean;
  newOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  minPrice: null,
  maxPrice: null,
  sizes: [],
  colors: [],
  promo: false,
  newOnly: false,
};

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42"];
const ALL_COLORS = [
  { name: "Noir", hex: "#111" },
  { name: "Blanc", hex: "#fff" },
  { name: "Rose", hex: "#f472b6" },
  { name: "Rouge", hex: "#ef4444" },
  { name: "Bleu", hex: "#3b82f6" },
  { name: "Vert", hex: "#22c55e" },
  { name: "Beige", hex: "#d4a574" },
  { name: "Doré", hex: "#d4af37" },
];

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  totalResults?: number;
}

/* ─── Desktop sidebar (always visible) ─── */
export function FilterSidebar({ filters, onChange, totalResults }: FilterPanelProps) {
  return (
    <aside className="hidden lg:block w-60 shrink-0 sticky top-28 self-start">
      <div className="bg-white border border-border rounded-xl p-4 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text">FILTRES</h3>
          {totalResults !== undefined && (
            <span className="text-[11px] text-text-muted">{totalResults} résultat{totalResults !== 1 ? "s" : ""}</span>
          )}
        </div>
        <FilterContent filters={filters} onChange={onChange} />
      </div>
    </aside>
  );
}

/* ─── Mobile bottom sheet ─── */
export function FilterMobileButton({ filters, onChange, totalResults }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const activeCount = countActive(filters);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-border rounded-full text-xs font-semibold text-text hover:border-primary/40 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtres
        {activeCount > 0 && (
          <span className="w-4.5 h-4.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-4 pt-3 pb-2 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text">Filtres</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-text-muted hover:text-text">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-5">
              <FilterContent filters={filters} onChange={onChange} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-border p-3 flex gap-2">
              <button
                onClick={() => { onChange(DEFAULT_FILTERS); setOpen(false); }}
                className="flex-1 py-2.5 text-xs font-semibold border border-border rounded-full hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                Appliquer{totalResults !== undefined ? ` (${totalResults})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Shared filter content ─── */
function FilterContent({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <>
      {/* Price */}
      <div>
        <h4 className="text-xs font-semibold text-text mb-2">Prix (DA)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-3 py-2 border border-border rounded-lg text-xs focus:border-primary/40 outline-none"
          />
          <span className="text-text-muted text-xs self-center">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-3 py-2 border border-border rounded-lg text-xs focus:border-primary/40 outline-none"
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="text-xs font-semibold text-text mb-2">Taille</h4>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SIZES.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() =>
                  update({
                    sizes: active
                      ? filters.sizes.filter((s) => s !== size)
                      : [...filters.sizes, size],
                  })
                }
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-text border-border hover:border-primary/40"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-xs font-semibold text-text mb-2">Couleur</h4>
        <div className="flex flex-wrap gap-2">
          {ALL_COLORS.map((c) => {
            const active = filters.colors.includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() =>
                  update({
                    colors: active
                      ? filters.colors.filter((x) => x !== c.name)
                      : [...filters.colors, c.name],
                  })
                }
                className="flex flex-col items-center gap-0.5 group"
                title={c.name}
              >
                <span
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    active ? "border-primary scale-110" : "border-border group-hover:border-primary/40"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[9px] text-text-muted">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.promo}
            onChange={(e) => update({ promo: e.target.checked })}
            className="w-4 h-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-xs text-text group-hover:text-primary transition-colors">En promotion</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.newOnly}
            onChange={(e) => update({ newOnly: e.target.checked })}
            className="w-4 h-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-xs text-text group-hover:text-primary transition-colors">Nouveautés</span>
        </label>
      </div>

      {/* Reset (desktop only) */}
      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="hidden lg:block w-full py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </>
  );
}

function countActive(f: Filters): number {
  let n = 0;
  if (f.minPrice !== null) n++;
  if (f.maxPrice !== null) n++;
  n += f.sizes.length;
  n += f.colors.length;
  if (f.promo) n++;
  if (f.newOnly) n++;
  return n;
}
