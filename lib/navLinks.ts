import type { Category } from "@/lib/types";

export interface NavLink {
  label: string;
  href: string;
  slug: string | null;
}

/**
 * Single source of truth for the hamburger menu navigation items.
 * Used by both Header (desktop) and MobileHeader (mobile).
 */
export function buildNavLinks(headerCategories: Category[]): NavLink[] {
  return [
    { label: "ACCUEIL", href: "/", slug: null },
    { label: "NOUVEAUTÉS", href: "/nouveautes", slug: null },
    { label: "MEILLEURES VENTES", href: "/best-sellers", slug: null },
    ...headerCategories.map((c) => ({
      label: c.name.toUpperCase(),
      href: `/${c.slug}`,
      slug: c.slug,
    })),
    { label: "PROMOTIONS", href: "/promotions", slug: null },
  ];
}

/**
 * Shared active-state checker for nav links.
 */
export function isNavLinkActive(
  link: NavLink,
  activeCat: string | null,
  activeFilter: string | null,
  pathname: string
): boolean {
  if (link.href === "/" && !link.slug) return !activeCat && !activeFilter && pathname === "/";
  if (link.slug && (activeCat === link.slug || pathname === `/${link.slug}`)) return true;
  if (link.href === "/nouveautes" && (activeFilter === "new" || pathname === "/nouveautes")) return true;
  if (link.label === "MEILLEURES VENTES" && pathname === "/best-sellers") return true;
  if (link.label === "PROMOTIONS" && (activeFilter === "promo" || pathname === "/promotions")) return true;
  return false;
}
