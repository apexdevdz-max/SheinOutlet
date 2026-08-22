"use client";

import { usePathname } from "next/navigation";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isAdminOrLogin = pathname.startsWith("/admin") || pathname.startsWith("/login");

  const isProductPage = pathname.startsWith("/product/");

  // Homepage: no padding (carousel goes under transparent header)
  // Admin/Login: no padding (they have their own layout)
  // Product pages on mobile: pt-14 (56px) to clear fixed mobile header
  // Other pages (including product): md:pt-[130px] to clear fixed desktop header
  const paddingClass = isHomepage || isAdminOrLogin
    ? ""
    : `${isProductPage ? "pt-14" : ""} md:pt-[130px]`;

  return (
    <main className={`flex-1 ${paddingClass}`}>
      {children}
    </main>
  );
}
