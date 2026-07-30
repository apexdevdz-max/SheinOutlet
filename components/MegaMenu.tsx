"use client";

import Link from "next/link";
import { getSubCategories } from "@/lib/mock-data";

const categoryData: Record<string, { parent_id: string; promoText: string }> = {
  femme: { parent_id: "1", promoText: "Nouveautés Femme - Jusqu'à -70%" },
  homme: { parent_id: "2", promoText: "Collection Homme - Jusqu'à -60%" },
  chaussures: { parent_id: "3", promoText: "Chaussures Tendance - Dès 990 DA" },
  "sacs-accessoires": { parent_id: "4", promoText: "Sacs & Accessoires - Dès 250 DA" },
};

export function MegaMenu({ categorySlug }: { categorySlug: string }) {
  const data = categoryData[categorySlug];
  if (!data) return null;

  const subcategories = getSubCategories(data.parent_id);

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full w-[600px] bg-white rounded-b-xl shadow-2xl border border-border p-6 z-50 animate-fade-in"
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <div className="flex gap-6">
        {/* Subcategories */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-text mb-3 uppercase tracking-wide">
            {categorySlug === "sacs-accessoires" ? "Sacs & Accessoires" : categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories?cat=${sub.slug}`}
                className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-primary-light transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="text-primary text-xs font-medium">{sub.name.slice(0, 3)}</span>
                </div>
                <span className="text-xs text-text-light group-hover:text-primary transition-colors text-center">
                  {sub.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Promo Visual */}
        <div className="w-48 flex-shrink-0">
          <div className="promo-gradient rounded-xl p-4 h-full flex flex-col justify-center items-center text-center">
            <p className="text-sm font-bold text-primary-dark mb-2">{data.promoText}</p>
            <Link
              href={`/categories?cat=${categorySlug}`}
              className="mt-2 inline-block bg-black text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              VOIR TOUT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
