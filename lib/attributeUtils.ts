import type { ProductAttribute, ProductAttributeValue, ProductImage } from "./types";

/**
 * Normalizes product attributes from any format (old string[] or new object[])
 * into the enriched ProductAttributeValue[] format.
 * 
 * Old format: { label: "Taille", values: ["S", "M", "L"] }
 * New format: { label: "Taille", values: [{ value: "S", available: true }, ...] }
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
        return { value: v, available: true };
      }
      // New format → ensure defaults
      return {
        value: v.value ?? "",
        available: v.available ?? true,
      };
    }),
  }));
}

/**
 * Normalizes product images from any format (old string[] or new ProductImage[])
 * into the ProductImage[] format with colorTags.
 * 
 * Old format: ["url1", "url2"]
 * New format: [{ url: "url1", colorTags: ["noir"] }, ...]
 */
export function normalizeImages(
  images: (string | ProductImage)[] | undefined | null
): ProductImage[] {
  if (!images || !Array.isArray(images)) return [];

  return images.map((img): ProductImage => {
    if (typeof img === "string") {
      return { url: img, colorTags: [] };
    }
    return {
      url: img.url ?? "",
      colorTags: Array.isArray(img.colorTags) ? img.colorTags : [],
    };
  });
}

/**
 * Get all images tagged with a specific color (case-insensitive).
 * Falls back to ALL images if none are tagged for that color.
 */
export function getImagesForColor(
  images: ProductImage[],
  colorName: string
): ProductImage[] {
  const lower = colorName.toLowerCase().trim();
  const tagged = images.filter((img) =>
    img.colorTags.some((t) => t.toLowerCase().trim() === lower)
  );
  return tagged.length > 0 ? tagged : images;
}

/**
 * Get the first image tagged with a specific color (for use as thumbnail).
 * Returns undefined if no image is tagged.
 */
export function getColorThumbnail(
  images: ProductImage[],
  colorName: string
): ProductImage | undefined {
  const lower = colorName.toLowerCase().trim();
  return images.find((img) =>
    img.colorTags.some((t) => t.toLowerCase().trim() === lower)
  );
}

/**
 * Get plain URL strings from ProductImage[] (for legacy/external usage).
 */
export function getImageUrls(images: ProductImage[]): string[] {
  return images.map((img) => img.url);
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
