"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function FooterWrapper() {
  const pathname = usePathname();
  // Hide footer on admin and login pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;
  return <Footer />;
}
