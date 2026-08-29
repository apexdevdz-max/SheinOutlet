import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── Redirect old query-param URLs to clean URLs ──
  const cat = searchParams.get("cat");
  const subcat = searchParams.get("subcat");
  const filter = searchParams.get("filter");

  if (cat) {
    const cleanPath = subcat ? `/categories/${cat}/${subcat}` : `/categories/${cat}`;
    const url = request.nextUrl.clone();
    url.pathname = cleanPath;
    url.searchParams.delete("cat");
    url.searchParams.delete("subcat");
    return NextResponse.redirect(url, 301);
  }

  if (filter === "new") {
    const url = request.nextUrl.clone();
    url.pathname = "/nouveautes";
    url.searchParams.delete("filter");
    return NextResponse.redirect(url, 301);
  }

  if (filter === "promo") {
    const url = request.nextUrl.clone();
    url.pathname = "/promotions";
    url.searchParams.delete("filter");
    return NextResponse.redirect(url, 301);
  }

  // ── Protect /admin routes ──
  if (pathname.startsWith("/admin")) {
    const { supabase, response } = createSupabaseMiddlewareClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match admin routes
    "/admin/:path*",
    // Match root with query params (for redirections)
    "/",
  ],
};
