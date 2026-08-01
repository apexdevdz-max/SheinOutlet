"use client";

import { usePathname } from "next/navigation";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isAdminOrLogin = pathname.startsWith("/admin") || pathname.startsWith("/login");

  // Homepage: no padding (carousel goes under transparent header)
  // Admin/Login: no padding (they have their own layout)
  // Other pages: padding to push content below fixed white header
  const paddingClass = isHomepage || isAdminOrLogin ? "" : "md:pt-[130px]";

  return (
    <main className={`flex-1 ${paddingClass}`}>
      {children}
    </main>
  );
}
