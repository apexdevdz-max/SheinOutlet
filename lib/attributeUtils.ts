import type { ProductAttribute, ProductAttributeValue } from "./types";

/**
 * Normalizes product attributes from any format (old string[] or new object[])
 * into the enriched ProductAttributeValue[] format.
 * 
 * Old format: { label: "Taille", values: ["S", "M", "L"] }
 * New format: { label: "Taille", values: [{ value: "S", available: true, imageUrl: null }, ...] }
 * 
 * This ensures backward compatibility with existing products stored in Supabase JSONB.
 */
export function normalizeAttributes(
  attrs: { label: string; values: (string | ProductAttributeValue)[] }[] | undefined | null
): ProductAttribute[] {
  if (!attrs || !Array.isArray(attrs)) return [];

  return attrs.map((attr) => ({
    label: attr.label || "",
    values: (attr.values || []).map((v): ProductAttributeValue => {
      if (typeof v === "string") {
        // Old format → migrate
        return { value: v, available: true, imageUrl: null };
      }
      // New format → ensure defaults
      return {
        value: v.value ?? "",
        available: v.available ?? true,
        imageUrl: v.imageUrl ?? null,
      };
    }),
  }));
}

/**
 * Check if an attribute label looks like a "color" type attribute.
 */
export function isColorAttribute(label: string): boolean {
  const l = label.toLowerCase();
  return l.includes("couleur") || l.includes("color") || l.includes("coloris");
}

/**
 * Extract plain string values from enriched attributes (for legacy compat fields).
 */
export function extractPlainValues(values: ProductAttributeValue[]): string[] {
  return values.map((v) => v.value);
}
