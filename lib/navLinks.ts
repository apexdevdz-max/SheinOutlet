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
    { label: "NOUVEAUTÉS", href: "/?filter=new", slug: null },
    { label: "MEILLEURES VENTES", href: "/best-sellers", slug: null },
    ...headerCategories.map((c) => ({
      label: c.name.toUpperCase(),
      href: `/?cat=${c.slug}`,
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
  if (link.slug && activeCat === link.slug) return true;
  if (link.label === "NOUVEAUTÉS" && activeFilter === "new") return true;
  if (link.label === "MEILLEURES VENTES" && pathname === "/best-sellers") return true;
  if (link.label === "PROMOTIONS" && pathname === "/promotions") return true;
  return false;
}
